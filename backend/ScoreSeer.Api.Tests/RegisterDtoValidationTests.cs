using System.ComponentModel.DataAnnotations;
using ScoreSeer.Api.Dtos;

namespace ScoreSeer.Api.Tests;

public class RegisterDtoValidationTests
{
    // Runs the same DatAnnotations checks thet [ApiController] runs before an action
    private static List<ValidationResult> Validate(RegisterDto dto)
    {
        var results = new List<ValidationResult>();
        Validator.TryValidateObject(dto, new ValidationContext(dto), results, validateAllProperties: true);
        return results;
    }

    // A DTO the satisfies every rule: each test changes a single field
    private static RegisterDto ValidDto() => new()
    {
        Email = "stefan@example.com",
        Username = "stefan_10",
        Password = "password123"
    };

    [Fact]
    public void ValidDto_PassesValidation()
    {
        var results = Validate(ValidDto());

        Assert.Empty(results);
    }

    [Theory]
    [InlineData("")]
    [InlineData("stefan")]
    [InlineData("stefan@gmail")]
    [InlineData("stefan @gmail.com")]
    [InlineData("@gmail.com")]
    public void InvalidEmail_FailsValidation(string email)
    {
        var dto = ValidDto();
        dto.Email = email;

        var results = Validate(dto);
        
        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterDto.Email)));
    }

    [Theory]
    [InlineData("ab")]
    [InlineData("abcdefghijklmnopqrstu")]
    [InlineData("stefan!")]
    [InlineData("user name")]
    [InlineData("ștefan")]
    public void InvalidUsername_FailsValidation(string username)
    {
        var dto = ValidDto();
        dto.Username = username;

        var results = Validate(dto);

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterDto.Username)));
    }

    [Theory]
    [InlineData("abc")]
    [InlineData("Stefan_9879")]
    [InlineData("abcdefghijklmnopqrst")]
    public void ValidUsername_PassesValidation(string username)
    {
        var dto = ValidDto();
        dto.Username = username;

        Assert.Empty(Validate(dto));
    }

    [Theory]
    [InlineData("abc12")]
    [InlineData("passwordwithoutnumbers")]
    [InlineData("12345678")]
    public void InvalidPassword_FailsValidation(string password)
    {
        var dto = ValidDto();
        dto.Password = password;

        var results = Validate(dto);

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterDto.Password)));
    }

    [Fact]
    public void PasswordLongerThan64_FailsValidation()
    {
        var dto = ValidDto();
        dto.Password = "a1" + new string('x', 63); // 65 characters

        var results = Validate(dto);

        Assert.Contains(results, r => r.MemberNames.Contains(nameof(RegisterDto.Password)));
    }

    [Theory]
    [InlineData("ăîșțâ1234")]
    [InlineData("Password 123!")]
    public void ValidPassword_PassesValidation(string password)
    {
        var dto = ValidDto();
        dto.Password = password;

        Assert.Empty(Validate(dto));
    }
}