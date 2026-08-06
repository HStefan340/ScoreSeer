using System;
using System.Collections.Generic;

namespace ScoreSeer.Api.Models;

public partial class Invitation
{
    public long Id { get; set; }

    public int GroupId { get; set; }

    public long SenderId { get; set; }

    public long ReceiverId { get; set; }

    public string Status { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Group Group { get; set; } = null!;

    public virtual User Receiver { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
