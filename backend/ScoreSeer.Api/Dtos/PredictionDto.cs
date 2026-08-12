namespace ScoreSeer.Api.Dtos;

public class PredictionDto
{
    public int MatchId { get; set; }
    public int PredictedHomeScore { get; set; }
    public int PredictedAwayScore { get; set; }
}