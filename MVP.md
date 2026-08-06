# ScoreSeer — MVP

A web-based mini-game where football fans predict match scores, earn points based on real results, and compete against each other in leaderboards within groups they create with friends.

---

## MVP Features

- **Authentication** — sign up with email or log in with Google, followed by choosing a unique username
- **Matches page** — list of upcoming fixtures, filtered by the leagues the user follows
- **Predictions** — users submit a predicted score for each upcoming match; predictions lock automatically at kick-off
- **Scoring** — points awarded automatically once results are in (3 pts for the exact score, 1 pt for the correct outcome)
- **Groups** — create private groups, search users by username, send and accept invitations
- **Leaderboard** — per-group ranking generated from members' accumulated points
- **Pages** — home, rules, leaderboard, matches
- **Design** — modern, interactive, user-friendly interface

---

## Tech Stack — What Each Language Does

### TypeScript + React — Frontend
The entire user-facing interface: login, match list, prediction form, groups, leaderboard. React builds the components, TypeScript adds type safety. Project bootstrapped with Vite.

### CSS (+ HTML) — Styling
Colours, layout, animations, responsive behaviour. HTML appears only minimally, since React generates the structure.

### C# / .NET — Backend
The core of the application: authentication, endpoints for matches, predictions and groups, business rules (locking predictions at kick-off, validation), and communication with the database.

### SQL / PostgreSQL — Database
Tables for users, teams, matches, predictions, groups, members, invitations and points. Leaderboards are produced through aggregation queries over predictions and points. Runs in Docker.

### Python — Auxiliary scripts
Importing fixtures and results (static data first, then from a football API) and the job that calculates points once matches finish.

### Angular — Admin dashboard (final phase)
A separate interface for managing leagues, adding matches and entering results. Reserved for the last phase — until then, the entire frontend is React.

---

## Responsibility Split

| Layer | Technology | Role |
|---|---|---|
| Frontend | React / TypeScript / CSS | What the user sees |
| Backend | C# / .NET | What the app decides |
| Database | PostgreSQL / SQL | What the app remembers |
| Automation | Python | What happens in the background |
| Admin | Angular | What the administrator manages |

---

## Development Phases

**Phase 0 — Foundation**
Stack setup, repository, PostgreSQL running in Docker.

**Phase 1 — Authentication & identity**
Email and Google login, unique username selection, `users` table.

**Phase 2 — Match data (read-only)**
`teams` and `matches` tables, static data import via Python, matches page.

**Phase 3 — Prediction core loop**
`predictions` table, prediction UI with kick-off locking, scoring rules, result ingestion and points calculation.

**Phase 4 — Groups & social**
`groups`, `group_members`, `invitations` tables, user search, invitation flow, per-group leaderboard.

**Phase 5 — League selection**
Users and groups choose which leagues to follow; matches filtered accordingly.

**Phase 6 — Pages, design & polish**
Home, rules, leaderboard and matches pages finalised; colour system, responsive layout, animations. Optional: Angular admin dashboard.

---

## Design Decisions

- **Predictions are global, leaderboards are per-group.** A user predicts each match once; groups simply aggregate their members' points. This avoids duplicating prediction data.
- **Match data starts static.** Fixtures and results are seeded manually at first, so development doesn't depend on an external API. The football API is connected later.
- **Scoring rules are fixed up front.** They shape both the database schema and the UI, so they are decided before any code is written.
