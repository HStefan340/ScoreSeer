import unicodedata
from db import get_connection
from goal_client import goal

# Remove accents so name matching is reliable (Süper -> super, División -> division)
def normalize(text):
    nfkd = unicodedata.normalize("NFKD", text)
    return "".join(c for c in nfkd if not unicodedata.combining(c)).lower()

# (search term, country as GOAL spells it, readable label)
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

# Find each league in GOAL (match by country + exact name, accent-insensitive)
found = []
for search, country, label in my_leagues:
    result = goal.leagues.list(search = normalize(search))
    for lg in result["data"]:
        if lg["countryName"].lower() == country.lower() and normalize(lg["name"]) == normalize(search):
            found.append(lg)
            break

print(f"Leagues found in GOAL: {len(found)} / {len(my_leagues)}")

# Open database connection
conn = get_connection()
cur = conn.cursor()

# Insert each league, or update it if its external_id already exists
inserted = 0
updated = 0

for lg in found:
    external_id = str(lg["apiId"])
    name = lg["name"]
    country = lg["countryName"]

    cur.execute(
        """
        INSERT INTO leagues (name, country, external_id)
        VALUES (%s, %s, %s)
        ON CONFLICT (external_id)
        DO UPDATE SET name = EXCLUDED.name, country = EXCLUDED.country
        RETURNING (xmax = 0) AS was_inserted
        """,
        (name, country, external_id),
    )
    was_inserted = cur.fetchone()[0]
    if was_inserted: 
        inserted += 1
    else:
        updated += 1

# Save all changes and close
conn.commit()
print(f"Leagues inserted: {inserted}, updated: {updated}")

cur.close()
conn.close()