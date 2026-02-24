import { Database } from "bun:sqlite";

export const createTestDb = (): Database => {
  // Create an in-memory database
  const db = new Database(":memory:");
  db.run("PRAGMA journal_mode = WAL;");
  
  // Create schema manually instead of relying on heavily mocked db.ts module
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      favorite_color TEXT,
      favorite_animal TEXT
    )
  `);
  
  return db;
};
