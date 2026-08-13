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
}