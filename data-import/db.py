import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

# Production (e.g. GitHub Actions): full connection string in DATABASE_URL
# Local development: separate DB_* values from .env
def get_connection():
    database_url = os.getenv("DATABASE_URL")

    if database_url:
        return psycopg2.connect(database_url)

    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        dbname=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )