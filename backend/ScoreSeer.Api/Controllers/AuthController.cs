using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;
using ScoreSeer.Api.Models;
using ScoreSeer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Google.Apis.Auth;
using Microsoft.AspNetCore.RateLimiting;

namespace ScoreSeer.Api.Controllers;
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ScoreSeerDbContext _context;
    private readonly TokenService _tokenService;
    private readonly IConfiguration _config;

    public AuthController(ScoreSeerDbContext context, TokenService tokenService, IConfiguration config)
    {
        _context = context;
        _tokenService = tokenService;
        _config = config;
    }

    [EnableRateLimiting("auth")]
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // Stored as type (without surrounding spaces), compared case-insensitively
        var email = dto.Email.Trim();
        var username = dto.Username.Trim();

        // Email must not be used already, in any letter case
        if(await _context.Users.AnyAsync(u => u.Email.ToLower() == email.ToLower()))
        {
            return Conflict("Email is already in use.");
        }

        // Username must not be used already, in any letter case
        if(await _context.Users.AnyAsync(u => u.Username.ToLower() == username.ToLower()))
        {
            return Conflict("Username is already in use.");
        }

        // Hashing the password
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        // Creating a new user
        var user = new User
        {
            Email = email,
            Username = username,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };

        // Adding the user to the database
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { user.Id, user.Email, user.Username });
    }

    [EnableRateLimiting("auth")]
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        // Finding the user by email, regardless of letter case
        var email = dto.Email.Trim();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

        // If the user doesn't exist OR the password is incorrect -> same generic message
        if( user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized("Invalid email or password.");
        }

        // Generate the JWT for the authenticated user
        var token = _tokenService.CreateToken(user);

        return Ok(new { 
            token,
            user = new { user.Id, user.Email, user.Username }
        });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginDto dto)
    {
       GoogleJsonWebSignature.Payload payload;

       // Verify the Google token against our Client ID 
       try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new [] { _config["Google:ClientId"] }
            };

            payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken, settings);
        } 
        catch
        {
            //If the token is invlaid or verification fails
            return Unauthorized("Invalid Google token.");
        }

        // Try to find an existing user by their Google ID
        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject);

        // If not found by Google ID, try by their email (in case they registered with email before)
        if(user == null)
        {
            user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == payload.Email.ToLower());

            if(user != null)
            {
                // Existing email account: link the Google ID to it
                user.GoogleId = payload.Subject;
                await _context.SaveChangesAsync();
            }
        }

        // If still no user, create a brand new account from the Google info
        if(user == null)
        {
            user = new User
            {
                Email = payload.Email,
                GoogleId = payload.Subject,
                Username = "user_" + Guid.NewGuid().ToString("N").Substring(0,8),
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }

        // Issue our own JWT, exactly like a normal login
        var token = _tokenService.CreateToken(user);

        return Ok(new
        {
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