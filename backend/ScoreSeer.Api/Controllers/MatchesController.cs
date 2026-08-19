using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Models;
using ScoreSeer.Api.Services;
using ScoreSeer.Api.Dtos;
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
    private readonly ScoringService _scoringService;

    public MatchesController(ScoreSeerDbContext context, ScoringService scoringService)
    {
        _context = context;
        _scoringService = scoringService;
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

    // Sets the final result of a match and awards points to all its predicitons
    [HttpPost("{id}/result")]
    public async Task<IActionResult> SetResult(int id, MatchResultDto dto)
    {
        // The match must exist
        var match = await _context.Matches.FindAsync(id);
        if(match == null)
            return NotFound("Match not found!");

        // Scores cannot be negative
        if(dto.HomeScore < 0 || dto.AwayScore < 0)
            return BadRequest("Scores cannot be negative!");

        // Save the result and mark the match as finished
        match.HomeScore = dto.HomeScore;
        match.AwayScore = dto.AwayScore;
        match.Status = "finished";

        // Load all predictions for this match and award points
        var predictions = await _context.Predictions
                .Where(p => p.MatchId == id)
                .ToListAsync();

        foreach (var prediction in predictions)
        {
            prediction.PointsAwarded = _scoringService.CalculatePoints(
                prediction.PredictedHomeScore, prediction.PredictedAwayScore,
                dto.HomeScore, dto.AwayScore);
        }

        // Save everything
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Result saved and points awarded",
            match.Id,
            match.HomeScore,
            match.AwayScore,
            predictionsScored = predictions.Count
        });
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