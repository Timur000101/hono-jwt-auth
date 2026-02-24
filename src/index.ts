import { Hono } from "hono";
import { csrf } from "hono/csrf";
import authRoutes from "./routes/auth.routes";

// Initialize the main Hono application instance
const app = new Hono();

app.basePath('/api')
// Global Middlewares

// Use CSRF (Cross-Site Request Forgery) protection on all /api/* routes
// This helps prevent malicious sites from executing actions on behalf of the user
.use("/*", csrf())

// Routes

// Mount the authentication routes under the /api prefix
// This allows authRoutes definitions to be relative (e.g., /signup becomes /api/signup)
.route("/auth", authRoutes);

// Export the app instance so it can be served by the runtime (e.g., Bun)
// Bun looks for a default export that has a fetch handler (which Hono provides)
export default app;
