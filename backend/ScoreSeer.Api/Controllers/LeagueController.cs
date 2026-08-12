using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Models;

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

}