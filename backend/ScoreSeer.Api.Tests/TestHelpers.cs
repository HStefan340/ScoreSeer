using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using ScoreSeer.Api.Controllers;
using ScoreSeer.Api.Models;
using ScoreSeer.Api.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;


namespace ScoreSeer.Api.Tests;

// Shared setup for controller tests: isolated in-memory database, test configuration, controllers
public static class TestHelpers
{
    // Each call gets its own database name, so tests never share data
    public static ScoreSeerDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ScoreSeerDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        
        return new ScoreSeerDbContext(options);
    }

    // Cpnfiguration with teste-only JWT values (never the real key)
    public static IConfiguration CreateConfig()
    {
        var values = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "test-signing-key-that-is-long-enough-for-hmac-sha256",
            ["Jwt:Issuer"] = "ScoreSeer.Tests",
            ["Jwt:Audience"] = "ScoreSeer.Tests"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }

    public static AuthController CreateAuthController(ScoreSeerDbContext context)
    {
        var config = CreateConfig();
        return new AuthController(context, new TokenService(config), config);
    }

    // Simulates the identity JwtBearer builds from a valid token; null means no logged-in user
    public static void SetUser(ControllerBase controller, long? userid)
    {
        var claims = new List<Claim>();
        if(userid != null)
            claims.Add(new Claim(JwtRegisteredClaimNames.Sub, userid.Value.ToString()));

        var identity = new ClaimsIdentity(claims, userid == null ? null : "Test");

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = new ClaimsPrincipal(identity) }
        };
    }

    // Adds a user to the database: password null means a Google only-account
    public static async Task<User> AddUserAsync(ScoreSeerDbContext context, string email, string username, string? password = "password123")
    {
        var user = new User
        {
            Email = email,
            Username = username,
            PasswordHash = password == null ? null : BCrypt.Net.BCrypt.HashPassword(password),
            GoogleId = password == null ? "google-" + username : null,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync();
        return user;
    }

    // Converts an anonymous response object to JSON so its fields cand be read in tests
    public static JsonElement ToJson(object? value) => JsonSerializer.SerializeToElement(value);
}