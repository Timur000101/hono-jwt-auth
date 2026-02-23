import { Hono } from "hono";
import { signupValidator } from "./schemas/signup.schema";
import { initDb } from "./db/db";
import { insertUser } from "./db/queries";
import { cookieOpts, generateToken } from "./helpers";
import { setCookie } from "hono/cookie";

const app = new Hono();

app.post("/api/signup", signupValidator, async (c) => {
  const db = initDb();

  try {
    const { email, password } = await c.req.json();
    const userId = await insertUser(db, email, password);
    const token = await generateToken(userId);
    setCookie(c, "authToken", token, cookieOpts);

    return c.json({
      message: "User created successfully",
      user: {
        id: userId,
        email,
      },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("UNIQUE constraint failed")
    ) {
      return c.json({ errors: ["Email already exists"] }, 409);
    }
    return c.json({ errors: ["Internal server error"] }, 500);
  }
});

export default app;
