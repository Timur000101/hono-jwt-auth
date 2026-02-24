import { Database } from "bun:sqlite";
import { join } from "path";

// Define the path to the SQLite database file
const dbPath = join(".", "db.sqlite");

// Maintain a singleton connection to the database
let db: Database;

// Function to initialize and retrieve the database connection
export const initDb = () => {
  // If the database connection hasn't been established yet
  if (!db) {
    // Create a new Database instance pointing to dbPath
    db = new Database(dbPath);
    
    // Set Write-Ahead Logging (WAL) mode for better concurrency and performance
    db.run("PRAGMA journal_mode = WAL;");

    // Apply the schema (create tables if they don't exist)
    applySchema(db);
  }

  // Return the active connection
  return db;
};

// Function to safely apply the required schema for our database
export const applySchema = async (dbInstance: Database) => {
  // Run an initial query to create the "users" table
  dbInstance.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      favorite_color TEXT,
      favorite_animal TEXT
    )
  `);
};
