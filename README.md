# Hono JWT Authentication MVP

This project is a minimal, educational MVP demonstrating how to implement JSON Web Token (JWT) authentication using [Hono](https://hono.dev/), [Bun](https://bun.sh/), and [SQLite](https://sqlite.org/).

It is designed to be easily readable and strictly pedagogical, with line-by-line comments accompanying the source code to explain core concepts like routing, middleware, state isolation, and secure user management.

## Project Architecture

The codebase has been structured focusing on a clean separation of concerns:

- `src/index.ts` - The application entrypoint. Sets up global middleware (`crsf`) and mounts the authentication routes.
- `src/routes/auth.routes.ts` - Defines the POST and GET routes dedicated to authentication endpoints (`/signup`, `/login`, `/logout`, `/auth/me`).
- `src/controllers/auth.controller.ts` - Contains business logic for the routes (hashing passwords, verifying users, assigning cookies).
- `src/middlewares/auth.middleware.ts` - Decodes and verifies incoming requests containing JWT cookies using Hono's `jwt` handler.
- `src/schemas/auth.schema.ts` - Validates incoming request body data using `Zod`.
- `src/db/*` - SQLite database initialization and data access operations.

## Running the Application

1. **Install Dependencies**
   ```bash
   bun install
   ```
2. **Setup Environment**
   Ensure you have `.env` defined at the root with a `JWT_SECRET` variable.
   ```env
   JWT_SECRET=super-secret-key
   BASE_URL=http://localhost:3000/api
   ```
3. **Start the Development Server**
   ```bash
   bun dev
   ```

## Running Tests

We utilize `bun:test` and test the application logic directly (mocking the file-based SQLite database with an in-memory test database).

```bash
bun test
```

## Educational Takeaways

- **Hono Routing**: Notice how we export isolated instances of `Hono()` from `routes/` and `.route()` them inside `index.ts`. This encapsulates endpoint configuration.
- **Middleware Usage**: Observe the `zValidator` validating signup/login body payloads. Invalid requests break early at the middleware layer before touching the controller.
- **Database Architecture**: The application strictly separates initializing the DB singleton from the query functions (`db.ts` vs `queries.ts`).
- **Secure Defaults**: Passwords are continuously hashed with Argon2/bcrypt internally by Bun's APIs (`Bun.password.hash`). Cookies use `HttpOnly`, `SameSite=Lax`, and standard secure parameters.
