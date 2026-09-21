import os
from dotenv import load_dotenv
from goal_api import GoalAPI

load_dotenv()

# A ready-to-use GOAL API client
goal = GoalAPI(os.getenv("GOALAPI_KEY"))