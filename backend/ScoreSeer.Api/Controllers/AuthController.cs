using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;
using ScoreSeer.Api.Models;

namespace ScoreSeer.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;

    public AuthController(ScoreSeerDbContext context)
    {
        _context = context;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        //Checking email not to be already used
        if(await _context.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return BadRequest("Email is already in use.");
        }

        //Checking username not to be already used
        if(await _context.Users.AnyAsync(u => u.Username == dto.Username))
        {
            return BadRequest("Username is already in use.");
        }

        //Hashing the password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        //Creating a new user
        var user = new User
        {
            Email = dto.Email,
            Username = dto.Username,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        //Adding the user to the database
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.Email, user.Username });
    }
}