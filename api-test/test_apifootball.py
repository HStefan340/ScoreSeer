import os
import requests
from dotenv import load_dotenv
import time

# Load API key 
load_dotenv()
API_KEY = os.getenv("APIFOOTBALL_KEY")

BASE_URL = "https://v3.football.api-sports.io"
HEADERS = {"x-apisports-key": API_KEY}

# A helper that calls an endpoint and returns the JSON
def call(endpoint, params = None):
    response = requests.get(f"{BASE_URL}/{endpoint}", headers = HEADERS, params = params)
    return response.json()

# TEST 1: is the key valid? Check account status
print("=" * 50)
print("TEST 1: Account status")
print("=" * 50)
status = call("status")
print(status)
print()

# Test 2: search for leagues by name
print("=" * 50)
print("Test 2: League coverage")
print("=" * 50)
# Full league list: (name to search, country, expected divisions)
# For multi-division countries we search the base name and check what comes back.
my_leagues = [
    ("Champions League", None),
    ("Europa League", None),
    ("Conference League", None),
    ("Nations League", None),
    ("Superliga", "Albania"),
    ("Premier League", "England"),
    ("Championship", "England"),
    ("League One", "England"),
    ("Pro League", "Saudi-Arabia"),
    ("Liga Profesional", "Argentina"),
    ("Bundesliga", "Austria"),
    ("Jupiler Pro League", "Belgium"),
    ("Premijer Liga", "Bosnia"),
    ("Serie A", "Brazil"),
    ("First League", "Bulgaria"),
    ("First Division", "Cyprus"),
    ("HNL", "Croatia"),
    ("Superliga", "Denmark"),
    ("Super League", "Switzerland"),
    ("Veikkausliiga", "Finland"),
    ("Ligue 1", "France"),
    ("Ligue 2", "France"),
    ("Bundesliga", "Germany"),
    ("2. Bundesliga", "Germany"),
    ("Super League 1", "Greece"),
    ("Ligat Haal", "Israel"),
    ("Serie A", "Italy"),
    ("Serie B", "Italy"),
    ("First League", "North-Macedonia"),
    ("Liga MX", "Mexico"),
    ("Super Liga", "Moldova"),
    ("Eliteserien", "Norway"),
    ("Ekstraklasa", "Poland"),
    ("Primeira Liga", "Portugal"),
    ("Liga I", "Romania"),
    ("Liga II", "Romania"),
    ("Premier League", "Russia"),
    ("Premiership", "Scotland"),
    ("Super Liga", "Serbia"),
    ("La Liga", "Spain"),
    ("Segunda Division", "Spain"),
    ("Major League Soccer", "USA"),
    ("Allsvenskan", "Sweden"),
    ("Super Lig", "Turkey"),
    ("Premier League", "Ukraine"),
    ("NB I", "Hungary"),
]

found = [] # leagues we found (name + id)
not_found = [] # leagues we couldn't find

for name, country in my_leagues:
    params = {"name": name}
    if country:
        params["country"] = country
    data = call("leagues", params)
    results = data.get("response", [])
    if results:
        league = results[0]["league"]
        found.append((name, country, league["id"]))
    else:
        not_found.append((name, country))
    time.sleep(7) # pause 7s between calls to respect the per-minute limit
    print(f"  checked: {name} ({country})")   # progress indicator

print()

# Print all FOUND leagues, one under another
print(f"Found leagues: {len(found)} / {len(my_leagues)}")
for name, country, league_id in found:
    print(f"  {name} ({country}) -> id = {league_id}")
print()

# Print all MISSING leagues, one under another
print(f"Missing leagues: {len(not_found)}")
for name, country in not_found:
    print(f"  {name} ({country})")
print()

# Test 3 : can we get fisxtures by date?
print("=" * 50)
print("Test 3: Fixtures by date (efficiency check)")
print("=" * 50)
# Try to get all fixtures for a specific recent date
test_date = "2026-09-13"
data = call("fixtures", {"date": test_date})
fixtures = data.get("response", [])
print(f"Fixtures found for {test_date}: {len(fixtures)}")
print()

my_ids = [item[2] for item in found]
my_fixtures = [fx for fx in fixtures if fx["league"]["id"] in my_ids]
print(f"In Your leagues: {len(my_fixtures)}")
print()

# Print ALL matches, one under another
for fx in my_fixtures:
    home = fx["teams"]["home"]["name"]
    away = fx["teams"]["away"]["name"]
    status = fx["fixture"]["status"]["short"]
    league = fx["league"]["name"]
    print(f"  {league}: {home} vs {away} [{status}]")

print()

# Test 4 : how many request do we have left today?
print("=" * 50)
print("TEST 4: Requests remaining today")
print("=" * 50)
# The status response includes usage info
if "response" in status and isinstance(status["response"], dict):
    reqs = status["response"].get("requests", {})
    print(f"Requests: {reqs}")

