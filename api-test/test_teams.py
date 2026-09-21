import os
from dotenv import load_dotenv
from goal_api import GoalAPI

load_dotenv()
goal = GoalAPI(os.getenv("GOALAPI_KEY"))

for search, country in [("La Liga", "Spain"), ("UEFA Champions League", "Europe")]:
    result = goal.leagues.list(search=search)
    league = None
    for lg in result["data"]:
        if lg["countryName"].lower() == country.lower():
            league = lg
            break
    if not league:
        print(f"\n{search}: LEAGUE NOT FOUND in search")
        continue
    print(f"\n{search} (id={league['id']}):")
    teams_result = goal.leagues.teams(league["id"])
    teams = teams_result["data"]
    print(f"  total teams: {len(teams)}")
    # show first 5 team names to see what's there
    for t in teams[:5]:
        print(f"    {t['name']} -> apiId={t['apiId']}")
    # specifically look for Madrid
    for t in teams:
        if "Madrid" in t["name"]:
            print(f"  MADRID FOUND: {t['name']} -> apiId={t['apiId']}")

def get_teams(search, country):
    result = goal.leagues.list(search=search)
    for lg in result["data"]:
        if lg["countryName"].lower() == country.lower():
            return goal.leagues.teams(lg["id"])["data"]
    return []

# Real Madrid in Champions League
cl_teams = get_teams("UEFA Champions League", "Europe")
for t in cl_teams:
    if "Real Madrid" in t["name"]:
        print(f"Champions League: {t['name']} -> apiId={t['apiId']}")

# Universitatea Craiova in both Liga I and Champions League
for search, country in [("Liga I", "Romania"), ("UEFA Champions League", "Europe")]:
    teams = get_teams(search, country)
    for t in teams:
        if "Craiova" in t["name"]:
            print(f"{search}: {t['name']} -> apiId={t['apiId']}")