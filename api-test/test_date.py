import os
import requests
from dotenv import load_dotenv

# Load API key
load_dotenv()
API_KEY = os.getenv("APIFOOTBALL_KEY")

BASE_URL = "https://v3.football.api-sports.io"
HEADERS = {"x-apisports-key": API_KEY}

def call(endpoint, params=None):
    response = requests.get(f"{BASE_URL}/{endpoint}", headers=HEADERS, params=params)
    return response.json()

# Test A: can we filter fixtures by date on the free plan?
print("=" * 50)
print("Test A: fixtures by DATE only")
print("=" * 50)
data_a = call("fixtures", {"date": "2026-09-18"})
print(f"By date 2026-09-20: {len(data_a.get('response', []))} fixtures")
print(f"Errors: {data_a.get('errors')}")
