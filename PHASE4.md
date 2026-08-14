# ScoreSeer — Phase 4: Groups, Invitations & Leaderboard

This phase turned the points into a real competition between friends. Users can create private groups, search for other users, send and answer invitations, and see a per-group leaderboard. The leaderboard is the payoff of an earlier design decision: it is not stored data but an aggregation query over `points_awarded`.

---

## What Was Built

- **Group creation & membership** — create a group (the creator becomes owner and first member), list your groups, view a group's members
- **User search** — find users by username for the invite flow
- **Invitations** — send an invitation to a group, view received invitations, accept or decline them
- **Leaderboard** — a per-group ranking computed live from members' accumulated points

---

## Tech Stack Used in This Phase

### C# / .NET 9 — Backend
`GroupsController` (groups, invitations, leaderboard) and a new `UsersController` (search).

### Entity Framework Core — Database access
Many-to-many navigation (`group_members`), sub-queries for aggregation (`Sum`, `Count`), partial-match search (`Contains`), and membership checks (`AnyAsync`).

### PostgreSQL (Docker) — Database
The `groups`, `group_members`, and `invitations` tables, plus aggregation over `predictions` for the leaderboard.

---

## How It Was Done — Step by Step

### 1. Groups
- Added `CreateGroupDto` (group name only; owner comes from the token)
- Created `GroupsController` with `[Authorize]` on the whole class
- `POST /api/groups` creates the group and, in a second insert, adds the creator to `group_members` with the `owner` role — because being owner (`groups.owner_id`) and being a member (`group_members`) are separate facts
- Generated a short unique `invite_code` from a GUID
- `GET /api/groups/mine` lists the groups the user belongs to, starting from `group_members` (not `groups`), with a member count
- `GET /api/groups/{id}/members` returns the members, but only if the current user belongs to the group (`Forbid` otherwise)

### 2. User search
- Created `UsersController` with `GET /api/users/search?q=...`
- Partial, case-insensitive match on username (`Contains`), a minimum of 2 characters, capped at 10 results, returning only id and username

### 3. Invitations
- Added `CreateInvitationDto` (group id + receiver id)
- `POST /api/groups/invitations` sends an invitation, guarded by five business rules: sender must be a member, cannot invite yourself, receiver must exist, receiver must not already be a member, and no duplicate pending invitation
- `GET /api/groups/invitations/received` lists the current user's pending invitations, navigating to the group name and sender username
- `POST /api/groups/invitations/{id}/respond?accept=true|false` lets only the receiver answer a still-pending invitation; on accept it marks the invitation `accepted` and adds the user to `group_members`, on decline it just marks it `declined`

### 4. Leaderboard
- `GET /api/groups/{id}/leaderboard` returns the group's members ranked by total points
- For each member, a sub-query sums `points_awarded` across their scored predictions (`?? 0` when they have none) and counts how many were scored
- Ordered by total points descending; membership is required to view it

---

## Key Concepts Learned

- **The leaderboard is a query, not a table.** Points live once, in `predictions`. The ranking is computed on demand by summing them per member — so there is nothing to keep in sync, and changing a prediction's points updates the ranking automatically. This is the "one fact, one place" principle paying off.
- **Owner vs member are distinct.** The creator is recorded both as the group's owner and as a row in `group_members`, so they appear in listings and the leaderboard.
- **Order of validations encodes rules.** The invitation endpoint's five checks each prevent a specific nonsensical state.
- **`Forbid` (403) vs `Unauthorized` (401).** 401 means "I don't know who you are"; 403 means "I know you, but you may not access this" — used for non-members trying to view a group.
- **Query string vs route parameter.** `?q=` and `?accept=` are query parameters (`[FromQuery]`), used for search terms and options; `{id}` is a route parameter, used to identify a resource.
- **Route parameter type must match the primary key type.** `invitations.id` is `BIGSERIAL` → `long`, so the route parameter had to be `long`, not `int` (a mismatch threw a runtime error).

---

## API Endpoints (Phase 4)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/groups` | JWT | Create a group (creator becomes owner + member) |
| GET | `/api/groups/mine` | JWT | List the groups the user belongs to |
| GET | `/api/groups/{id}/members` | JWT | List a group's members (members only) |
| GET | `/api/groups/{id}/leaderboard` | JWT | Group ranking by total points (members only) |
| POST | `/api/groups/invitations` | JWT | Send an invitation to a user |
| GET | `/api/groups/invitations/received` | JWT | List received pending invitations |
| POST | `/api/groups/invitations/{id}/respond` | JWT | Accept (`?accept=true`) or decline an invitation |
| GET | `/api/users/search?q=...` | JWT | Search users by username |

---

## The Leaderboard in Pure SQL

The endpoint's EF query is equivalent to this aggregation, which was used to verify the results match:

```sql
SELECT u.username,
       COALESCE(SUM(p.points_awarded), 0) AS total_points
FROM group_members gm
JOIN users u ON u.id = gm.user_id
LEFT JOIN predictions p
       ON p.user_id = gm.user_id AND p.points_awarded IS NOT NULL
WHERE gm.group_id = 2
GROUP BY u.username
ORDER BY total_points DESC;
```

- `LEFT JOIN` keeps members with no scored predictions (they show 0 rather than disappearing)
- `COALESCE(..., 0)` is the SQL equivalent of C#'s `?? 0`
- `GROUP BY` + `SUM` produce one total per member
- The API result and this SQL result are identical, since EF translates the C# query into this same SQL

---

## What Remains for Later

- **Leave / remove from group** — not part of the MVP flow yet.
- **League-scoped or season-scoped leaderboards** — currently totals are global per user; the group only decides who is listed. Scoping can be added later if needed.
- **Real-time leaderboard updates** — the ranking is computed per request; live updates would come with the frontend.
