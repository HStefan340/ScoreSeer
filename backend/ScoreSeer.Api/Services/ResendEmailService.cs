using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace ScoreSeer.Api.Services;

// Sends emails through teh Resend HTTP API
public class ResendEmailServices : IEmailService
{
    private readonly HttpClient _http;
    private readonly IConfiguration _config;
    private readonly ILogger<ResendEmailServices> _logger;

    public ResendEmailServices(HttpClient http, IConfiguration config, ILogger<ResendEmailServices> logger)
    {
        _http = http;
        _config = config;
        _logger = logger;
    }

    public async Task<bool> SendAsync(string to, string subject, string html, string text)
    {
        var apiKey = _config["Email:ApiKey"];
        var from = _config["Email:From"];

        if(string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(from))
        {
            _logger.LogError("Email is not configured (Email:ApiKey or Email:From is missing).");
            return false;
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails");

        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        request.Content = JsonContent.Create(new
        {
            from,
            to = new[] { to },
            subject,
            html,
            text
        });

        try{
            using var response = await _http.SendAsync(request);

            if(response.IsSuccessStatusCode)
                return true;

            var body = await response.Content.ReadAsStringAsync();
            _logger.LogError("Resend rejected the email ({Status}): {Body}", (int) response.StatusCode, body);
            return false;
        }
        catch(Exception ex) when (ex is HttpRequestException or TaskCanceledException){
            _logger.LogError(ex, "Could not reach Resend.");
            return false;
        }
    }
}