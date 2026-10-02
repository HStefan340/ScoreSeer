using System.ComponentModel.DataAnnotations;

namespace ScoreSeer.Api.Dtos;

public class RegisterDto
{
    [Required(ErrorMessage = "Email is required.")]
    [MaxLength(255)]
    [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Enter a valid email adress.")]
    public string Email { get;set; } = string.Empty;

    [Required(ErrorMessage = "Username is required.")]
    [RegularExpression(@"^[A-Za-z0-9_]{3,20}$", ErrorMessage = "User must be 3-20 characters long: letters, digits or _")]
    public string Username { get;set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters.")]
    [MaxLength(64, ErrorMessage = "Password must be at most 64 characters.")]
    [RegularExpression(@"^(?=.*\p{L})(?=.*\d).+$", ErrorMessage = "Password must contain at least one letter and one digit.")]
    public string Password { get;set; } = string.Empty;
}