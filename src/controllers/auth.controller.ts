import { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { initDb } from "../db/db";
import { getUserByEmail, getUserById, insertUser } from "../db/queries";
import { cookieOpts, generateToken } from "../helpers";

// Handler for the signup endpoint
export const signupController = async (c: Context) => {
  // Retrieve the initialized database instance
  const db = initDb();

  try {
    // We can assume the body is valid JSON because of the authValidator middleware
    const { email, password } = await c.req.json();
    
    // Insert the new user into the database and get their new unique ID
    const userId = await insertUser(db, email, password);
    
    // Generate a JWT for the newly created user
    const token = await generateToken(userId);
    
    // Set an HTTP-only cookie with the JWT
    setCookie(c, "authToken", token, cookieOpts);

    // Return a successful JSON response
    return c.json({
      message: "User created successfully",
      user: {
        id: userId,
        email,
      },
    });
  } catch (error) {
    // If there's an error during signup, check if it's a unique constraint violation (email already used)
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      // 409 Conflict status code for duplicate resource
      return c.json({ errors: ["Email already exists"] }, 409);
    }
    // Generic error fallback with 500 Internal Server Error status
    return c.json({ errors: ["Internal server error"] }, 500);
  }
};

// Handler for the login endpoint
export const loginController = async (c: Context) => {
  // Retrieve the initialized database instance
  const db = initDb();
  
  // Extract the 'email' and 'password' from the JSON request body
  // We can assume the structure is valid because of the authValidator middleware
  const { email, password } = await c.req.json();

  try {
    // Query the user by email from the database
    const user = getUserByEmail(db, email);
    
    // If the user is not found, return 401 Unauthorized
    if (!user) {
      return c.json({ errors: ["Invalid credentials"] }, 401);
    }
    
    // Verify the provided password against the hashed password stored in the database
    // Bun.password.verify uses Argon2id or bcrypt under the hood
    const passwordMatch = await Bun.password.verify(password, user.password_hash);
    
    // If the password does not match, return 401 Unauthorized
    if (!passwordMatch) {
      return c.json({ errors: ["Invalid credentials"] }, 401);
    }
    
    // If the password matches, generate a new JWT for the user ID
    const token = await generateToken(user.id);
    
    // Store the JWT in a cookie
    setCookie(c, "authToken", token, cookieOpts);
    
    // Send a success response with the user's basic info
    return c.json({
      message: "Login successful",
      user: { id: user.id, email: email },
    });
  } catch (error) {
    console.error(error);
    // Generic error fallback with 500 Internal Server Error status
    return c.json({ error: "Internal Server Error" }, 500);
  }
};

// Handler for the logout endpoint
export const logoutController = async (c: Context) => {
  // Delete the 'authToken' cookie by setting its maxAge to 0/expiring it
  deleteCookie(c, "authToken", {
    path: "/",
    // Secure cookies are only sent over HTTPS (true in production)
    secure: process.env.NODE_ENV === "production",
    // SameSite=Lax prevents cross-site request forgery while allowing top-level navigation
    sameSite: "Lax",
    // HttpOnly prevents client-side JavaScript from accessing the cookie
    httpOnly: true,
  });

  // Return a success JSON response
  return c.json({ message: "Logout successful" });
};

// Handler for getting the currently authenticated user's profile
export const meController = async (c: Context) => {
  // Retrieve the initialized database instance
  const db = initDb();
  
  // Get the decoded JWT payload that was attached to the Context by the authMiddleware
  const payload = c.get("jwtPayload");

  try {
    // Fetch the user data from the database using the "sub" (subject) claim from the JWT, which is our user ID
    const user = getUserById(db, payload.sub);
    
    // If the user doesn't exist in the database, return 404 Not Found
    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Return the user's identity details
    return c.json({
      id: user.id,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user data: ", error);
    // Generic error fallback with 500 Internal Server Error status
    return c.json({ error: "Internal Server Error" }, 500);
  }
};
