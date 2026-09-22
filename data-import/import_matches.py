from datetime import datetime
from db import get_connection
from goal_client import goal

conn = get_connection()
cur = conn.cursor()

# Map each league's GOAL long id -> local id
cur.execute("SELECT id, external_id FROM leagues")
league_map = {}
for local_id, external_id in cur.fetchall():
    league_map[external_id] = local_id

print(f"Leagues loaded: {len(league_map)}")

# Import matches in a date wondow (adjust as needed)
date_from = "2026-09-21"
date_to = "2026-09-27"

all_fixtures = goal.collect(
    lambda **p: goal.fixtures.list(**{"from": date_from, "to": date_to}, **p),
    page_size = 100,
    max_items = 5000,
)

print(f"Total fixtures worldwide {date_from} to {date_to}: {len(all_fixtures)}")

# Keep only fixtures from our leagues (match by long league_id)
my_fixtures = [fx for fx in all_fixtures if fx.get("leagueId") in league_map]
print(f"In our leagues: {len(my_fixtures)}")

# Insert a team if new (upsert), return its local id
def ensure_team(team_data):
    external_id = str(team_data["id"])
    name = team_data["name"]
    short_name = (team_data.get("shortname") or name[:3]).upper()
    logo_url = team_data.get("badge")

    cur.execute(
        """
        INSERT INTO teams (name, short_name, logo_url, external_id)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (external_id)
        DO UPDATE SET name = EXCLUDED.name,
                      short_name = EXCLUDED.short_name,
                      logo_url = EXCLUDED.logo_url
        RETURNING id
        """,
        (name, short_name, logo_url, external_id),
    )

    return cur.fetchone()[0]

inserted = 0
updated = 0

for fx in my_fixtures:
    league_local_id = league_map[fx["leagueId"]]

    # Make sure both teams exists
    home_team_id = ensure_team(fx["homeTeam"])
    away_team_id = ensure_team(fx["awayTeam"])

    # Match data
    external_id = str(fx["id"])
    kickoff = fx["kickoffUtc"]
    status = fx["matchStatus"].lower()
    home_score = fx["homeTeamScore"]
    away_score = fx["awayTeamScore"]

    cur.execute(
        """
        INSERT INTO matches (league_id, home_team_id, away_team_id, kickoff_at, status, home_score, away_score, external_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (external_id)
        DO UPDATE SET status = EXCLUDED.status,
                      home_score = EXCLUDED.home_score,
                      away_score = EXCLUDED.away_score,
                      kickoff_at = EXCLUDED.kickoff_at
        RETURNING (xmax = 0) AS was_inserted
        """,
        (league_local_id, home_team_id, away_team_id, kickoff, status, home_score, away_score, external_id),
    )

    if cur.fetchone()[0]:
        inserted += 1
    else:
        updated += 1

conn.commit()
print(f"\nMatches inserted: {inserted}, updated: {updated}")

cur.close()
conn.close()