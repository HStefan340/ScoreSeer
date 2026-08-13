using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Models;

namespace ScoreSeer.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;
    
    public UsersController(ScoreSeerDbContext context)
    {
        _context = context;
    }

    // Search user by username (partial match), for the invite search bar
    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q)
    {
        // Require at least 2 characters to avoid returning everyone
        if(string.IsNullOrWhiteSpace(q) || q.Length < 2)
            return BadRequest("Search term must be at leats 2 characters!");

        var users = await _context.Users
                .Where(u => u.Username.ToLower().Contains(q.ToLower()))
                .Select(u => new { u.Id, u.Username })
                .Take(20)
                .ToListAsync();
        
        return Ok(users);
    }
}