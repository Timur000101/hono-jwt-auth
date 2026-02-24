import { Database } from "bun:sqlite";
import { type UUID, randomUUID } from "crypto";

// Insert a new user into the database
export const insertUser = async (
  db: Database,
  email: string,
  password: string,
) => {
  // Generate a random UUID for the new user
  const userId = randomUUID();

  // Hash the password asynchronously before storing it
  const passwordHash = await Bun.password.hash(password);

  // Prepare the INSERT query
  // We use RETURNING id to get the generated ID back from SQLite
  const insertQuery = db.query(
    `
      INSERT INTO users (id, email, password_hash)
      VALUES (?, ?, ?)
      RETURNING id
    `,
  );

  // Execute the query using .get() because we only expect one returned row
  const user = insertQuery.get(userId, email, passwordHash) as { id: UUID };
  
  // Return the inserted user ID
  return user.id;
};


// Fetch a user from the database by their email address
export const getUserByEmail = (db: Database, email: string) => {
  // Prepare the SELECT query for authentication
  const userQuery = db.query(
    "SELECT id, password_hash FROM users WHERE email = ?"
  );
  
  // Execute the query looking for the given email
  const user = userQuery.get(email) as {
    id: string;
    password_hash: string;
  } | null;
  
  // Return the user object or null if not found
  return user;
};

// Fetch a user from the database by their unique ID
export const getUserById = (db: Database, id: string) => {
  // Prepare the SELECT query for profile details
  const userQuery = db.query("SELECT id, email FROM users WHERE id = ?");
  
  // Execute the query looking for the given ID
  const user = userQuery.get(id) as {
    id: string;
    email: string;
  } | null;
  
  // Return the user object or null if not found
  return user;
};
