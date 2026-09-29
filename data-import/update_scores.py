from db import get_connection
from goal_client import goal
from collections import defaultdict


# Stop calling the API when fewer requests than this remain for the day
MIN_REMAINING = 100

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

# Matches that kicked off in last 3 days and ar not finished yet
cur.execute(
    """
    SELECT m.id, m.external_id, l.external_id, (m.kickoff_at AT TIME ZONE 'UTC')::date
    FROM matches m
    JOIN leagues l ON l.id = m.league_id
    WHERE m.kickoff_at <= NOW()
        AND m.kickoff_at >= NOW() - INTERVAL '3 days'
        AND m.status <> 'finished'
    """
)

# Group active matches by (league, day): one API request per group
groups = defaultdict(dict)
for match_id, match_ext_id, league_ext_id, match_day in cur.fetchall():
    groups[(league_ext_id, match_day.isoformat())][match_ext_id] = match_id

print(f"Active league/day groups: {len(groups)}")

updated = 0
scored = 0

for (league_ext_id, day), our_matches in groups.items():
    # Stop early if the daily API budget is almost used up
    remaining = goal.rate_limit.remaining
    if remaining is not None and remaining < MIN_REMAINING:
        print(f"Stopping: only {remaining} requests left today")
        break

    fixtures = goal.fixtures.by_date(day, leagueId=league_ext_id)["data"]

    for fx in fixtures:
        match_id = our_matches.get(str(fx["id"]))

        # Skip fixtures that are not one of DataBase active matches
        if match_id is None:
            continue

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
            (status, home_score, away_score, match_id),
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
                (match_id,),
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