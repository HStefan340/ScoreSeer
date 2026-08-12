# ScoreSeer — Phase 3: Prediction Core Loop

The heart of the application. This phase connected everything built so far: an authenticated user (JWT from Phase 1) submits a predicted score for a match (data from Phase 2), the prediction locks at kick-off, and once a result is entered, points are awarded automatically by the scoring rules. After this phase, ScoreSeer is functionally complete end-to-end — predict, play, score.

---

## What Was Built

- **Prediction submission** — an authenticated user predicts a match; predictions lock at kick-off and can be updated until then
- **Prediction viewing** — endpoints to list all of a user's predictions, and to fetch their prediction for a specific match
- **Points calculation** — a reusable scoring service plus an endpoint that sets a match result and awards points to every prediction on that match

---

## Tech Stack Used in This Phase

### C# / .NET 9 — Backend
`PredictionsController` (submit, view) and a new result endpoint on `MatchesController`, plus a dedicated `ScoringService`.

### Entity Framework Core — Database access
`.Include().ThenInclude()` for two-level JOINs (prediction → match → teams), filtering by user and match, and batch updates of points in a single `SaveChanges`.

### PostgreSQL (Docker) — Database
The `predictions` table, now written and read through the API, with its `UNIQUE (user_id, match_id)` constraint enforcing one prediction per user per match.

---

## Scoring Rules (fixed from the MVP)

- **3 points** — exact score (predicted 2-1, actual 2-1)
- **1 point** — correct outcome, wrong score (predicted 2-1 = home win, actual 3-0 = home win)
- **0 points** — wrong outcome

"Outcome" means who wins (home / draw / away), regardless of the exact score.

---

## How It Was Done — Step by Step

### 1. Submitting predictions
- Added `PredictionDto` (match id + predicted scores); the user id is taken from the token, never from the body
- Created `PredictionsController` with `[Authorize]` on the whole class (every endpoint requires a valid token)
- Added a `GetUserId()` helper reading the id from the token's claims (handles both `sub` and the remapped name)
- Built `POST /api/predictions` with the business rules, checked in order:
  1. the match must exist (404 otherwise)
  2. the match must not have started yet (`UtcNow >= KickoffAt` → closed)
  3. scores cannot be negative
  4. if a prediction already exists → update it; otherwise → create a new one
- Because the kick-off check runs before the update/create logic, updating is automatically allowed only before kick-off — the order of checks is itself a rule

### 2. Viewing predictions
- `GET /api/predictions/mine` — all of the user's predictions, with team names (two-level JOIN via `.ThenInclude`), predicted score, actual score, status, and points
- `GET /api/predictions/match/{matchId}` — the user's prediction for one match, or 404 if none
- Both responses are shaped with `.Select()` and include the actual score and points so the frontend can show "you predicted X, it was Y, you earned Z" in one call

### 3. Calculating points
- Created a reusable `ScoringService` with a pure `CalculatePoints(...)` method (no database, just the rule) — so the same logic can be triggered from Postman now, the admin dashboard later, or a Python job in the future
- A small `GetOutcome(home, away)` helper reduces a score to home win / draw / away win, so "2-1" and "3-0" both count as a home win
- Registered the service in `Program.cs`
- Added `MatchResultDto` and `POST /api/matches/{id}/result`: saves the final score, marks the match `finished`, loops over all predictions for that match, awards points via the service, and saves everything in one `SaveChanges`

---

## Key Concepts Learned

- **Identity comes from the token, not the request body** — the user id is read from the JWT, so a client cannot predict "as" someone else.
- **The order of validations is logic** — placing the kick-off lock before the update/create branch means both submitting and updating respect the deadline, with a single check.
- **Business rules in the database and the code reinforce each other** — the `UNIQUE (user_id, match_id)` constraint guarantees one prediction per match, while the code decides between update and create.
- **Separate reusable logic from coordination** — the scoring rule lives in a service; the controller just gathers predictions and saves. This keeps the rule in one place, ready to be reused when results arrive automatically.
- **`.ThenInclude()` extends a JOIN** — navigating prediction → match → team, one level deeper than a single `.Include()`.
- **Batch updates with one save** — modifying the match and all its predictions in memory, then persisting them together in a single `SaveChanges`.

---

## API Endpoints (Phase 3)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/predictions` | JWT | Submit or update a prediction (locks at kick-off) |
| GET | `/api/predictions/mine` | JWT | List all of the user's predictions |
| GET | `/api/predictions/match/{matchId}` | JWT | Get the user's prediction for one match |
| POST | `/api/matches/{id}/result` | JWT* | Set a match result and award points to all predictions |

\* Currently any authenticated user can set a result. This is a temporary, intentional gap — restricting it to admins is planned for Phase 6 (roles).

---

## Verified Behaviour

Setting a 3-0 result on a match with two predictions confirmed the scoring works differentially in a single call:
- a prediction of 2-1 earned **1 point** (correct outcome, wrong score)
- a prediction of 3-0 earned **3 points** (exact score)

This proves the loop end-to-end: prediction → result entered → points calculated per the rules.

---

## What Remains for Later

- **Admin-only result entry** — restrict `POST /api/matches/{id}/result` to admins via roles (Phase 6).
- **Python automation** — later, a Python job will fetch results automatically from a football API and trigger the same scoring logic; it complements this phase rather than replacing it.
- **Leaderboards** — the awarded points feed directly into Phase 4, where a per-group leaderboard is produced by an aggregation query over `points_awarded` (no separate points table needed).
