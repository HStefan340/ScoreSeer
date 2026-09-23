from db import get_connection
from goal_client import goal

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

# Read matches that have started but are not finished yet
# These are the only ones whos status can still change (scheduled -> live -> finnished)
cur.execute(
    """
    SELECT id, external_id
    FROM matches
    WHERE kickoff_at <= NOW() AND status <> 'finished'
    """
)
matches_to_check = cur.fetchall()
print(f"Matches to check: {len(matches_to_check)}")

updated = 0
scored = 0

for match_local_id, external_id in matches_to_check:
    # Fetch the current state of this fixture from GOAL
    fx = goal.fixtures.get(external_id)["data"]

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