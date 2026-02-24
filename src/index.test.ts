import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import { Database } from "bun:sqlite";

// Mock the database initialization before importing the app
let db: Database;
mock.module("../src/db/db.ts", () => {
  return {
    // Return our in-memory test database instead of the real file-based one
    initDb: () => db,
    applySchema: () => {},
  };
});

// Import app after mocking so that any internal calls to initDb() get our mock
import app from "./index";
import { createTestDb } from "./test/test-db";
import { loginReq, logoutReq, signupReq } from "./test/test-helpers";

beforeEach(() => {
  // Create a fresh in-memory database before each test
  db = createTestDb();
});

afterEach(() => {
  // Close the database to clean up resources after each test
  db.close();
});

describe("signup endpoint", () => {
  it("should signup a user", async () => {
    // Prepare a signup request
    const req = signupReq("test@example.com", "d1XQe5Xm5ZSB11R");
    
    // Pass the request directly to the Hono app instance
    const res = await app.request(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data).toEqual({
      message: "User created successfully",
      user: {
        id: expect.any(String),
        email: expect.any(String),
      },
    });

    // Verify a cookie was set
    const cookie = res.headers.get("set-cookie");
    expect(cookie).toBeDefined();
  });

  it("should return 409 if email already exists", async () => {
    // First signup
    const req = signupReq();
    const res = await app.request(req);
    expect(res.status).toBe(200);

    // Second signup with the same email
    const req2 = signupReq();
    const res2 = await app.request(req2);
    const json = await res2.json();
    
    expect(res2.status).toBe(409);
    expect(json).toEqual({
      errors: ["Email already exists"],
    });
  });

  it("should return error if missing email or password", async () => {
    const req = signupReq("", "");
    const res = await app.request(req);
    const json = await res.json();
    
    expect(res.status).toBe(400);
    expect(json).toEqual({
      errors: [
        "Invalid email address",
        "Password must be at least 10 characters long.",
      ],
    });
  });
});

describe("login endpoint", () => {
  it("should login a user", async () => {
    // Signup a user first to ensure they exist
    const req = signupReq();
    const res = await app.request(req);

    // Attempt to login using the same credentials
    const req2 = loginReq();
    const res2 = await app.request(req2);
    const json = await res2.json();
    
    expect(res2.status).toBe(200);
    expect(json).toEqual({
      message: "Login successful",
      user: { id: expect.any(String), email: "test@test.com" },
    });

    const cookies = res.headers.get("set-cookie");
    expect(cookies).toBeDefined();
  });

  it("should return 400 if email or password is missing", async () => {
    const req = loginReq("", "");
    const res = await app.request(req);
    const json = await res.json();
    
    expect(res.status).toBe(400);
    expect(json).toEqual({
      errors: [
        "Invalid email address",
        "Password must be at least 10 characters long.",
      ],
    });
  });

  it("should return 401 if incorrect password provided", async () => {
    // Signup a user
    const req = signupReq();
    await app.request(req);

    // Login with incorrect credentials
    const req2 = loginReq("test@test.com", "password456");
    const res = await app.request(req2);
    const json = await res.json();
    
    expect(res.status).toBe(401);
    expect(json).toEqual({
      errors: ["Invalid credentials"],
    });
  });
});

describe("logout", () => {
  it("should logout a user", async () => {
    const logout = logoutReq();
    const res = await app.request(logout);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json).toEqual({
      message: "Logout successful",
    });

    // Check that the returned cookie instructs the browser to clear it (e.g. maxAge=0 or past expires)
    const cookies = res.headers.get("set-cookie");
    expect(cookies).toMatch(/authToken=;/);
  });
});
