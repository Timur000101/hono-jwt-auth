import { sign } from "hono/jwt";
import { CookieOptions } from "hono/utils/cookie";

// Helper function to generate a JSON Web Token (JWT) for a given user ID
export const generateToken = async (userId: string) => {
  // Retrieve the secret key from environment variables
  const secret = process.env.JWT_SECRET;
  
  // Get current time in seconds to set Issued At (iat) and Expiration (exp)
  const now = Math.floor(Date.now() / 1000);
  
  // Define the main payload components
  const payload = {
    // "sub" refers to subject (the user this token represents)
    sub: userId,
    // "iat" is the timestamp when token was issued
    iat: now,
    // "exp" is the timestamp when token expires (1 hour from now)
    exp: now + 1 * 60 * 60,
  };
  
  // Sign the payload asynchronously using Hono's JWT sign method and the secret (!)
  const token = await sign(payload, secret!);
  
  return token;
};

// Common options used throughout the app for setting the authToken cookie
export const cookieOpts = {
  // Prevent client-side JS from accessing the cookie, reducing risk of XSS
  httpOnly: true,
  // Ensure the cookie is only sent over HTTPS (unless in local development)
  secure: process.env.NODE_ENV === "production",
  // Protects against Cross-Site Request Forgery (CSRF)
  sameSite: "Lax", // "Strict" is also a possible value, but "Lax" is a good default for general use
  // The route path for which the cookie is valid
  path: "/",
  // Cookie expiration time in seconds (1 hour)
  maxAge: 3600,
} as CookieOptions;
