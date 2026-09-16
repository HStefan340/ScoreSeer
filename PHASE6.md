# ScoreSeer — Phase 6: Frontend & Design

The largest phase: building the entire web frontend that gives every backend feature a face, then a full design pass that turns a working-but-plain MVP into a finished-looking product — the "Nocturne Neon" theme — responsive on both desktop and mobile.

This phase is split into two big parts: **6A — Functional frontend** (making everything work in the browser) and **6B — Design** (making it look like the chosen design, 1:1).

---

## What Was Built

### 6A — Functional frontend (all pages working)
- **Authentication UI** — login, register, persistent session, an auth-wall so nothing is reachable when logged out
- **Public landing page** — Home visible to visitors with Login / Sign up in the corner; the rest of the app stays behind auth
- **Matches + predictions** — list matches, submit a prediction, edit it, see your existing prediction, filter to followed leagues
- **Groups** — create a group, list your groups, invite members (search + send), see invitations, accept/decline
- **Leaderboard** — per-group ranking of members by points
- **My Predictions** — history of your predictions with predicted vs actual score and points
- **Leagues** — follow / unfollow leagues, and a matches filter driven by them

### 6B — Design (Nocturne Neon, 1:1 with the chosen mockups)
- A global design foundation (colors, fonts, glowing background, reusable animations)
- Every page restyled to match the design exactly
- Movement/animation throughout (hover states, glows, entrance animations)
- Fully responsive for phones (a dedicated mobile pass, one media query per page)

---

## Tech Stack Used in This Phase

### React + TypeScript + Vite — Frontend framework
Components, hooks (`useState`, `useEffect`, `useCallback`), typed props and API responses, React Router for navigation.

### CSS (one file per page) — Styling
Plain CSS, one `.css` file imported per page/component. CSS custom properties (variables) for the whole theme, `@keyframes` animations, media queries for responsive layout, CSS Grid and Flexbox for layout.

### React Router — Client-side routing
`BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink` (for active-link styling), `useParams` (reading the group id from the URL), `useNavigate` (redirect after login).

### Fetch API + a small client wrapper — Talking to the backend
A single `client.ts` with `apiGet`, `apiPost`, `apiDelete` helpers that attach the JWT and handle errors, so pages contain logic, not plumbing.

---

## How It Was Done — Step by Step

### Part 6A — Functional frontend

#### 1. Project structure & API client
- Vite React+TS project in `frontend/`, running on `:5173`
- CORS configured in the backend (`AddCors` with the frontend origin, `UseCors` before `UseAuthentication`)
- `src/api/client.ts` — `API_BASE` plus generic `apiGet` / `apiPost` / `apiDelete`; every path must start with `/` (a recurring slash bug)
- `src/types/index.ts` — one interface per API shape (Match, Prediction, Group, LeaderboardEntry, etc.); a single source of truth for types
- `src/utils/teams.ts` — shared helpers for team logo color + initials (extracted so they live in one place, ready to sync with real data later)

#### 2. Authentication
- `AuthContext.tsx` — an `AuthProvider` + `useAuth` hook; token and user kept in `localStorage` so the session survives a refresh
- **Auth-wall** in `App.tsx` — when there's no token, only Home (public landing) + login + register render, with a public nav; when logged in, the full app + full nav render
- Login / Register pages with cross-links and a redirect after success

#### 3. Matches & predictions (the core loop)
- `MatchesPage` lists matches; a `MatchCard` per match holds the prediction logic
- On load, each card asks `GET /predictions/match/{id}` to know whether you've already predicted
- Three states per card: **no prediction** (empty form), **has a prediction** (shows it + Edit), **editing** (form pre-filled)
- A filter toggle switches between all matches (`/matches`) and followed only (`/matches/followed`)

#### 4. Groups, invitations, leaderboard
- `GroupsPage` — create + list groups; each card shows name, role badge, member count, invite code
- Invite flow moved onto the Groups page: an "Invite" button per group expands a search panel (`InviteMember`) inline
- `GroupDetailPage` — the leaderboard table for a group; the current user's row is highlighted with a "YOU" badge; the group name shows as a kicker above the title
- `InvitationsPage` — received invitations with Accept / Decline

