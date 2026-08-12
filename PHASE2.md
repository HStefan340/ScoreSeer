# ScoreSeer — Phase 2: Match & League Data (Read-Only API)

With authentication in place, this phase exposed the football data to the outside world: read-only endpoints that serve leagues and matches to the future frontend. It's a lighter phase built on the controller pattern from Phase 1, but it introduced the first database JOINs and route parameters.

---

## What Was Built

- **`LeaguesController`** — returns the list of leagues
- **`MatchesController`** — returns all matches with team and league details, plus a single match by id
- First use of **EF `.Include()`** (JOINs across tables) and **`.Select()`** projections to shape clean API responses
- First use of a **route parameter** (`/api/matches/{id}`) with proper 404 handling

---

## Tech Stack Used in This Phase

### C# / .NET 9 — Backend
Two new controllers following the established pattern (route + `_context` + actions).

### Entity Framework Core — Database access
`.Include()` to load related teams and league (via the foreign keys defined in the schema), `.Select()` to project only the needed fields, and `.OrderBy()` to sort matches by kick-off time.

### PostgreSQL (Docker) — Database
The existing `leagues`, `teams`, and `matches` tables, now read through the API.

---

## How It Was Done — Step by Step

### 1. LeaguesController
- Created `LeaguesController` with `GET /api/leagues`
- Started with a raw `ToListAsync()`, then refined it with `.Select()` to return only `id`, `name`, and `country` — dropping the empty navigation collections (`matches`, `teams`, `users`) that cluttered the raw response

### 2. MatchesController — list of matches
- Created `MatchesController` with `GET /api/matches`
- Used `.Include(m => m.HomeTeam)`, `.Include(m => m.AwayTeam)`, and `.Include(m => m.League)` so the response carries team and league **names**, not just their ids
- Used `.OrderBy(m => m.KickoffAt)` to list upcoming matches first
- Used `.Select()` to build a clean response object (id, league, home team, away team, kick-off, status, scores)

### 3. MatchesController — single match by id
- Added `GET /api/matches/{id}` using a **route parameter**
- The `{id}` placeholder in the route binds automatically to the method's `int id` parameter
- Filtered with `.Where(m => m.Id == id)` and returned a single result with `.FirstOrDefaultAsync()`
- Returned `404 Not Found` when no match exists with that id

### 4. Data cleanup
- Removed a duplicate test match left over from earlier testing, respecting the foreign-key protection (a match referenced by a prediction can't be deleted until the prediction is removed)

---

## Key Concepts Learned

- **`.Include()` performs JOINs** — EF uses the foreign keys from the schema to load related rows (home team, away team, league) in one query. The navigation properties (`m.HomeTeam`) exist because the scaffolding turned the SQL foreign keys into them.
- **Always shape responses with `.Select()`** — returning raw entities leaks internal structure and empty navigation collections. A projection returns exactly the fields the client needs, keeping the JSON clean and stable.
- **Route parameters** — `[HttpGet("{id}")]` captures a value from the URL and binds it to a method parameter, enabling detail endpoints like `/api/matches/1`.
- **Correct HTTP status codes** — `404 Not Found` for a missing resource, rather than an empty or misleading response.

---

## API Endpoints (Phase 2)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/leagues` | none | List all leagues |
| GET | `/api/matches` | none | List all matches with team & league names |
| GET | `/api/matches/{id}` | none | Get a single match by id (404 if not found) |

---

## What Remains for Later

- **Filtering matches** — by status (upcoming / finished) or by league, once the frontend needs it.
- **Authentication on these endpoints** — currently public; can be revisited if match data should require a logged-in user.
- These endpoints feed directly into **Phase 3 (predictions)**, where the match detail endpoint (`/api/matches/{id}`) backs the page on which a user submits a predicted score.
