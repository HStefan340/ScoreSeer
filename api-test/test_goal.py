import os
from dotenv import load_dotenv
from goal_api import GoalAPI

load_dotenv()
API_KEY = os.getenv("GOALAPI_KEY")
goal = GoalAPI(API_KEY)

print("=== ONE LEAGUE (structure) ===")
leagues = goal.leagues.list(limit = 1)
print(leagues["data"][0])

print()
print("=== FIXTURES FOR A DATE (structure + does the filter work?) ===")
fixtures = goal.fixtures.list(date = "2026-09-18")
print(f"Count: {len(fixtures['data'])}")
if fixtures["data"]:
    print(fixtures["data"][0])