#### 5. My Predictions & Leagues
- `MyPredictionsPage` — prediction history; finished matches show actual score + points badge, upcoming show "not played yet"
- `LeaguesPage` — follow/unfollow toggle per league; drives the matches filter

### Part 6B — Design (Nocturne Neon)

#### 6. Design foundation (built first, once)
- Google Fonts: **Archivo** (headings/labels, weights 700–900) + **Space Grotesk** (body)
- `index.css` — CSS variables for every color in the design (page bg `#0e0d11`, red→magenta gradient accent, cyan glow, text shades, borders), the fonts, and a layered radial-gradient background (cyan glow top-left, magenta bottom-right) that gives the "dark with light tendencies" feel
- Reusable `@keyframes`: `glowP` (pulsing cyan glow for a ready-to-predict input), `pulse` (LIVE dots), `riseIn` (cards entering), `appFadeIn` (whole app)

#### 7. Page-by-page styling (one commit per page)
- Navigation (logo with a breathing glow, links with an underline that grows from center, active link styled)
- Login / Register (kicker gradient label, big title, inputs with a cyan focus glow, gradient primary button)
- Home (hero, a 3-column scoring card with big colored numbers, two-column guides, leagues section — full width)
- Matches (segmented All/My-leagues toggle, team logo squares, glowing score inputs, the pulsing empty input, PREDICT/EDIT buttons, FULL TIME badge)
- Groups, Group Detail/Leaderboard, Invitations, My Predictions, Leagues — each matched to its mockup

#### 8. Responsive (the mobile pass, done last)
- Global overflow protection in `index.css` (`overflow-x: hidden`, reduced side padding on all pages) so nothing scrolls sideways on a phone
- A mobile navigation with a hamburger menu that slides open; a separate simple public nav (logo + Log in/Sign up, no hamburger)
- One `@media (max-width: 800px)` block per page: multi-column layouts stack, teams stack vertically (logo stays with the name via a flex-wrap trick), the score inputs and buttons rearrange to match the phone mockups

---

## Problems Solved (a selection — the instructive ones)

### The recurring slash bug
`API_BASE` ends in `/api` (no trailing slash), so every call path must **start** with `/`. Writing `groups/mine` produced `/apigroups/mine` (404); a relative `Link` to `groups/2` produced `/groups/groups/2`. The rule, learned repeatedly: leading slashes in URLs and absolute paths in links matter exactly.

### Stale JWT after backend changes
Predictions failed with `401 invalid_token` — the token in `localStorage` was generated before backend auth fixes and was no longer valid. Logging out and back in issued a fresh 7-day token. A one-time thing, not a recurring cost.

### `400` on prediction = kick-off passed
A prediction returned `400 Bad Request`. The cause wasn't the code: the test match's `kickoff_at` was in the past, so the backend correctly refused the prediction ("predictions are closed"). Pushing the match into the future fixed it. The design's "LOCKED" state is the proper long-term handling.

### Field-name mismatches surfaced by the UI
Several bugs where a field was spelled differently in the backend `.Select`, the TypeScript type, and the JSX — so a value read as `undefined` and rendered blank. Examples: `predictionScored` vs `predictionsScored`; a copy-paste error that put the home team name into `MatchId` and dropped `HomeTeam` entirely; a leaderboard sending `userId` while the frontend read `id` (which broke the "YOU" highlight). The lesson: a name must match in all three places, and a blank value is usually a name mismatch. The frontend made these visible in a way quick API tests hadn't.

### setState-in-effect warnings
A modern, strict linter flagged `setState` called synchronously at the top of a load function inside `useEffect`. The clean fix: don't reset `loading`/`error` synchronously — set state only inside `.then()`/`.catch()` (after the response), and let `loading` start `true` from `useState(true)`.

### `useCallback` for the missing-dependency warning
`useEffect` that calls a load function wants that function in its dependency array, but a plain function is recreated every render (causing an infinite loop). Wrapping the loader in `useCallback([...deps])` makes it stable, so `useEffect` can depend on it safely.

