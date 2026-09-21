import psycopg2
import os
from dotenv import load_dotenv
\
load_dotenv()

# Connect to PostgreSQL database
conn = psycopg2.connect(
    host = os.getenv("DB_HOST"),
    port = os.getenv("DB_PORT"),
    dbname = os.getenv("DB_NAME"),
    user = os.getenv("DB_USER"),
    password = os.getenv("DB_PASSWORD"),
)

# A cursor is the object that runs SQL through
cur = conn.cursor()

# Simple test: count the leagues currently in the database
cur.execute("SELECT COUNT(*) FROM leagues")
count = cur.fetchone()[0]
print(f"Leagues in database: {count}")

cur.close()
conn.close()
print("Connection OK")