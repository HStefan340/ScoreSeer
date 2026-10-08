using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;
using ScoreSeer.Api.Models;
using ScoreSeer.Api.Services;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Google.Apis.Auth;
using Microsoft.AspNetCore.RateLimiting;
using System.Text.RegularExpressions;

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

        return Ok(new { user.Id, user.Email, user.Username, user.NeedsUsername });
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
            user = new { user.Id, user.Email, user.Username, user.NeedsUsername }
        });
    }

    [EnableRateLimiting("auth")]
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

        if(!payload.EmailVerified)
        {
            return Unauthorized("Google email is not verified");
        }

        // Try to find an existing user by their Google ID
        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject);

        // If not found by Google ID, try by their email (in case they registered with email before)
        if(user == null)
        {
            var existing = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == payload.Email.ToLower());

            if(existing != null)
            {
                // Not linked automatically: email ownership is not verified at registration
                return Conflict("An account with this email already exists. Log in with your password.");
            }
        }

        // If still no user, create a brand new account from the Google info
        if(user == null)
        {
            user = new User
            {
                Email = payload.Email,
                GoogleId = payload.Subject,
                Username = "user_" + Guid.NewGuid().ToString("N").Substring(0,8), //temporary
                NeedsUsername = true,
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
            user = new { user.Id, user.Email, user.Username, user.NeedsUsername }
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

        return Ok(new { user.Id, user.Email, user.Username, user.NeedsUsername });

    }

    // Reads the current User's ID from the token
    private long? GetUserId()
    {
        var claim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                 ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

        return long.TryParse(claim, out var id) ? id : null;
    }

    // Checks wheter a username is valid and not taken (used while typing)
    [EnableRateLimiting("lookup")]
    [HttpGet("username-available")]
    public async Task<IActionResult> UsernameAvailable([FromQuery] string? username)
    {
        var name = (username ?? string.Empty).Trim();

        if(!Regex.IsMatch(name,"^[A-Za-z0-9_]{3,20}$"))
            return Ok(new { available = false });

        var taken = await _context.Users.AnyAsync(u => u.Username.ToLower() == name.ToLower());
            return Ok(new { available = !taken });
    }

    // Lets a new Google user replace the temporary username, once
    [Authorize]
    [EnableRateLimiting("lookup")]
    [HttpPost("username")]
    public async Task<IActionResult> ChooseUsername(ChooseUsernameDto dto)
    {
        var userid = GetUserId();
        if(userid == null)
            return Unauthorized();

        var user = await _context.Users.FindAsync(userid.Value);
        if(user == null)
            return NotFound();

        if(!user.NeedsUsername)
            return BadRequest("Username has been already chosen.");

        var name = dto.Username.Trim();
        if(await _context.Users.AnyAsync(u => u.Id != user.Id && u.Username.ToLower() == name.ToLower()))
            return Conflict("Username is already in use.");

        user.Username = name;
        user.NeedsUsername = false;
        await _context.SaveChangesAsync();

        // New token so it carries the final username
        var token = _tokenService.CreateToken(user);

        return Ok(new
        {
            token,
            user = new { user.Id, user.Email, user.Username, user.NeedsUsername }
        });
    }
}