### Mobile Matches: aligning two columns of different heights
The hardest layout problem. On mobile the design wants stacked teams on the left and stacked score boxes on the right, aligned row-by-row, with the button full-width below. The prediction button lived inside the narrow right grid column, so it couldn't span the whole card. The fix needed a small, controlled JSX change (moving the button out to be a third grid child) plus `grid-template-columns: 1fr auto auto` on desktop (the empty third column collapses to 0 when there's no button, leaving desktop untouched) and `grid-column: 1 / -1` on mobile (button spans full width). Final pixel alignment was tuned with small `margin-top` values scoped to each breakpoint.

---

## Key Concepts Learned

- **Separation of structure and presentation** — JSX holds structure, CSS files hold all styling; placing style in CSS from the start (even provisional values) made the design pass a matter of editing CSS, not hunting through components.
- **CSS custom properties** — defining the whole theme as variables in one place (`:root`) means a color change happens once and applies everywhere.
- **CSS Grid + Flexbox for responsive** — `grid-template-columns` restructured per breakpoint, `flex-wrap` + a full-width "break" element to regroup items, `align-items` to center content vertically.
- **Media queries don't overlap** — `min-width: 801px` and `max-width: 800px` target disjoint ranges, so desktop and mobile tweaks can't interfere with each other.
- **`NavLink` for active styling** — React Router adds an `active` class to the link of the current route automatically.
- **`useParams` reads route parameters** — the frontend equivalent of the backend's `{id}` route parameter.
- **One source of truth** — shared types in `types/index.ts`, shared API helpers in `client.ts`, shared team helpers in `utils/teams.ts`; a change lives in one file, not many.
- **The UI is a bug detector** — rendering data visually exposed backend field mismatches that passed quick API tests.

---

## Pages & Components Built

| File | Purpose |
|---|---|
| `api/client.ts` | API_BASE + apiGet/apiPost/apiDelete (JWT + errors) |
| `api/AuthContext.tsx` | AuthProvider + useAuth; token/user in localStorage |
| `types/index.ts` | One interface per API shape |
| `utils/teams.ts` | Shared team logo color + initials |
| `App.tsx` | Auth-wall, routes, Navigation + PublicNav |
| `pages/HomePage` | Public landing / info page |
| `pages/LoginPage`, `pages/RegisterPage` | Auth |
| `pages/MatchesPage` | Matches list + MatchCard prediction logic |
| `pages/GroupsPage` | Create/list groups + inline invite |
| `pages/GroupDetailPage` | Group leaderboard (+ YOU highlight, group name) |
| `components/InviteMember` | User search + send invitation |
| `pages/InvitationsPage` | Received invitations, accept/decline |
| `pages/MyPredictionsPage` | Prediction history with points |
| `pages/LeaguesPage` | Follow/unfollow leagues |
| `components/Navigation.css` | Nav styling (desktop + mobile hamburger) |
| `index.css` | Design foundation: variables, fonts, background, animations, global responsive |

---

## What Remains (post-MVP, agreed to revisit together)

- **Per-group points (Model A)** — predictions belonging to a group (predict the same match differently per group); needs a `predictions` schema migration + backend/frontend refactor. Chosen, but to be re-confirmed (A vs a simpler model) when tackled.
- **Leagues integrated with groups** — leagues as a group's context; part of the same redesign as Model A.
- **Real match data via Python** — import real fixtures/results; sync real club colors/logos in `utils/teams.ts` at that point.
- **DesignFeature extras** — the side-rail components per page (stats, "your season", live match, etc.), added gradually.
- **Polish** — a points badge in the nav, `401` → auto-redirect to login, httpOnly cookie migration, live username-availability check on register, a "LOCKED" state for matches whose kick-off has passed.

---

## The MVP is complete

Backend (Phases 1–5) and frontend (Phase 6) are both done, styled 1:1 to the Nocturne Neon design, and responsive on desktop and mobile. ScoreSeer works end to end: register, predict matches, earn points, create groups, invite friends, compete on a leaderboard — as a real, deployable-looking product.
