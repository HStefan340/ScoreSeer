using ScoreSeer.Api.Services;

namespace ScoreSeer.Api.Tests;

// Records emails instead of sendind them, so tests can check what would have been sent
public class FakeEmailService : IEmailService
{
    public List<SentEmail> Sent { get; } = new();

    public bool ShoudFail { get; set; }

    public Task<bool> SendAsync(String to , string subject, string html, string text)
    {
        if(ShoudFail)
        {
            return Task.FromResult(false);
        }

        Sent.Add(new SentEmail(to, subject, html, text));
        return Task.FromResult(true);

    }
}

// One email captured by FakeEmailService
public record SentEmail(string To, string Subject, string HTML, string Text);