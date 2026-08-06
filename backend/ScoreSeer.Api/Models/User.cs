using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class User
{
    public long Id { get; set; }

    public string Email { get; set; } = null!;

    public string? PasswordHash { get; set; }

    public string? GoogleId { get; set; }

    public string Username { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ICollection<GroupMember> GroupMembers { get; set; } = new List<GroupMember>();

    public virtual ICollection<Group> Groups { get; set; } = new List<Group>();

    public virtual ICollection<Invitation> InvitationReceivers { get; set; } = new List<Invitation>();

    public virtual ICollection<Invitation> InvitationSenders { get; set; } = new List<Invitation>();

    public virtual ICollection<Prediction> Predictions { get; set; } = new List<Prediction>();

    public virtual ICollection<League> Leagues { get; set; } = new List<League>();
}
