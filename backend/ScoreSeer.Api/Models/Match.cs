using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class Match
{
    public int Id { get; set; }

    public int LeagueId { get; set; }

    public int HomeTeamId { get; set; }

    public int AwayTeamId { get; set; }

    public DateTime KickoffAt { get; set; }

    public string Status { get; set; } = null!;

    public int? HomeScore { get; set; }

    public int? AwayScore { get; set; }

    public string? ExternalId { get; set; }

    public virtual Team AwayTeam { get; set; } = null!;

    public virtual Team HomeTeam { get; set; } = null!;

    public virtual League League { get; set; } = null!;

    public virtual ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();
}
