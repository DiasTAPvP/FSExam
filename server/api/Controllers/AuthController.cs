using ex1.dataaccess;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ex1.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly WindFarmDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(WindFarmDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        
        // Simple password check
        if (user == null || user.PasswordHash != request.Password)
        {
            return Unauthorized("Invalid credentials.");
        }

        var token = GenerateJwtToken(user);
        return Ok(new { token, username = user.Username, role = user.Role });
    }

    private string GenerateJwtToken(Models.User user)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "VerySecretWindmillKeyThatIsLongEnough"));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "WindFarmAPI",
            audience: _config["Jwt:Audience"] ?? "WindFarmOperators",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
