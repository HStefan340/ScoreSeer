using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class Prediction
{
    public long Id { get; set; }

    public long UserId { get; set; }

    public int MatchId { get; set; }

    public int PredictedHomeScore { get; set; }

    public int PredictedAwayScore { get; set; }

    public int? PointsAwarded { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Match Match { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
