from db import get_connection
from goal_client import goal

conn = get_connection()
cur = conn.cursor()

# Read the leagues we already imported: local id + GOAL external_id
cur.execute("SELECT id, external_id, name FROM leagues ORDER BY id")
leagues = cur.fetchall()
print(f"Leagues in database: {len(leagues)}")

total_inserted = 0
total_updated = 0

for league_local_id, league_external_id, league_name in leagues:
    # Ask GOAL for this league's teams, using its apiId