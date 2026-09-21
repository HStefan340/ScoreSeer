import os
from dotenv import load_dotenv
from goal_api import GoalAPI

load_dotenv()
goal = GoalAPI(os.getenv("GOALAPI_KEY"))

# Search broadly and show all candidates for the missing countries
"""
for term in ["Premijer", "Prva", "Liga BIH", "Pro League", "Saudi", "Premier"]:
    result = goal.leagues.list(search=term)
    print(f"\n=== search '{term}' — Bosnia / Saudi candidates ===")
    for lg in result["data"]:
        country = lg["countryName"]
        # only show if country looks like Bosnia or Saudi
        if "bosn" in country.lower() or "saudi" in country.lower() or "herzeg" in country.lower():
            print(f"  {lg['name']!r} | country={country!r} | id={lg['apiId']}")
"""

"""
for term, ctry in [("Pro League", "Belgium"), ("Liga", "Portugal"), ("Liga", "Spain")]:
    result = goal.leagues.list(search=term)
    print(f"\n=== '{term}' in {ctry} ===")
    for lg in result["data"]:
        if lg["countryName"].lower() == ctry.lower():
            print(f"  {lg['name']!r} | id={lg['apiId']}")
"""

# Belgium: try broader terms
print("=== Belgium leagues ===")
for term in ["Jupiler", "First Division", "Division A", "Belgium"]:
    result = goal.leagues.list(search=term)
    for lg in result["data"]:
        if lg["countryName"].lower() == "belgium":
            print(f"  '{lg['name']}' | id={lg['apiId']}")

# Spain: try broader terms for the second division
print("\n=== Spain leagues ===")
for term in ["Segunda", "La Liga", "LaLiga", "Hypermotion"]:
    result = goal.leagues.list(search=term)
    for lg in result["data"]:
        if lg["countryName"].lower() == "spain":
            print(f"  '{lg['name']}' | id={lg['apiId']}")