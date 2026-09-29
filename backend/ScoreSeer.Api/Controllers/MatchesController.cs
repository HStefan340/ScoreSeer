using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Models;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;

namespace ScoreSeer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MatchesController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;

    public MatchesController(ScoreSeerDbContext context)
    {
        _context = context;
    }

    // Returns all matches with their team and league details
    [HttpGet]
    public async Task<IActionResult> GetMatches()
    {
        var matches = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.League)
                .OrderBy(m => m.KickoffAt)
                .Select(m => new
                {
                    m.Id,
                    League = m.League.Name,
                    HomeTeam = m.HomeTeam.Name,
                    AwayTeam = m.AwayTeam.Name,
                    m.KickoffAt,
                    m.Status,
                    m.HomeScore,
                    m.AwayScore
                })
                .ToListAsync();

        return Ok(matches);
    }

    // Returns a single match by its id, with team and league details
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetMatch(int id)
    {
        var match = await _context.Matches
                .Include(m => m.HomeTeam)
                .Include(m => m.AwayTeam)
                .Include(m => m.League)
                .Where(m => m.Id == id)
                .Select(m => new
                {
                    m.Id,
                    League = m.League.Name,
                    HomeTeam = m.HomeTeam.Name,
                    AwayTeam = m.AwayTeam.Name,
                    m.KickoffAt,
                    m.Status,
                    m.HomeScore,
                    m.AwayScore
                })
                .FirstOrDefaultAsync();

        // If no match exists with that id, return 404
        if(match == null)
            return NotFound();

        return Ok(match);
    }

    // Helper: read the current user's id from the token
    private long GetUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return long.Parse(claim!);
    }

    // Get matches only from the leagues the current user follows
    [Authorize]
    [HttpGet("followed")]
    public async Task<IActionResult> GetFollowedMatches()
    {
        var userId = GetUserId();

        // Get the IDs of leagues the user follows
        var followedLeagueIds = await _context.Users
                    .Where(u => u.Id == userId)
                    .SelectMany(u => u.Leagues)
                    .Select(l => l.Id)
                    .ToListAsync();
        
        // Get matches only from yhose leagues
        var matches = await _context.Matches
                    .Where(m => followedLeagueIds.Contains(m.LeagueId))
                    .Include(m => m.HomeTeam)
                    .Include(m => m.AwayTeam)
                    .Include(m => m.League)
                    .OrderBy(m => m.KickoffAt)
                    .Select(m => new
                    {
                        m.Id,
                        League = m.League.Name,
                        HomeTeam = m.HomeTeam.Name,
                        AwayTeam = m.AwayTeam.Name,
                        m.KickoffAt,
                        m.Status,
                        m.HomeScore,
                        m.AwayScore
                    })
                    .ToListAsync();

        return Ok(matches);
    }
}