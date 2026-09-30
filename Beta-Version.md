# ScoreSeer — Beta Version

First public version of ScoreSeer: a football score-prediction game where fans predict match results, earn points and compete with friends in private groups. The beta runs entirely on free-tier infrastructure, uses real match data for 46 competitions, and updates scores and points automatically.

---

## Live Links

| Part | URL |
| --- | --- |
| Website (frontend) | `https://scoreseer-0n61.onrender.com` |
| API (backend) | `https://scoreseer-api-60l4.onrender.com` |
| API health check | `https://scoreseer-api-60l4.onrender.com/health` |
| Source code | `https://github.com/HStefan340/ScoreSeer` |

The website is public: anyone with the link can register and play.

---

## Features Available in the Beta

### Accounts

- Register and log in with email and password (passwords hashed with BCrypt)
- JWT authentication, valid for 7 days; the session survives page refreshes (token stored in `localStorage`)
- Public landing page (Home) for visitors, with Log In / Sign Up; the rest of the app is only reachable when logged in

### Matches and predictions

- Real fixtures, results and statuses for 46 competitions (list below)
- Predict the score of any upcoming match; edit the prediction any time before kick-off
- Match states shown on the Matches page:
  - **Scheduled** — prediction form, or the saved prediction with an Edit button
  - **Live / Half time** — LIVE badge with a pulsing dot, current score and the user's prediction
  - **Finished** — final score and FULL TIME badge
- Filter toggle: **All matches** / **My leagues** (only leagues the user follows)

### Scoring

| Points | Rule |
| --- | --- |
| 3 | Exact score |
| 1 | Correct outcome (home win / draw / away win), wrong score |
| 0 | Wrong outcome |

Points are awarded automatically when a match is marked finished.

### My Predictions

- History of all predictions: league, teams, predicted score, final score and points earned
- Finished matches are highlighted; upcoming ones show "Not played yet"

### Groups and competition

- Create groups; each group gets an invite code and the creator becomes the owner
- Invite players by searching their username (directly from the group card)
- Invitations page: accept or decline received invitations
- Per-group leaderboard: members ranked by points, current user highlighted with a **YOU** badge, group name shown above the table

### Leagues

- Follow / unfollow competitions; followed leagues power the "My leagues" filter

### Design

- "Nocturne Neon" theme: dark background with cyan/magenta glows, red-to-magenta gradient accents, Archivo + Space Grotesk fonts
- Animations on interactive elements (hover states, glowing inputs, pulsing badges, entrance animations)
- Fully responsive: desktop layout and a dedicated mobile layout with a hamburger menu

---

## Covered Competitions (46)

**International:** UEFA Champions League, UEFA Europa League, UEFA Conference League, UEFA Nations League

