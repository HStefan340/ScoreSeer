using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Models;

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
    [HttpGet("{id}")]
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
}