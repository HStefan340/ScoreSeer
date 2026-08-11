# ScoreSeer — Phase 1: Backend & Authentication

The foundation of the application: moving from "data in a database" to "a running app that responds". This phase built the backend, connected it to PostgreSQL, and implemented a complete, secure authentication system (registration, login, JWT, protected endpoints, and Google sign-in on the backend side).

---

## What Was Built

- **.NET Web API project** connected to PostgreSQL through Entity Framework Core (database-first)
- **User registration** with BCrypt password hashing and duplicate email/username validation
- **Login** with password verification and security-conscious error messages
- **JWT generation** on successful login (the "digital wristband")
- **Protected endpoints** using `[Authorize]` that verify the token on every request
- **Google login** endpoint on the backend (token verification + account create/link + JWT), ready to be wired to the frontend later

---

## Tech Stack Used in This Phase

### C# / .NET 9 — Backend
The Web API project (`ScoreSeer.Api`), controllers, services, and business logic.

### Entity Framework Core (+ Npgsql) — Database access
Generated the model classes from the existing tables (database-first scaffolding) and handles all communication with PostgreSQL, translating C# into SQL.

### PostgreSQL (Docker) — Database
The same 9-table schema from Phase 0, running in a Docker container, now read and written by the backend.

### BCrypt — Password hashing
Passwords are never stored in plain text; only their irreversible hash is saved.

### JWT (JwtBearer) — Authentication tokens
Stateless authentication: a signed token issued at login and verified on each protected request.

### Google.Apis.Auth — Google sign-in
Verifies Google ID tokens against the app's Client ID, then creates or links a local account.

---

## How It Was Done — Step by Step

### 1. Project setup and database connection
- Created the Web API with `dotnet new webapi -n ScoreSeer.Api`
- Installed `Npgsql.EntityFrameworkCore.PostgreSQL` and `Microsoft.EntityFrameworkCore.Design` (pinned to version 9 for .NET 9 compatibility)
- Chose **database-first**: since the tables already existed, EF scaffolded the model classes from the live database (`dotnet ef dbcontext scaffold`), producing one class per table plus `ScoreSeerDbContext`
- Moved the connection string (with the DB password) into `appsettings.Development.json`, which is git-ignored, and removed the auto-generated password from the code
- Registered `ScoreSeerDbContext` in `Program.cs`, reading the connection string from configuration

### 2. First controller (read-only proof)
- Enabled controllers in `Program.cs` (`AddControllers` / `MapControllers`)
- Created `TeamsController` with a single GET endpoint returning all teams
- Confirmed the full round-trip: database → EF → controller → API → browser

### 3. User registration
- Installed `BCrypt.Net-Next`
- Introduced **DTOs** (`RegisterDto`) to control exactly which fields are accepted from the client
- Built `AuthController` with `POST /api/auth/register`: validates that email and username are free, hashes the password with BCrypt, creates the user, and returns public info only (never the hash)

### 4. Login
- Added `LoginDto` (email + password only)
- Added `POST /api/auth/login`: finds the user by email and verifies the password with `BCrypt.Verify`
- Used a single generic "Invalid email or password" message for both wrong password and unknown email, to avoid leaking which emails are registered

### 5. JWT generation
- Installed `Microsoft.AspNetCore.Authentication.JwtBearer` (version 9)
- Stored the signing key, issuer, and audience in `appsettings.Development.json` under `Jwt`
- Created a `TokenService` that builds a signed JWT containing the user's id, email, and username, with a 7-day expiry
- Registered the service and returned the token from the login endpoint

### 6. Protecting endpoints
- Configured JWT validation in `Program.cs` (`AddAuthentication` + `AddJwtBearer`) with all checks: issuer, audience, lifetime, and signature
- Enabled the middleware in the correct order: `UseAuthentication` before `UseAuthorization`
- Added a protected `GET /api/auth/me` endpoint marked with `[Authorize]`, which extracts the user id from the token's claims and returns the current user

### 7. Google login (backend side)
- Registered an OAuth client in Google Cloud Console and obtained a Client ID
- Stored the Client ID in configuration
- Installed `Google.Apis.Auth`
- Added `POST /api/auth/google`: verifies the Google ID token against the Client ID, then either recognises an existing Google user, links Google to an existing email account, or creates a brand-new account — and finally issues the app's own JWT, identical to a normal login

---

## Key Concepts Learned

- **Database-first vs code-first** — starting from existing tables and generating the code to match them.
- **Secrets belong in configuration, not source code** — the DB password, JWT key, and Google Client ID live in a git-ignored file, with a committed `.example` template documenting the required structure.
- **Password hashing** — passwords are stored as irreversible BCrypt hashes; login re-hashes and compares rather than decrypting.
- **JWT as a stateless "wristband"** — issued at login, presented on each request; the payload is readable by anyone, but the signature (made with a secret key) makes it impossible to forge.
- **Middleware order matters** — authentication ("who are you?") must run before authorization ("are you allowed?").
- **Claims can be silently remapped** — .NET rewrites standard claims like `sub` into long URIs, which must be accounted for when reading the user id from the token.

---

## Debugging Lessons

- **Config keys are case-sensitive** — `"jwt:Key"` and `"Jwt:Key"` are different keys; a lowercase typo returned a null signing key and rejected every token.
- **Package versions must match the .NET version** — EF/Npgsql/JwtBearer packages had to be pinned to 9.x for .NET 9; global tools (`dotnet-ef`) do not.
- **Restart the .NET server after code changes** — `Ctrl + C` then `dotnet run`; the Docker database stays running throughout.

---

## API Endpoints (Phase 1)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/teams` | none | List all teams (read-only proof) |
| POST | `/api/auth/register` | none | Create a new account (email + password) |
| POST | `/api/auth/login` | none | Log in and receive a JWT |
| POST | `/api/auth/google` | none | Log in / register via Google, receive a JWT |
| GET | `/api/auth/me` | JWT | Return the current authenticated user |

---

## What Remains for Later

- **Google login end-to-end test** — the backend is complete; full testing happens once the React frontend provides the Google button and a real ID token (Phase 6).
- **Username selection after Google signup** — new Google accounts get an auto-generated username to be changed later.
