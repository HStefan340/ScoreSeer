using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class League
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public string Country { get; set; } = null!;

    public string? ExternalId { get; set; }

    public virtual ICollection<Match> Matches { get; set; } = new List<Match>();

    public virtual ICollection<Team> Teams { get; set; } = new List<Team>();

    public virtual ICollection<User> Users { get; set; } = new List<User>();
}
