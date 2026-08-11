using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;
using ScoreSeer.Api.Models;
using ScoreSeer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;

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

    //Returns the current authenticated user's information; requires a valid token
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        
        //Extract the user ID from the token's claims
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                          ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        if(userIdClaim == null)
        return Unauthorized();

        // Convert the claim value to the user's ID type
        var userId = long.Parse(userIdClaim);

        //Fetch the user from database
        var user = await _context.Users.FindAsync(userId);

        if(user == null)
        return NotFound();

        return Ok(new { user.Id, user.Email, user.Username });

    }
}