**National leagues:**
Albania (Superliga) · Argentina (Liga Profesional) · Austria (Bundesliga) · Belgium (First Division A) · Bosnia and Herzegovina (Premijer Liga) · Brazil (Serie A) · Bulgaria (First League) · Croatia (HNL) · Cyprus (1. Division) · Denmark (Superliga) · England (Premier League, Championship, League One) · Finland (Veikkausliiga) · France (Ligue 1, Ligue 2) · Germany (Bundesliga, 2. Bundesliga) · Greece (Super League 1) · Hungary (NB I) · Israel (Ligat Ha'al) · Italy (Serie A, Serie B) · Mexico (Liga MX) · Moldova (Super Liga) · North Macedonia (First League) · Norway (Eliteserien) · Poland (Ekstraklasa) · Portugal (Primeira Liga) · Romania (Liga I, Liga II) · Russia (Premier League) · Saudi Arabia (Saudi League) · Scotland (Premiership) · Serbia (Super Liga) · Spain (La Liga, Segunda División) · Sweden (Allsvenskan) · Switzerland (Super League) · Turkey (Süper Lig) · Ukraine (Premier League) · USA (MLS)

European Championship and World Cup are available in the data source and can be added when they take place.

---

## Architecture

```text
   cron-job.org (every 10 min)          GOAL API (football data)
            │ triggers                           │
            ▼                                    ▼
          GitHub Actions (Python scripts) ◄──────┘
                           │ writes
                           ▼
 Browser ──► Frontend ──► Backend API ──► PostgreSQL
            (React,       (.NET 9,        (Neon)
             Render        Docker,
             static)       Render)
```

- **Frontend** — React + TypeScript + Vite, built into static files and served by Render
- **Backend** — ASP.NET Core Web API (.NET 9), EF Core + Npgsql, JWT auth, packaged with Docker and hosted on Render
- **Database** — PostgreSQL on Neon (9 tables: users, leagues, teams, matches, predictions, groups, group_members, invitations, user_leagues)
- **Data pipeline** — Python scripts using the official GOAL API SDK, run by GitHub Actions (score updates triggered by cron-job.org, fixture import on a daily GitHub schedule)

---

## Deployment

### Database — Neon

- Free PostgreSQL project (region: Europe / Frankfurt), PostgreSQL 18
- Data migrated from the local Docker database with `pg_dump` + `psql`, both run inside the Docker container to keep the dump in UTF-8
- Teams are independent entities (no `league_id`), so a club playing in several competitions exists only once

### Backend — Render Web Service

- Built from `backend/ScoreSeer.Api/Dockerfile` (multi-stage: .NET SDK for build, ASP.NET runtime for running), listening on port 8080
- Region: Frankfurt (same as the database)
- Redeploys automatically on every push to `main`
- Configuration through environment variables (secrets are never committed):

| Variable | Purpose |
| --- | --- |
| `ConnectionStrings__DefaultConnection` | Neon connection string (`Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require`) |
| `Jwt__Key` | JWT signing key (production-only key, different from the local one) |
| `Jwt__Issuer`, `Jwt__Audience` | JWT issuer and audience |
| `Google__ClientId` | Google OAuth client ID |
| `Cors__AllowedOrigins` | Frontend URL allowed by CORS (comma-separated list supported) |

- `/health` endpoint answers `OK` without touching the database; used for uptime pings
- Match results and points come only from the automated pipeline; the MVP's manual result endpoint (`POST /api/matches/{id}/result`) and the C# scoring service were removed, so the scoring rule lives in one place (`update_scores.py`)

### Frontend — Render Static Site

- Root directory `frontend`, build command `npm install && npm run build`, publish directory `dist`
- API URL comes from Vite env files: `.env.development` (localhost) and `.env.production` (Render backend). These contain only public URLs and are committed
- Rewrite rule `/*` → `/index.html` so React Router routes work on refresh and direct links
- Redeploys automatically on every push to `main`

### Automation — GitHub Actions + cron-job.org

Workflows live in `.github/workflows/`; secrets `DATABASE_URL` (Neon) and `GOALAPI_KEY` are stored as repository secrets.

| Workflow | Triggered by | Schedule (UTC) | Script | What it does |
| --- | --- | --- | --- | --- |
| Import matches | GitHub schedule | daily at 03:00 (may start a few hours late) | `import_matches.py` | Imports fixtures from today to 7 days ahead; inserts new matches and teams, updates kick-off times (upsert on `external_id`) |
| Update scores | cron-job.org | every 10 min (00–05, 10–23), hourly (06–09) | `update_scores.py` | Syncs status and score of matches in play, awards points for finished matches, then pings `/health` to keep the backend awake |

**Why cron-job.org:** GitHub's own schedule proved unreliable for frequent runs (a 10-minute schedule actually ran every 3–5 hours). GitHub starts manually triggered runs almost immediately, so an external service triggers the workflow instead:

- Two cron-job.org jobs (timezone UTC): `*/10 0-5,10-23 * * *` and `0 6-9 * * *`
- Each job sends `POST https://api.github.com/repos/HStefan340/ScoreSeer/actions/workflows/update-scores.yml/dispatches` with body `{"ref":"main"}` and headers `Authorization: Bearer <token>`, `Accept: application/vnd.github+json`, `X-GitHub-Api-Version: 2022-11-28`
- Success response: `204 No Content`
- The token is a fine-grained GitHub personal access token limited to the ScoreSeer repository with **Actions: Read and write** only; it is stored only in cron-job.org and must be renewed before it expires
- Email notification on failure is enabled in cron-job.org

Both workflows can also be started manually from the **Actions** tab (`workflow_dispatch`).

**How `update_scores.py` stays cheap:**

1. Reads from the database the matches that kicked off in the last 3 days and are not finished
2. Groups them by league and day
3. Makes one GOAL API request per group (`fixtures.by_date(day, leagueId=...)`)
4. Stops early if fewer than 100 API requests remain for the day

When no match is in play, it makes zero API requests.

**Scripts in `data-import/`:**

| File | Role |
| --- | --- |
| `db.py` | Database connection: `DATABASE_URL` if set (production), otherwise local `DB_*` values from `.env` |
| `goal_client.py` | Shared GOAL API client |
| `import_leagues.py` | One-time import of the 46 leagues (long GOAL id stored as `external_id`) |
| `import_matches.py` | Rolling fixture import |
| `update_scores.py` | Status/score sync and prediction scoring |
| `requirements.txt` | Python dependencies for GitHub Actions |

---

## Free-Tier Limits to Watch

| Service | Limit | How the beta stays within it |
| --- | --- | --- |
| Render web service | Sleeps after 15 min without traffic; 750 instance hours/month | `/health` pinged by the update workflow; one always-on service fits in 750 h |
| Render static site | No sleep | — |
| Neon | 0.5 GB storage; ~100 CU-hours/month; suspends after 5 min idle | Updates every 10 min and hourly in quiet hours, so the database can sleep between runs |
| GOAL API | 1000 requests/day, 30/min | One request per active league/day; safety stop at 100 remaining |
| GitHub Actions | Free for public repos; scheduled runs can be hours late; schedules disabled after 60 days without repo activity | Score updates are triggered by cron-job.org, not by the GitHub schedule; the 60-day rule only affects the daily import (push a commit or re-enable it from the Actions tab) |
| cron-job.org | Free; job runs every 10 min / hourly | Depends on a GitHub token with an expiry date; renew it before it expires |
| GitHub REST API version | `2022-11-28` is deprecated, sunset March 2028 | Update the `X-GitHub-Api-Version` header before then |

**Monitoring checklist (first days after launch):**

- Actions tab: Update scores runs appear about every 10 minutes and finish green; Import matches runs once a day
- cron-job.org history: executions return `204`
- Workflow logs: `Requests remaining today` stays comfortably above the safety threshold
- Neon dashboard: compute usage stays around 3 CU-hours/day or lower
- Render dashboard: backend status Live, no errors in logs

---

## Development Workflow

- **Local development** uses the Docker PostgreSQL (`scoreseer-db`), `dotnet run` for the backend (port 5037) and `npm run dev` for the frontend (port 5173)
- **Production** uses Neon, Render and GitHub Actions; local and production databases are separate and not synced
- **Shipping changes:** commit and push to `main` → Render rebuilds the backend and frontend automatically; workflow changes apply on their next run
- Local Python scripts write to the local database unless `DATABASE_URL` is set; never add `DATABASE_URL` to the local `.env`
- For future database migrations, run `pg_dump` inside the container (`docker exec ... pg_dump ... -f /tmp/dump.sql`) and consider `--no-owner` to avoid role errors on the target

---

## Known Limitations in the Beta

- Team logos are available in the database (`logo_url`) but the frontend still shows generated colored squares with initials
- The Matches page lists all imported matches, including past ones
- Matches whose kick-off has passed but are still marked scheduled have no dedicated "Locked" state
- Leaderboards use global points: a prediction counts in every group the user belongs to
- Live updates arrive about every 10 minutes, not in real time; no match minute is shown
- Google login exists in the backend but has no button in the frontend
- Token stored in `localStorage`; no automatic redirect to login when the token expires
- No privacy policy, cookie notice or legal disclaimer yet
- Free-tier cold starts: the first request after the backend has slept can take up to about a minute

---

## Roadmap After the Beta

- Show real team logos
- Matches page focused on upcoming and live matches; "Locked" state after kick-off
- Test the full scoring loop with real users
- Per-group points (predictions tied to a group) and leagues as group context
- Features from the extended design (side rails: stats, season overview, live match)
- httpOnly cookie authentication and automatic re-login on expiry
- Privacy policy, disclaimer, custom domain and branding before public promotion
- Smarter live updates (skip database wake-ups when no match is in play) or a paid tier if traffic grows
