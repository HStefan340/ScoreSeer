using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Models;

namespace ScoreSeer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeamsController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;
    
    public TeamsController(ScoreSeerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTeams()
    {
        var teams = await _context.Teams.ToListAsync();
        return Ok(teams);
    }
}