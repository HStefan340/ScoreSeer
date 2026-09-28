import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Connect the Neon database using connection string
conn = psycopg2.connect(os.getenv("NEON_URL"))
cur = conn.cursor()

# Check the connection works and see the Postgres version
cur.execute("SELECT version()")
print(cur.fetchone()[0])

# List existing tables (should be empty for now)
cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
tables = cur.fetchall()

print(f"Tables in Neon: {len(tables)}")

cur.execute("SELECT COUNT(*) FROM leagues")
print("Leagues:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM matches")
print("Matches:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM teams")
print("Teams:", cur.fetchone()[0])
cur.execute("SELECT COUNT(*) FROM users")
print("Users:", cur.fetchone()[0])

cur.close()
conn.close()
print("Neon connection OK")