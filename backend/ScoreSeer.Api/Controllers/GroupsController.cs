using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;
using ScoreSeer.Api.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ScoreSeer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // All group endpoints require a valid token
public class GroupsController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;

    public GroupsController(ScoreSeerDbContext context)
    {
        _context = context;
    }

    // Helper: read the current user's id from the token
    private long GetUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(claim!);
    }

    // Create group: the creator becomes owner and first member
    [HttpPost]
    public async Task<IActionResult> CreateGroup(CreateGroupDto dto)
    {
        var userId = GetUserId();

        // Basic validation
        if(string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Group name is required!");

        // Generate a unique short invite code
        var inviteCode = Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();

        // Create the group
        var group = new Group
        {
            Name = dto.Name,
            OwnerId = userId,
            InviteCode = inviteCode,
            CreatedAt = DateTime.UtcNow
        };

        _context.Groups.Add(group);
        await _context.SaveChangesAsync();

        // Add the creator as the first member, with owner role
        var member = new GroupMember
        {
            GroupId = group.Id,
            UserId = userId,
            Role = "owner",
            JoinedAt = DateTime.UtcNow
        };

        _context.GroupMembers.Add(member);
        await _context.SaveChangesAsync();

        return Ok(new { group.Id, group.Name, group.InviteCode });
    }

    // Get all groups the current user is a member of
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyGroups()
    {
        var userId = GetUserId();

        var groups = await _context.GroupMembers
                .Where(gm => gm.UserId == userId)
                .Select(gm => new
                {
                    gm.Group.Id,
                    gm.Group.Name,
                    gm.Group.InviteCode,
                    gm.Role,
                    MemberCount = gm.Group.GroupMembers.Count
                })
                .ToListAsync();

        return Ok(groups);
    }

    // Get the members of a specific group (only if the current user belongs to it)
    [HttpGet("{id}/members")]
    public async Task<IActionResult> GetGroupMembers(int id)
    {
        var userId = GetUserId();

        // The user must be a member of the group to see its members
        var isMember = await _context.GroupMembers.AnyAsync(gm => gm.GroupId == id && gm.UserId == userId);

        if(!isMember)
            return Forbid();

        var members = await _context.GroupMembers
                .Where(gm => gm.GroupId == id)
                .Select(gm => new
                {
                    gm.User.Id,
                    gm.User.Username,
                    gm.Role,gm.JoinedAt
                })
                .ToListAsync();

        return Ok(members);
    }

    // Send an invitation to another user to join a group
    [HttpPost("invitations")]
    public async Task<IActionResult> SendInvitation(CreateInvitation dto)
    {
        var userId = GetUserId();

        // The sender must be a member of the group
        var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == dto.GroupId && gm.UserId == userId);

        if(!isMember)
            return Forbid();

        // Cannot invite yourself
        if(dto.ReceiverId == userId)
            return BadRequest("You cannot invite yourself!");

        // The receiver must exist
        var receiverExists = await _context.Users.AnyAsync(u => u.Id == dto.ReceiverId);
        
        if(!receiverExists)
            return NotFound("User not found!");

        // The receiver must not already be a member
        var alreadyMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == dto.GroupId && gm.UserId == dto.ReceiverId);

        if(alreadyMember)
            return BadRequest("User is already a member of this group!");

        // There must not be a pending invitation already
        var pendingExists = await _context.Invitations
                .AnyAsync(i => i.GroupId == dto.GroupId && i.ReceiverId == dto.ReceiverId && i.Status == "pending");

        if(pendingExists)
            return BadRequest("An invitation is already pending for this user!");

        // Create the invitation
        var invitation = new Invitation
        {
            GroupId = dto.GroupId,
            SenderId = userId,
            ReceiverId = dto.ReceiverId,
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        _context.Invitations.Add(invitation);
        await _context.SaveChangesAsync();

        return Ok(new { invitation.Id, message = "Invitation sent." });
    }

    // Get all pending invitations received by the current user
    [HttpGet("invitations/received")]
    public async Task<IActionResult> GetReceivedInvitations()
    {
        var userId = GetUserId();

        var invitations = await _context.Invitations
                .Where(i => i.ReceiverId == userId && i.Status == "pending")
                .Select(i => new
                {
                    i.Id,
                    GroupId = i.GroupId,
                    GroupName = i.Group.Name,
                    SenderUsername = i.Sender.Username,
                    i.CreatedAt
                })
                .ToListAsync();

        return Ok(invitations);
    }

    // Respond to an invitation: accept or decline
    [HttpPost("invitations/{id}/respond")]
    public async Task<IActionResult> RespondToInvitation(long id, [FromQuery] bool accept)
    {
        var userId = GetUserId();

        // The invitation must exist
        var invitation = await _context.Invitations.FindAsync(id);

        if(invitation == null)
            return NotFound("You have no invitations!");

        // Only the receiver can respond to it
        if(invitation.ReceiverId != userId)
            return Forbid();
        
        // It must still be pending
        if(invitation.Status != "pending")
            return BadRequest("This invitation has already been answered");

        if(accept)
        {
            // Mark the invitation as accepted
            invitation.Status = "accepted";

            // Add the user as a member of the group
            var member = new GroupMember
            {
                GroupId = invitation.GroupId,
                UserId = userId,
                Role = "member",
                JoinedAt = DateTime.UtcNow
            };

            _context.GroupMembers.Add(member);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Invitation accepted. You joined the group!" });
        }
        else
        {
            // Just mark it as declined
            invitation.Status = "declined";
            await _context.SaveChangesAsync();
            return Ok(new { message = " Invitation declined!" });
        }
    }

    // Get the leaderboard for a group (Members ranked by total points)
    [HttpGet("{id}/leaderboard")]
    public async Task<IActionResult> GetLeaderboard(int id)
    {
        var userId = GetUserId();

        // The user must be a amember of the group to see its leaderboard
        var isMember = await _context.GroupMembers
                .AnyAsync(gm => gm.GroupId == id && gm.UserId == userId);

        if(!isMember)
            return Forbid();

        //For each member sum the points from their predicitions
        var leaderboard = await _context.GroupMembers
                .Where(gm => gm.GroupId == id)
                .Select(gm => new
                {
                    gm.UserId,
                    gm.User.Username,
                    // Sum of points across teh user's prediction (0 if none)
                    TotalPoints = _context.Predictions
                            .Where(p => p.UserId == gm.UserId && p.PointsAwarded != null)
                            .Sum(p => p.PointsAwarded) ?? 0,
                    // How many predicitions they've had scored
                    PredictionsScored = _context.Predictions
                            .Count(p => p.UserId == gm.UserId && p.PointsAwarded !=null)
                })
                .OrderByDescending(x => x.TotalPoints)
                .ToListAsync();

        return Ok(leaderboard);
    }
}