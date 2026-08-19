using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Models;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ScoreSeer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaguesController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;

    public LeaguesController(ScoreSeerDbContext context)
    {
        _context = context;
    }

    // Returns all leagues
    [HttpGet]
    public async Task<IActionResult> GetLeagues()
    {
        var leagues = await _context.Leagues
                .Select(l => new
                {
                    l.Id,
                    l.Name,
                    l.Country
                })
                .ToListAsync();
                
        return Ok(leagues);
    }

    // Helper: read the current user's id from the token
    private long GetUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return long.Parse(claim!);
    }

    // Follow a league
    [Authorize]
    [HttpPost("{id}/follow")]
    public async Task<IActionResult> FollowLeague(int id)
    {
        var userId = GetUserId();

        // Load the user togheter with the leagues they aleady follow
        var user = await _context.Users
                .Include(u => u.Leagues)
                .FirstOrDefaultAsync(u => u.Id == userId);

        if(user == null)
            return NotFound("User not found!");

        // The league must exist
        var league = await _context.Leagues.FindAsync(id);

        if(league == null)
            return NotFound("League not found!");
        
        // Skip if already following
        if(user.Leagues.Any(l => l.Id == id))
            return BadRequest("You already follow this league!");
        
        // Add the league to the user's followed list
        user.Leagues.Add(league);
        await _context.SaveChangesAsync();

        return Ok(new { message = "League followed!"});
    }

    // Unfollow a league
    [Authorize]
    [HttpDelete("{id}/follow")]
    public async Task<IActionResult> UnfollowLeague(int id)
    {
        var userId = GetUserId();

         // Load the user togheter with the leagues they aleady follow
        var user = await _context.Users
                .Include(u => u.Leagues)
                .FirstOrDefaultAsync(u => u.Id == userId);

        if(user == null)
            return NotFound("User not found!");

        // Find the followed league
        var league = user.Leagues.FirstOrDefault(l => l.Id == id);

        if(league == null)
            return NotFound("You don't follow the league!");

        // Remove it from the followed list
        user.Leagues.Remove(league);
        await _context.SaveChangesAsync();

        return Ok(new { message = "League unfollowed!"});
    }

    // Get the leagues the current user follows
    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyLeagues()
    {
        var userId = GetUserId();

        var leagues = await _context.Users
                .Where(u => u.Id == userId)
                .SelectMany(u => u.Leagues)
                .Select(l => new { l.Id, l.Name, l.Country})
                .ToListAsync();

        return Ok(leagues);
    }
    
}