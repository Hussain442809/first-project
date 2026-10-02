# AGENTS.md

## Project overview

This is a Node.js + Express API using PostgreSQL. The app exposes user, book, and loan endpoints and relies on JWT-based authentication for protected requests.

## Key commands

- Install dependencies: `npm install`
- Start the server: `npm start`
- Run tests: there are no automated tests configured yet; if adding tests, prefer a focused Node test runner or Jest setup and keep them near the relevant feature.

## Architecture

- `server.js`: registers routes and starts the app
- `controllers/`: HTTP request handlers
- `business/`: service logic and business rules
- `models/`: database query layer
- `middleware/`: request validation and auth
- `config/dp.js`: PostgreSQL pool setup

## Authentication flow

The auth flow is implemented in the following places:

- `business/userService.js`: user registration and login logic
- `middleware/auth.js`: JWT verification middleware
- `controllers/authController.js`: route handlers for register/login

### Login

1. The client sends `email` and `password`.
2. `userService.login()` looks up the user by email.
3. It checks the password with `bcrypt.compare()` against the stored `password_hash`.
4. If valid, it creates a JWT:
   - payload: `{ userId, email }`
   - secret: `process.env.JWT_SECRET`
   - expiry: `1h`
5. The API returns the token plus a safe subset of the user object.

### Protected routes

1. Clients must send the token as `Authorization: Bearer <token>`.
2. `middleware/auth.js` splits the header into scheme and token.
3. It calls `jwt.verify(token, process.env.JWT_SECRET)`.
4. If verification succeeds, it stores the decoded payload on `req.user` and calls `next()`.
5. If the header is missing or invalid, the API responds with `401`.

## Important conventions

- `JWT_SECRET` must be defined in the environment before any authenticated requests are processed.
- Passwords are never stored in plain text; they are hashed with `bcryptjs` during registration.
- Do not place auth checks in the controller when the same logic belongs in middleware; keep route protection in `middleware/auth.js`.
- When adding new protected routes, attach the `authenticate` middleware before the controller logic.
- Keep business logic in `business/` and database logic in `models/` instead of mixing them into controllers.

## Example auth usage

```http
Authorization: Bearer <jwt-token>
```

In Express, use the middleware pattern shown by the project:

```js
const authenticate = require("./middleware/auth");
app.get("/users/me", authenticate, userController.getCurrentUser);
```

## Notes for AI coding agents

- Prefer the existing service-model-controller layering when adding functionality.
- Reuse the project’s validation and error style rather than inventing a parallel pattern.
- Check `process.env.JWT_SECRET` and the current auth middleware whenever changing auth-sensitive logic.
- Keep responses consistent with the current `401` and error messaging style.
