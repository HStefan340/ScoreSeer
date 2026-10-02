from scoring import calculate_points, outcome


def test_exact_score_gives_3_points():
    assert calculate_points(2, 1, 2, 1) == 3

def test_exact_draw_gives_3_points():
    assert calculate_points(0, 0, 0, 0) == 3

def test_correct_outcome_home_win_wrong_score_gives_1_point():
    assert calculate_points(2, 1, 3, 0) == 1

def test_correct_away_wins_wrong_score_gives_1_point():
    assert calculate_points(0, 1, 1, 3) == 1

def test_correct_draw_wrong_score_gives_1_point():
    assert calculate_points(1, 1, 2, 2) == 1

def test_wrong_outcome_gives_0_points():
    assert calculate_points(2, 1, 0, 1) == 0

def test_predicted_draw_but_home_win_gives_0_points():
    assert calculate_points(1, 1, 2, 1) == 0

def test_outcome():
    assert outcome(2, 0) == "home"
    assert outcome(2, 3) == "away"
    assert outcome(2, 2) == "draw"