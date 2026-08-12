namespace ScoreSeer.Api.Services;

public class ScoringService
{
    // Calculates the points for a single prediction against the real result
    public int CalculatePoints(int predictedHome, int predictedAway, int actualHome, int actualAway)
    {
        // Exact score -> 3 points
        if(predictedHome == actualHome && predictedAway == actualAway)
            return 3;

        // Correct outcome (winner or draw) -> 1 point
        if(GetOutcome(predictedHome, predictedAway) == GetOutcome(actualHome, actualAway))
            return 1;

        return 0;
    }

    // Returns the outcome of a score: 1 = home win, 0 = draw, -1 = away win
    private int GetOutcome(int home, int away)
    {
        if(home > away) return 1;
        if(home < away) return -1;
        return 0;
    } 
}