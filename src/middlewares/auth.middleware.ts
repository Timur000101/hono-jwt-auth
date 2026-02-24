import { jwt } from "hono/jwt";

// Export the authentication middleware using the Hono JWT middleware
export const authMiddleware = jwt({
  // The secret key used to sign and verify the JSON Web Token.
  // We use the non-null assertion operator (!) to assert JWT_SECRET is defined in .env
  secret: process.env.JWT_SECRET!,
  // Tell the middleware to look for the token inside a cookie named 'authToken'
  cookie: "authToken",
  // The algorithm used for signing the JWT (HMAC using SHA-256)
  alg: "HS256",
});
