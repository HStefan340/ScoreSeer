import os
from dotenv import load_dotenv
from goal_api import GoalAPI

load_dotenv()
API_KEY = os.getenv("GOALAPI_KEY")
goal = GoalAPI(API_KEY)

print("=" * 50)
print("Test: searc for 3 leagues")
print("=" * 50)

test_names = ["Premier League", "Super Liga", "UEFA Champions League"]

for name in test_names:
    result = goal.leagues.list(search = name)
    leagues = result["data"]
    print(f"\nSearch '{name}' -> {len(leagues)} result(s):")
    for lg in leagues:
        print(f"    {lg['name']} | country = {lg['countryName']} | season = {lg['season']} | id = {lg['apiId']}")

print()

print("=" * 50)
print("Test: fixtures by_date for 2026-09-18")
print("=" * 50)

result = goal.fixtures.by_date("2026-09-18")
fixtures = result["data"]
print(f"Total fixtures on 2026-09-18: {len(fixtures)}")

for fx in fixtures[:10]:
    print(f"   {fx['matchDate']} | {fx['leagueName']} ({fx['countryName']}): "
          f"{fx['homeTeamName']} vs {fx['awayTeamName']} [{fx['matchStatus']}]")