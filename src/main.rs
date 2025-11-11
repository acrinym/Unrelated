use contextdb::ContextDB;
use clap::{Parser, Subcommand};
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "contextdb")]
#[command(about = "Ripgrep-powered context storage for AI agents")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new project
    Init {
        /// Project name
        #[arg(short, long)]
        project: String,
        /// Source path to index
        #[arg(short, long)]
        path: PathBuf,
    },
    /// Ingest files into a project
    Ingest {
        /// Project name
        #[arg(short, long)]
        project: String,
        /// Files to ingest
        files: Vec<PathBuf>,
    },
    /// Search within a project
    Search {
        /// Search query
        query: String,
        /// Project name
        #[arg(short, long)]
        project: String,
        /// Return whole context (full file content)
        #[arg(long)]
        whole_context: bool,
    },
    /// List all projects
    List,
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    
    // Initialize ContextDB
    let base_path = PathBuf::from("D:/tools/contextdb");
    let db = ContextDB::new(&base_path)?;
    
    match cli.command {
        Commands::Init { project, path } => {
            db.init_project(&project, &path)?;
            println!("✅ Initialized project '{}'", project);
        }
        Commands::Ingest { project, files } => {
            let count = db.ingest(&project, &files)?;
            println!("✅ Ingested {} files into project '{}'", count, project);
        }
        Commands::Search { query, project, whole_context } => {
            let results = db.search(&project, &query, whole_context)?;
            println!("Found {} results:", results.len());
            for result in results {
                println!("{}:{}: {}", result.file_path, result.line_number, result.line_content);
                if whole_context && result.full_context.is_some() {
                    println!("--- Full Context ---");
                    println!("{}", result.full_context.as_ref().unwrap());
                    println!("--- End Context ---");
                }
            }
        }
        Commands::List => {
            let projects = db.list_projects()?;
            println!("Projects:");
            for project in projects {
                println!("  - {}", project);
            }
        }
    }
    
    Ok(())
}

