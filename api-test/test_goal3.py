import os
from dotenv import load_dotenv
from goal_api import GoalAPI
import unicodedata

def normalize(text):
    # Remove accents: ü -> u, ó -> o, ç -> c, etc.
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()

load_dotenv()
API_KEY = os.getenv("GOALAPI_KEY")
goal = GoalAPI(API_KEY)

my_leagues = [
    ("UEFA Champions League", "Europe", "Champions League"),
    ("UEFA Europa League", "Europe", "Europa League"),
    ("UEFA Conference League", "Europe", "Conference League"),
    ("UEFA Nations League", "eurocups", "Nations League"),
    ("Superliga", "Albania", "Albania - Superliga"),
    ("Premier League", "England", "England - Premier League"),
    ("Championship", "England", "England - Championship"),
    ("League One", "England", "England - League One"),
    ("Saudi League", "Saudi Arabia", "Saudi Arabia - Saudi League"),
    ("Liga Profesional Argentina", "Argentina", "Argentina - Liga Profesional"),
    ("Bundesliga", "Austria", "Austria - Bundesliga"),
    ("First Division A", "Belgium", "Belgium - First Division A"),
    ("Premijer Liga", "Bosnia and Herzegovina and Herzegovina", "Bosnia - Premijer Liga"),
    ("Serie A", "Brazil", "Brazil - Serie A"),
    ("First League", "Bulgaria", "Bulgaria - First League"),
    ("1. Division", "Cyprus", "Cyprus - First Division"),
    ("HNL", "Croatia", "Croatia - HNL"),
    ("Superliga", "Denmark", "Denmark - Superliga"),
    ("Super League", "Switzerland", "Switzerland - Super League"),
    ("Veikkausliiga", "Finland", "Finland - Veikkausliiga"),
    ("Ligue 1", "France", "France - Ligue 1"),
    ("Ligue 2", "France", "France - Ligue 2"),
    ("Bundesliga", "Germany", "Germany - Bundesliga"),
    ("2. Bundesliga", "Germany", "Germany - 2. Bundesliga"),
    ("Super League 1", "Greece", "Greece - Super League 1"),
    ("Ligat ha'Al", "Israel", "Israel - Ligat ha'Al"),
    ("Serie A", "Italy", "Italy - Serie A"),
    ("Serie B", "Italy", "Italy - Serie B"),
    ("First League", "North Macedonia", "Macedonia - First League"),
    ("Liga MX", "Mexico", "Mexico - Liga MX"),
    ("Super Liga", "Moldova", "Moldova - Super Liga"),
    ("Eliteserien", "Norway", "Norway - Eliteserien"),
    ("Ekstraklasa", "Poland", "Poland - Ekstraklasa"),
    ("Primeira Liga", "Portugal", "Portugal - Primeira Liga"),
    ("Liga I", "Romania", "Romania - Liga I"),
    ("Liga II", "Romania", "Romania - Liga II"),
    ("Premier League", "Russia", "Russia - Premier League"),
    ("Premiership", "Scotland", "Scotland - Premiership"),
    ("Super Liga", "Serbia", "Serbia - Super Liga"),
    ("La Liga", "Spain", "Spain - La Liga"),
    ("Segunda División", "Spain", "Spain - Segunda División"),
    ("MLS", "USA", "USA - MLS"),
    ("Allsvenskan", "Sweden", "Sweden - Allsvenskan"),
    ("Süper Lig", "Turkey", "Turkey - Süper Lig"),
    ("Premier League", "Ukraine", "Ukraine - Premier League"),
    ("NB I", "Hungary", "Hungary - NB I"),
]

print("=" * 55)
print("LEAGUE COVERAGE — full list")
print("=" * 55)

found = []
not_found = []

for search, country, label in my_leagues:
    result = goal.leagues.list(search = normalize(search))
    candidates = result["data"]
    # Find the one whose country matches (case-insensitive)
    match = None
    for lg in candidates:
        # country must match AND the league name must match the search term
        if lg["countryName"].lower() == country.lower() and lg["name"].lower() == search.lower():
            match = lg
            break
    
    if match:
        found.append((label, match))
    else:
        not_found.append(label)

# Found leagues
print(f"\nFOUND: {len(found)} / {len(my_leagues)}")
for label, lg in found:
    print(f"  {label}  ->  '{lg['name']}' ({lg['countryName']}) season={lg['season']} apiId={lg['apiId']}")

# Missing leagues
print(f"\nMISSING: {len(not_found)}")
for label in not_found:
    print(f"  {label}")


print("\n" + "=" * 55)
print("ALL FIXTURES FOR ONE DATE")
print("=" * 55)

test_date = "2026-09-19"

all_fixtures = goal.collect(
    lambda **p: goal.fixtures.by_date(test_date, **p),
    page_size = 100,
    max_items = 2000,
)

print("DEBUG fixture league fields:", {k: v for k, v in all_fixtures[0].items() if "league" in k.lower() or "apiId" in k})

print(f"Total fixtures worldwide on {test_date}: {len(all_fixtures)}")

# Filter by league id (exact)
my_api_ids = [str(lg["id"]) for label, lg in found]
my_fixtures = [fx for fx in all_fixtures if str(fx.get("leagueId")) in my_api_ids]

print(f"In YOUR leagues: {len(my_fixtures)}\n")

# Group by league, so matches from the same league stay together
by_league = {}

for fx in my_fixtures:
    key = f"{fx['leagueName']} ({fx['countryName']})"
    if key not in by_league:
        by_league[key] = []
    by_league[key].append(fx)

# Print league by league, alphabetically
for league_key in sorted(by_league.keys()):
    matches = by_league[league_key]
    print(f"\n{league_key}  —  {len(matches)} match(es)")
    for fx in matches:
        hs = fx["homeTeamScore"] if fx["homeTeamScore"] is not None else "-"
        aws = fx["awayTeamScore"] if fx["awayTeamScore"] is not None else "-"
        print(f"    {fx['homeTeamName']} {hs}-{aws} {fx['awayTeamName']} [{fx['matchStatus']}]")