using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;
using ScoreSeer.Api.Models;
using ScoreSeer.Api.Services;

namespace ScoreSeer.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;
    private readonly TokenService _tokenService;

    public AuthController(ScoreSeerDbContext context, TokenService tokenService)
    {
        _context = context;
        _tokenService = tokenService;
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

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        //Finding the user by email
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        //If the user doesn't exist OR the password is incorrect -> same generic message
        if( user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        //Generate the JWT for the authenticated user
        var token = _tokenService.CreateToken(user);

        return Ok(new { 
            token,
            user = new { user.Id, user.Email, user.Username }
        });
    }
}