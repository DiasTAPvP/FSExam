using ex1.dataaccess;
using ex1.api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ex1.api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HistoryController : ControllerBase
{
    private readonly WindFarmDbContext _db;

    public HistoryController(WindFarmDbContext db)
    {
        _db = db;
    }

    [HttpGet("telemetry/{turbineId}")]
    public async Task<ActionResult<IEnumerable<Telemetry>>> GetTelemetry(string turbineId, [FromQuery] int limit = 100)
    {
        return await _db.Telemetries
            .Where(t => t.TurbineId == turbineId)
            .OrderByDescending(t => t.Timestamp)
            .Take(limit)
            .ToListAsync();
    }

    [HttpGet("alerts/{turbineId}")]
    public async Task<ActionResult<IEnumerable<Alert>>> GetAlerts(string turbineId, [FromQuery] int limit = 50)
    {
        return await _db.Alerts
            .Where(a => a.TurbineId == turbineId)
            .OrderByDescending(a => a.Timestamp)
            .Take(limit)
            .ToListAsync();
    }

    [HttpGet("commands/{turbineId}")]
    public async Task<ActionResult<IEnumerable<CommandLog>>> GetCommands(string turbineId, [FromQuery] int limit = 50)
    {
        return await _db.CommandLogs
            .Where(c => c.TurbineId == turbineId)
            .OrderByDescending(c => c.Timestamp)
            .Take(limit)
            .ToListAsync();
    }
}