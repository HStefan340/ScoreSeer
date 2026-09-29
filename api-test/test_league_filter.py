from datetime import date
import os
from dotenv import load_dotenv
from goal_api import GoalAPI

load_dotenv()

# A ready-to-use GOAL API client
goal = GoalAPI(os.getenv("GOALAPI_KEY"))

# UEFA Nations League: long GOAL id, as stored in leagues.external_id
LEAGUE_ID = "cmr77dw4800fgrx06rwmig2h8"

today = date.today().isoformat()
result = goal.fixtures.by_date(today, leagueId=LEAGUE_ID)
fixtures = result["data"]

print(f"Fixtures today for this league: {len(fixtures)}")
for fx in fixtures:
    print(f"  {fx['leagueName']}: {fx['homeTeamName']} vs {fx['awayTeamName']} [{fx['matchStatus']}]")

# Remaining daily requests on the plan
print(f"Requests remaining today: {goal.rate_limit.remaining}")