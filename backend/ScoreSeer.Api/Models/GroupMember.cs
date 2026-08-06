using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class GroupMember
{
    public int GroupId { get; set; }

    public long UserId { get; set; }

    public string Role { get; set; } = null!;

    public DateTime JoinedAt { get; set; }

    public virtual Group Group { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
