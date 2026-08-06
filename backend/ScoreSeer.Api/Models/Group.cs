using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class Group
{
    public int Id { get; set; }

    public string Name { get; set; } = null!;

    public long OwnerId { get; set; }

    public string InviteCode { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    public virtual ICollection<Invitation> Invitations { get; set; } = new List<Invitation>();

    public virtual User Owner { get; set; } = null!;
}
