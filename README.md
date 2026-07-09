# ScholarLogic Backend

Production-ready, secure, modular REST API for the **ScholarLogic** educational
platform. Built with Node.js, Express, MongoDB (Mongoose), JWT auth, Zod
validation, Cloudinary, and Nodemailer.

## Features

- **Authentication**: Register, login, refresh-token rotation, logout (single &
  all devices), email verification, forgot/reset password, change password.
- **Authorization**: Role-Based Access Control (Student / Teacher / Admin) with
  reusable `RequireAuth`, `RequireRole`, `RequirePermission` middleware.
- **Users**: Profile, avatar upload (Cloudinary), update, delete, admin
  user management.
- **Content**: Courses (CRUD + search + enrollment), Subjects, Assignments
  (submission & grading), Resources.
- **Notifications**: In-app notifications with read/unread state.
- **Admin**: Dashboard analytics, activity logs.
- **Utilities**: Pagination, reusable `QueryBuilder` (filter/sort/search),
  token generation, cookie options, structured logging, ApiError/ApiResponse.
- **Security**: Helmet, CORS, rate limiting, input sanitization, bcrypt
  password hashing, HTTP-only secure cookies, token rotation.
- **Docs**: Swagger/OpenAPI at `/api-docs`.
- **Tests**: Jest + Supertest with in-memory MongoDB.

## Project Structure

```
src/
├── config/         # env config, database, cloudinary, mail
├── controllers/    # request handling (thin)
├── models/         # Mongoose schemas
├── routes/         # Express routers
├── middlewares/    # auth, rbac, validation, rate-limit, sanitize, error
├── services/       # business logic
├── validators/     # Zod schemas
├── utils/          # ApiError, ApiResponse, pagination, tokens, logger
├── helpers/        # shared helpers
├── constants/      # enums (roles, statuses)
├── templates/      # email HTML templates
├── docs/           # Swagger spec + UI mount
├── scripts/        # seedAdmin.js
├── tests/          # Jest test suites
├── app.js          # Express app (middleware stack + routes)
├── server.js       # boot + graceful shutdown
└── index.js        # entry point
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in MONGODB_URI, JWT secrets, Cloudinary, email, etc.

# 3. Run database seed (optional, creates admin)
npm run seed

# 4. Start the server
npm run dev
```

Server runs on `PORT` (default 3000). Health check: `GET /health`.
API docs: `GET /api-docs`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the server |
| `npm test` | Run Jest test suite (ESM) |
| `npm run lint` | Lint with ESLint |
| `npm run format` | Format with Prettier |
| `npm run seed` | Seed the initial admin user |

## API Overview

All endpoints are prefixed with `/api/v1`.

| Resource | Base Path | Auth |
|----------|-----------|------|
| Auth | `/auth` | Public (except change-password, logout-all) |
| Users | `/users` | Self / Admin |
| Courses | `/courses` | Mixed |
| Subjects | `/subjects` | Mixed |
| Assignments | `/assignments` | Mixed |
| Resources | `/resources` | Authenticated |
| Notifications | `/notifications` | Authenticated |
| Admin | `/admin` | Admin only |

### Example: Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "email": "ada@example.com",
  "password": "Str0ng!Pass"
}
```

Response sets an HTTP-only `refreshToken` cookie and returns a JSON body with
`accessToken` and the user object.

### Authentication Header

Protected routes accept either:
- `Authorization: Bearer <accessToken>`, or
- the `refreshToken` HTTP-only cookie (used only at `POST /auth/refresh`).

## Environment Variables

See `.env.example` for the full list and descriptions. Required in production:
`MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `COOKIE_SECRET`,
`CLOUDINARY_*`, `EMAIL_*`, `CLIENT_URL`, `CORS_ORIGIN`.

## Deployment (Render)

1. Push to GitHub and connect the repo in Render as a **Blueprint** using
   `render.yaml`.
2. Set the required environment variables in the Render dashboard (secrets are
   never committed).
3. Render auto-runs `npm install` and `npm start`, with `/health` as the health
   check.
4. After first deploy, run the seed once (e.g. via Render's shell) or set
   `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars and run `npm run seed`.

A `Dockerfile` is also provided for container-based deployment.

## Testing

Tests use an in-memory MongoDB. On a machine with network access,
`mongodb-memory-server` downloads a binary automatically. In CI you can instead
point `MONGODB_URI` to a MongoDB instance to skip the download.

```bash
npm test
```

## Security Notes

- Passwords hashed with bcrypt (cost factor from `BCRYPT_ROUNDS`).
- Refresh tokens are stored hashed (SHA-256) and rotated on every use; old
  tokens are immediately revoked.
- Rate limiting protects auth endpoints (10 attempts / 15 min) and globally.
- Sensitive fields (passwords, tokens) are never returned in responses or logs.
- Stack traces are hidden outside development.
