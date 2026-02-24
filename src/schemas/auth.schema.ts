import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

// Define an auth schema using Zod for validation
export const authSchema = z.object({
  // The email field must be a valid email string
  email: z.string().email(),
  // The password field must be a string and at least 10 characters long
  password: z
    .string()
    .min(10, { message: "Password must be at least 10 characters long." }),
});

// Export a Zod Validator middleware for Hono to validate the incoming JSON request body
// It uses the authSchema we defined above
export const authValidator = zValidator("json", authSchema, (result, c) => {
  // If the validation fails (e.g., invalid email or short password)
  if (!result.success) {
    // Return a JSON response with status code 400 (Bad Request)
    return c.json(
      {
        // Map the validation errors to an array of error messages
        errors: result.error.issues.map((issue) => issue.message),
      },
      400
    );
  }
});
