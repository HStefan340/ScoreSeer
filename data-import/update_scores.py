from db import get_connection
from goal_client import goal
from datetime import date, timedelta

conn = get_connection()
cur = conn.cursor()

# Scoring rule (same as backend ScoringService)
# 3 = exact score, 1 = correct outcome, 0 = wrong outcome
def calculate_points(pred_home, pred_away, actual_home, actual_away):
    # Exact score
    if pred_home == actual_home and pred_away == actual_away:
        return 3

    # Correct outcome (both are home / away win / draw)
    if outcome(pred_home, pred_away) == outcome(actual_home, actual_away):
        return 1

    return 0

# Returns "home" / "draw" / "away" based on the score
def outcome(home, away):
    if home > away:
        return "home"

    if home < away:
        return "away"

    return "draw"

# Fetch fixtures for today and yesterday (covers matches that ended overnight)
today = date.today()
yesterday = today - timedelta(days=1)

fixtures = []
for day in [yesterday, today]:
    result = goal.fixtures.by_date(day.isoformat())
    fixtures.extend(result["data"])

print(f"Fixtures fetched (today + yesterday): {len(fixtures)}")

cur.execute("SELECT external_id, id FROM matches")
our_matches = {}
for external_id, local_id in cur.fetchall():
    our_matches[external_id] = local_id

updated = 0
scored = 0

for fx in fixtures:
    external_id = str(fx["id"])

    # Skip fixtures that are not in our database
    if external_id not in our_matches:
        continue

    match_local_id = our_matches[external_id]
    status = fx["matchStatus"].lower()
    home_score = fx["homeTeamScore"]
    away_score = fx["awayTeamScore"]

    # Update the match with its current status and score
    cur.execute(
        """
        UPDATE matches
        SET status = %s, home_score = %s, away_score = %s
        WHERE id = %s
        """,
        (status, home_score, away_score, match_local_id),
    )

    updated += 1

    # If the match just finished, score the predictions
    if status == "finished" and home_score is not None and away_score is not None:
        cur.execute(
            """
            SELECT id, predicted_home_score, predicted_away_score
            FROM predictions
            WHERE match_id = %s AND points_awarded IS NULL
            """,
            (match_local_id,),
        )

        for pred_id, pred_home, pred_away in cur.fetchall():
            points = calculate_points(pred_home, pred_away, home_score, away_score)
            cur.execute(
                "UPDATE predictions SET points_awarded = %s WHERE id = %s",
                (points, pred_id),
            )
            scorde += 1

conn.commit()
print(f"Matches updated: {updated}, predictions scored: {scored}")

cur.close()
conn.close()