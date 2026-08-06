using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class Team
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string? ShortName { get; set; }

    public string? LogoUrl { get; set; }

    public int LeagueId { get; set; }

    public string? ExternalId { get; set; }

    public virtual League League { get; set; } = null!;

    public virtual ICollection<Match> MatchAwayTeams { get; set; } = new List<Match>();

    public virtual ICollection<Match> MatchHomeTeams { get; set; } = new List<Match>();
}
