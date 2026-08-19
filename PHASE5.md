# ScoreSeer — Phase 5: League Selection

A short phase that closes an MVP loop: users choose which leagues to follow, and the matches page can be filtered to just those leagues. It's the first use of the `user_leagues` table — and the phase where EF's handling of a "pure" many-to-many surfaced.

---

## What Was Built

- **Follow a league** — add a league to the user's followed list
- **Unfollow a league** — remove it
- **List followed leagues** — the leagues the user follows
- **Followed matches** — matches filtered to only the user's followed leagues

---

## Tech Stack Used in This Phase

### C# / .NET 9 — Backend
New endpoints on `LeaguesController` (follow / unfollow / mine) and `MatchesController` (followed), with selective `[Authorize]` on the new methods only.

### Entity Framework Core — Database access
Working through a directly-mapped many-to-many (`User.Leagues`) rather than a join entity, plus `SelectMany` to flatten the relation and `Contains` for an `IN (...)` filter.

### PostgreSQL (Docker) — Database
The `user_leagues` table, written transparently by EF when leagues are added to or removed from a user's collection.

---

## How It Was Done — Step by Step

### 1. Follow / unfollow / list
- Added `GetUserId()` helper and selective `[Authorize]` on the new methods (the public "list all leagues" endpoint stays open)
- `POST /api/leagues/{id}/follow` — loads the user with their followed leagues (`.Include(u => u.Leagues)`), checks the league exists and isn't already followed, then adds it to `user.Leagues`
- `DELETE /api/leagues/{id}/follow` — same route, different verb; finds the followed league in the user's collection and removes it
- `GET /api/leagues/mine` — flattens the user's leagues with `SelectMany` and returns id, name, country

### 2. Followed matches
- `GET /api/matches/followed` — gets the ids of the user's followed leagues, then returns matches whose `league_id` is in that set (`Contains` → SQL `IN`)

---

## Two Problems Solved (both instructive)

### EF hid the join entity
The scaffolding did **not** generate a `UserLeague` class or a `DbSet<UserLeague>`. Because `user_leagues` has only its two foreign keys (a "pure" many-to-many with no extra columns), EF mapped it as a **direct relation** between `User` and `League` (`User.Leagues` / `League.Users`) and hid the join table.

This contrasts with `group_members`, which has extra columns (`role`, `joined_at`) and therefore kept a real `GroupMember` entity with its own `DbSet`. The rule: a join table with only foreign keys is collapsed into a direct many-to-many; one with extra columns stays a separate entity.

So following a league is done via `user.Leagues.Add(league)` — EF inserts the `user_leagues` row behind the scenes.

### Route conflict: `{id}` vs `followed`
`GET /api/matches/followed` first matched `GET /api/matches/{id}` and tried to bind "followed" as the `int id`, throwing a validation error. The fix was a **route constraint**: `[HttpGet("{id:int}")]` restricts the parameter route to integers, so "followed" no longer matches it and falls through to `GetFollowedMatches`. The rule: when a parameter route and a fixed-text route share a level, constrain the parameter's type.

---

## Key Concepts Learned

- **A pure many-to-many is mapped directly by EF** — no join entity, no `DbSet`; you work through the navigation collection (`user.Leagues`), and EF manages the join table for you.
- **`.Include()` before modifying a collection** — the followed leagues must be loaded with the user before adding/removing, or the collection is empty.
- **`SelectMany` flattens a relation** — turning a user's list of leagues into a flat list of leagues.
- **`Contains` becomes SQL `IN`** — filtering matches to a set of league ids.
- **Route constraints (`:int`) disambiguate routes** — a fixed-text route and a parameter route can coexist when the parameter is type-constrained.
- **The HTTP verb carries meaning** — the same URL follows (`POST`) or unfollows (`DELETE`) a league; the verb, not the URL, decides the action.

---

## API Endpoints (Phase 5)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/leagues/{id}/follow` | JWT | Follow a league |
| DELETE | `/api/leagues/{id}/follow` | JWT | Unfollow a league |
| GET | `/api/leagues/mine` | JWT | List the leagues the user follows |
| GET | `/api/matches/followed` | JWT | Matches from the user's followed leagues |

---

## What Remains for Later

- **Group-level league selection** — the MVP mentions groups choosing leagues; currently following is per-user. Can be extended if the leaderboard should be scoped by league.
- **Richer league catalog** — only one league (Premier League) exists so far; more arrive when a football API is connected.
