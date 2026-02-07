use std::path::{Path, PathBuf};
use anyhow::Result;
use rusqlite::{Connection, params};
use flate2::write::GzEncoder;
use flate2::read::GzDecoder;
use flate2::Compression;
use std::io::{Read, Write};
use std::fs;
use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use rayon::prelude::*;
use std::sync::{Arc, Mutex};

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
        
        // Removed index_entries table to reduce bloat
        
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
        
        // Process files
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
                
                // Insert file record
                conn.execute(
                    "INSERT INTO files (project_id, path, content_hash, compressed_size) 
                     VALUES (?1, ?2, ?3, ?4)
                     ON CONFLICT(project_id, path) DO UPDATE SET
                     content_hash = excluded.content_hash,
                     compressed_size = excluded.compressed_size,
                     created_at = CURRENT_TIMESTAMP",
                    params![project_id, relative_path, hash, compressed.len()],
                )?;
                
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
        
        // Get all files for the project
        let mut stmt = conn.prepare("SELECT path, content_hash FROM files WHERE project_id = ?1")?;
        let files_iter = stmt.query_map(params![project_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?))
        })?;
        
        let files: Vec<(String, String)> = files_iter.collect::<Result<_, _>>()?;
        let project_dir = self.projects_path.join(project_name);
        
        // Parallel search using Rayon
        let results = Arc::new(Mutex::new(Vec::new()));
        
        files.par_iter().for_each(|(path, hash)| {
            let storage_path = project_dir.join(hash);
            if let Ok(compressed) = fs::read(&storage_path) {
                if let Ok(content) = self.decompress_bytes(&compressed) {
                    for (i, line) in content.lines().enumerate() {
                        if line.contains(query) {
                            let mut result = SearchResult {
                                file_path: path.clone(),
                                line_number: (i + 1) as i32,
                                line_content: line.to_string(),
                                full_context: None,
                            };
                            
                            if whole_context {
                                result.full_context = Some(content.clone());
                            }
                            
                            if let Ok(mut lock) = results.lock() {
                                if lock.len() < 100 { // Limit results
                                    lock.push(result);
                                }
                            }
                        }
                    }
                }
            }
        });
        
        let final_results = Arc::try_unwrap(results).unwrap().into_inner().unwrap();
        Ok(final_results)
    }
    
    fn compress(&self, data: &str) -> Result<Vec<u8>> {
        let mut encoder = GzEncoder::new(Vec::new(), Compression::default());
        encoder.write_all(data.as_bytes())?;
        Ok(encoder.finish()?)
    }

    fn decompress_bytes(&self, data: &[u8]) -> Result<String> {
        let mut decoder = GzDecoder::new(data);
        let mut s = String::new();
        decoder.read_to_string(&mut s)?;
        Ok(s)
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
