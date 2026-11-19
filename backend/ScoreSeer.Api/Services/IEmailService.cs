namespace ScoreSeer.Api.Services;

// Sends emails: implemented by ResendEmailServices in the app and by a fake in tests
public interface IEmailService
{
    // Returns true when the provider accepted the email, false otherwise
    Task<bool> SendAsync(string to, string subject, string html, string text);
}