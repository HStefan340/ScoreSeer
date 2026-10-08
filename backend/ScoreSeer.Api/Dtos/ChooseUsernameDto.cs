using System.ComponentModel.DataAnnotations;

namespace ScoreSeer.Api.Dtos;

public class ChooseUsernameDto
{
    [Required(ErrorMessage = "Username is required.")]
    [RegularExpression(@"^[A-Za-z0-9_]{3,20}$", ErrorMessage = "Username must be 3-20 characters: letters, digits or _.")]
    public string Username { get; set; } = string.Empty;
}