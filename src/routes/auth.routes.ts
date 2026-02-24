import { Hono } from "hono";
import { authValidator } from "../schemas/auth.schema";
import {
  loginController,
  logoutController,
  meController,
  signupController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

// Create a new Hono router specifically for auth endpoints
const authRoutes = new Hono();

// Define the POST /signup route
// We use the authValidator middleware to validate the request body before it reaches the controller
authRoutes.post("/signup", authValidator, signupController);

// Define the POST /login route
// Also uses authValidator since the payload (email, password) is the same
authRoutes.post("/login", authValidator, loginController);

// Define the POST /logout route
// This could optionally be protected by authMiddleware, but it's safe to clear cookies regardless
authRoutes.post("/logout", logoutController);

// Define the GET /auth/me route
// This route is protected by authMiddleware, which verifies the JWT before executing meController
authRoutes.get("/me", authMiddleware, meController);

export default authRoutes;
