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
[Authorize] // Every endpoint here requires a valid token
public class PredictionsController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;

    public PredictionsController(ScoreSeerDbContext context)
    {
        _context = context;
    }

    // Helper: read the current user's id from the token
    private long GetUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.Parse(claim!);
    }

    // Submit or update a prediction for a match
    [HttpPost]
    public async Task<IActionResult> SubmitPrediction(PredictionDto dto)
    {
        var userId = GetUserId();

        // The match must exist
        var match = await _context.Matches.FindAsync(dto.MatchId);
        if(match == null)
            return NotFound("Match not found!");

        // The match must not have started yet
        if(DateTime.UtcNow >= match.KickoffAt)
            return BadRequest("Predictions are closed for this match!");

        // Scores cannot be negative
        if(dto.PredictedHomeScore < 0 || dto.PredictedAwayScore < 0)
            return BadRequest("Scores cannot be negative!");

        // Check if user already predicted this match
        var existing = await _context.Predictions
            .FirstOrDefaultAsync(p => p.UserId == userId && p.MatchId == dto.MatchId);

        if(existing != null)
        {
            // Update teh existing prediction (allowed until kick-off)
            existing.PredictedHomeScore = dto.PredictedHomeScore;
            existing.PredictedAwayScore = dto.PredictedAwayScore;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Prediction updated!", existing.Id });
        }

        // Otherwise create a new prediction
        var prediction = new Prediction
        {
            UserId = userId,
            MatchId = dto.MatchId,
            PredictedHomeScore = dto.PredictedHomeScore,
            PredictedAwayScore = dto.PredictedAwayScore,
            CreatedAt = DateTime.UtcNow
        };

        _context.Predictions.Add(prediction);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Prediction submitted!", prediction.Id});
    }
} 