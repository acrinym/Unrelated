use std::path::{Path, PathBuf};
use anyhow::Result;
use rusqlite::{Connection, params};
use zstd::stream::{Encoder, Decoder};
use std::io::{Read, Write};
use std::fs;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

/// ContextDB - Ripgrep-powered context storage
pub struct ContextDB {
    db_path: PathBuf,
    projects_path: PathBuf,
}

impl ContextDB {
    pub fn new(base_path: &Path) -> Result<Self> {
        let db_path = base_path.join("contextdb.db");
        let projects_path = base_path.join("projects");
        
        // Create directories
        fs::create_dir_all(&projects_path)?;
        
        let db = ContextDB {
            db_path,
            projects_path,
        };
        
        // Initialize database
        db.init_db()?;
        
        Ok(db)
    }
    
    fn init_db(&self) -> Result<()> {
        let conn = Connection::open(&self.db_path)?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                path TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS files (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_id INTEGER NOT NULL,
                path TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                compressed_size INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(project_id) REFERENCES projects(id),
                UNIQUE(project_id, path)
            )",
            [],
        )?;
        
        conn.execute(
            "CREATE TABLE IF NOT EXISTS index_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                file_id INTEGER NOT NULL,
                line_number INTEGER NOT NULL,
                line_content TEXT NOT NULL,
                FOREIGN KEY(file_id) REFERENCES files(id)
            )",
            [],
        )?;
        
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_line_content ON index_entries(line_content)",
            [],
        )?;
        
        Ok(())
    }
    
    /// Initialize a new project
    pub fn init_project(&self, name: &str, source_path: &Path) -> Result<()> {
        let conn = Connection::open(&self.db_path)?;
        
        // Create project directory
        let project_dir = self.projects_path.join(name);
        fs::create_dir_all(&project_dir)?;
        
        // Insert project record
        conn.execute(
            "INSERT OR REPLACE INTO projects (name, path, updated_at) VALUES (?1, ?2, CURRENT_TIMESTAMP)",
            params![name, source_path.to_string_lossy()],
        )?;
        
        Ok(())
    }
    
    /// Ingest files into a project
    pub fn ingest(&self, project_name: &str, file_paths: &[PathBuf]) -> Result<usize> {
        let conn = Connection::open(&self.db_path)?;
        
        // Get project ID
        let project_id: i64 = conn.query_row(
            "SELECT id FROM projects WHERE name = ?1",
            params![project_name],
            |row| row.get(0),
        )?;
        
        let project_dir = self.projects_path.join(project_name);
        let mut ingested = 0;
        
        for file_path in file_paths {
            if let Ok(content) = fs::read_to_string(file_path) {
                // Compress content
                let compressed = self.compress(&content)?;
                
                // Calculate hash
                let mut hasher = DefaultHasher::new();
                content.hash(&mut hasher);
                let hash = format!("{:x}", hasher.finish());
                
                // Store compressed file
                let relative_path = file_path.file_name()
                    .unwrap_or_default()
                    .to_string_lossy()
                    .to_string();
                let storage_path = project_dir.join(&hash);
                fs::write(&storage_path, &compressed)?;
                
                // Insert file record (use INSERT OR IGNORE to handle duplicates)
                let file_id: i64 = match conn.query_row(
                    "SELECT id FROM files WHERE project_id = ?1 AND path = ?2",
                    params![project_id, relative_path],
                    |row| row.get(0),
                ) {
                    Ok(id) => id,
                    Err(_) => {
                        // File doesn't exist, insert it
                        conn.execute(
                            "INSERT INTO files (project_id, path, content_hash, compressed_size) VALUES (?1, ?2, ?3, ?4)",
                            params![project_id, relative_path, hash, compressed.len()],
                        )?;
                        conn.last_insert_rowid()
                    }
                };
                
                // Clear old index entries for this file
                conn.execute(
                    "DELETE FROM index_entries WHERE file_id = ?1",
                    params![file_id],
                )?;
                
                // Index lines
                for (line_num, line) in content.lines().enumerate() {
                    conn.execute(
                        "INSERT INTO index_entries (file_id, line_number, line_content) VALUES (?1, ?2, ?3)",
                        params![file_id, line_num as i32 + 1, line],
                    )?;
                }
                
                ingested += 1;
            }
        }
        
        Ok(ingested)
    }
    
    /// Search within a project
    pub fn search(&self, project_name: &str, query: &str, whole_context: bool) -> Result<Vec<SearchResult>> {
        let conn = Connection::open(&self.db_path)?;
        
        // Get project ID
        let project_id: i64 = conn.query_row(
            "SELECT id FROM projects WHERE name = ?1",
            params![project_name],
            |row| row.get(0),
        )?;
        
        let mut results = Vec::new();
        
        // Search index (ripgrep-like pattern matching)
        let pattern = format!("%{}%", query);
        let mut stmt = conn.prepare(
            "SELECT f.path, e.line_number, e.line_content, f.content_hash
             FROM index_entries e
             JOIN files f ON e.file_id = f.id
             WHERE f.project_id = ?1 AND e.line_content LIKE ?2
             LIMIT 100"
        )?;
        
        let rows = stmt.query_map(params![project_id, pattern], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, i32>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        })?;
        
        for row in rows {
            let (file_path, line_num, line_content, hash) = row?;
            
            let mut result = SearchResult {
                file_path,
                line_number: line_num,
                line_content,
                full_context: None,
            };
            
            // If whole context requested, decompress and return full file
            if whole_context {
                let project_dir = self.projects_path.join(project_name);
                let storage_path = project_dir.join(&hash);
                if let Ok(compressed) = fs::read(&storage_path) {
                    if let Ok(full_content) = self.decompress(&compressed) {
                        result.full_context = Some(full_content);
                    }
                }
            }
            
            results.push(result);
        }
        
        Ok(results)
    }
    
    fn compress(&self, data: &str) -> Result<Vec<u8>> {
        let mut encoder = Encoder::new(Vec::new(), 3)?;
        encoder.write_all(data.as_bytes())?;
        Ok(encoder.finish()?)
    }
    
    fn decompress(&self, data: &[u8]) -> Result<String> {
        let mut decoder = Decoder::new(data)?;
        let mut decompressed = String::new();
        decoder.read_to_string(&mut decompressed)?;
        Ok(decompressed)
    }
    
    pub fn list_projects(&self) -> Result<Vec<String>> {
        let conn = Connection::open(&self.db_path)?;
        let mut stmt = conn.prepare("SELECT name FROM projects")?;
        let rows = stmt.query_map([], |row| row.get::<_, String>(0))?;
        
        let mut projects = Vec::new();
        for row in rows {
            projects.push(row?);
        }
        Ok(projects)
    }
}

#[derive(Debug, Clone)]
pub struct SearchResult {
    pub file_path: String,
    pub line_number: i32,
    pub line_content: String,
    pub full_context: Option<String>,
}

