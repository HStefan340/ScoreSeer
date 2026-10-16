using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;

namespace ScoreSeer.Api.Tests;

public class AuthControllerTests
{
    [Fact]
    public async Task Register_NewUser_SavesUserWithHashedPassword()
    {
        // Arrange
        using var context = TestHelpers.CreateContext();
        var controller = TestHelpers.CreateAuthController(context);
        var dto = new RegisterDto 
        { 
            Email = "stefan@example.com", 
            Username = "stefan",
            Password = "password123"
        };

        // Act 
        var result = await controller.Register(dto);

        // Assert
        Assert.IsType<OkObjectResult>(result);

        var saved = await context.Users.SingleAsync();
        Assert.Equal("stefan@example.com", saved.Email);
        Assert.NotEqual("password123", saved.PasswordHash);
        Assert.True(BCrypt.Net.BCrypt.Verify("password123", saved.PasswordHash));
        Assert.False(saved.NeedsUsername);
    }

    [Fact]
    public async Task Register_KeepsEmailLetterCase()
    {
        using var context = TestHelpers.CreateContext();
        var controller = TestHelpers.CreateAuthController(context);
        var dto = new RegisterDto 
        { 
            Email = "Stefan@example.com", 
            Username = "stefan",
            Password = "password123"
        };

        await controller.Register(dto);

        var saved = await context.Users.SingleAsync();
        Assert.Equal("Stefan@example.com", saved.Email);
    }

    [Fact]
    public async Task Register_EmailTakenInDifferentCase_ReturnsConflict()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "stefan@example.com", "stefan");
        var controller = TestHelpers.CreateAuthController(context);
        var dto = new RegisterDto 
        { 
            Email = "STEFAN@example.com", 
            Username = "someonelse",
            Password = "password123"
        };

        var result = await controller.Register(dto);
        
        Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal(1, await context.Users.CountAsync());
    }

    [Fact]
    public async Task Register_UsernameTakenInDifferentCase_ReturnsConlfict()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "stefan@example.com", "stefan");
        var controller = TestHelpers.CreateAuthController(context);
        var dto = new RegisterDto 
        { 
            Email = "example@example.com", 
            Username = "STEFAN",
            Password = "password123"
        };

        var result = await controller.Register(dto);

        Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal(1, await context.Users.CountAsync());
    }

    [Fact]
    public async Task Login_CorrectCredentials_ReturnsTokenAndUser()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "stefan@example.com", "stefan", "password123");
        var controller = TestHelpers.CreateAuthController(context);

        var result = await controller.Login(new LoginDto
        {
            Email = "stefan@example.com",
            Password = "password123"
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var body = TestHelpers.ToJson(ok.Value);

        Assert.False(string.IsNullOrEmpty(body.GetProperty("token").GetString()));
        Assert.Equal("stefan", body.GetProperty("user").GetProperty("Username").GetString());
    }

    [Fact]
    public async Task Login_EmailInDifferentCase_Succeeds()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "Stefan@example.com", "stefan", "password123");
        var controller = TestHelpers.CreateAuthController(context);

        var result = await controller.Login(new LoginDto
        {
            Email = "stefan@example.com",
            Password = "password123"
        });

        Assert.IsType<OkObjectResult>(result);
    }

    [Fact]
    public async Task Login_WrongPasswordAndUnknownEmail_ReturnSameError()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "stefan@example.com", "stefan", "password123");
        var controller = TestHelpers.CreateAuthController(context);

        var wrongPasswrod = await controller.Login(new LoginDto
        {
            Email = "stefan@example.com",
            Password = "wrong123"
        });

        var wrongEmail = await controller.Login(new LoginDto
        {
            Email = "example@example.com",
            Password = "password123"
        });

        var first = Assert.IsType<UnauthorizedObjectResult>(wrongPasswrod);
        var second = Assert.IsType<UnauthorizedObjectResult>(wrongEmail);

        Assert.Equal(first.Value, second.Value);
    }

    [Fact]
    public async Task Login_GoogleOnlyAccount_ReturnsUnauthorized()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "stefan@gmail.com", "stefan", password: null);
        var controller = TestHelpers.CreateAuthController(context);

        var result = await controller.Login(new LoginDto
        {
            Email = "stefan@gmail.com",
            Password = "password123"
        });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}