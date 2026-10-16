using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreSeer.Api.Dtos;

namespace ScoreSeer.Api.Tests;

public class AuthControllerUsernameTests
{
    [Fact]
    public async Task UsernameAvailable_FreeName_ReturnsTrue()
    {
        using var context = TestHelpers.CreateContext();
        var controller = TestHelpers.CreateAuthController(context);

        var result = await controller.UsernameAvailable("stefan");

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.True(TestHelpers.ToJson(ok.Value).GetProperty("available").GetBoolean());
    }

    [Fact]
    public async Task UsernameAvailable_TakenInDifferentCase_ReturnsFalse()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "stefan@example.com", "Stefan");
        var controller = TestHelpers.CreateAuthController(context);

        var result = await controller.UsernameAvailable("STEFAN");

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.False(TestHelpers.ToJson(ok.Value).GetProperty("available").GetBoolean());
    }

    [Theory]
    [InlineData("")]
    [InlineData("ab")]
    [InlineData("user name")]
    [InlineData("ștefan")]
    public async Task UsernameAvailable_InvlaidFormat_ReturnsFale(string username)
    {
        using var context = TestHelpers.CreateContext();
        var controller = TestHelpers.CreateAuthController(context);

        var result = await controller.UsernameAvailable(username);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.False(TestHelpers.ToJson(ok.Value).GetProperty("available").GetBoolean());
    }

    [Fact]
    public async Task ChooseUsername_NewGoogleUser_SetsNameAndReturnsToken()
    {
        using var context = TestHelpers.CreateContext();
        var user = await TestHelpers.AddUserAsync(context, "stefan@example.com", "user_1a2b3c4d", password: null);
        user.NeedsUsername = true;
        await context.SaveChangesAsync();

        var controller = TestHelpers.CreateAuthController(context);
        TestHelpers.SetUser(controller, user.Id);

        var result = await controller.ChooseUsername(new ChooseUsernameDto { Username = "Stefan_10" });

        var ok = Assert.IsType<OkObjectResult>(result);
        var body = TestHelpers.ToJson(ok.Value);
        Assert.False(string.IsNullOrEmpty(body.GetProperty("token").GetString()));
        Assert.False(body.GetProperty("user").GetProperty("NeedsUsername").GetBoolean());

        var saved = await context.Users.FindAsync(user.Id);
        Assert.Equal("Stefan_10", saved!.Username);
        Assert.False(saved.NeedsUsername);
    }

    [Fact]
    public async Task ChooseUsername_AlreadyChosen_ReturnsBadRequest()
    {
        using var context = TestHelpers.CreateContext();
        var user = await TestHelpers.AddUserAsync(context, "stefan@example.com", "stefan");

        var controller = TestHelpers.CreateAuthController(context);    
        TestHelpers.SetUser(controller, user.Id);

        var result = await controller.ChooseUsername(new ChooseUsernameDto { Username = "anotherName" });

        Assert.IsType<BadRequestObjectResult>(result);
        var saved = await context.Users.FindAsync(user.Id);
        Assert.Equal("stefan", saved!.Username);
    }

    [Fact]
    public async Task ChooseUsername_TakenInDifferentCase_ReturnsConflict()
    {
        using var context = TestHelpers.CreateContext();
        await TestHelpers.AddUserAsync(context, "someone@example.com", "stefan");
        var user = await TestHelpers.AddUserAsync(context, "stefan@gmail.com", "user_1a2b3c4d", password: null);
        user.NeedsUsername = true;
        await context.SaveChangesAsync();

        var controller = TestHelpers.CreateAuthController(context);    
        TestHelpers.SetUser(controller, user.Id);
        
        var result = await controller.ChooseUsername(new ChooseUsernameDto { Username = "STEFAN" });

        Assert.IsType<ConflictObjectResult>(result);
        var saved = await context.Users.FindAsync(user.Id);
        Assert.Equal("user_1a2b3c4d", saved!.Username);
        Assert.True(saved.NeedsUsername);
    }

    [Fact]
    public async Task ChooseUsername_NoUserInToken_ReturnsUnauthorized()
    {
        using var context = TestHelpers.CreateContext();
        var controller = TestHelpers.CreateAuthController(context);
        TestHelpers.SetUser(controller, null);

        var result = await controller.ChooseUsername(new ChooseUsernameDto { Username = "stefan" });

        Assert.IsType<UnauthorizedResult>(result);
    }
}