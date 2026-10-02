# Scoring rule (same as backend ScoringService)
# 3 = exact score, 1 = correct outcome, 0 = wrong outcome
def calculate_points(pred_home, pred_away, actual_home, actual_away):

    pred_home, pred_away = int(pred_home), int(pred_away)
    actual_home, actual_away = int(actual_home), int(actual_away)
    
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