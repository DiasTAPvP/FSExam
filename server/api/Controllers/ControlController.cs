using ex1.api.Models;
using ex1.api.Mqtt;
using ex1.dataaccess;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Text.Json;
using HiveMQtt.MQTT5.Types;
using StateleSSE.AspNetCore;

namespace ex1.api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ControlController : ControllerBase
{
    private readonly WindFarmDbContext _db;
    private readonly IMqttClient _mqtt;
    private readonly ILogger<ControlController> _logger;
    private readonly ISseBackplane _sse;
    private const string FarmId = "0b57aefe-6e6c-4a36-ad90-880321aa6d7b";

    public ControlController(WindFarmDbContext db, IMqttClient mqtt, ILogger<ControlController> logger, ISseBackplane sse)
    {
        _db = db;
        _mqtt = mqtt;
        _logger = logger;
        _sse = sse;
    }

    [HttpPost("{turbineId}/start")]
    public async Task<IActionResult> Start(string turbineId)
    {
        return await SendCommand(turbineId, "start", new { action = "start" });
    }

    [HttpPost("{turbineId}/stop")]
    public async Task<IActionResult> Stop(string turbineId, [FromQuery] string? reason)
    {
        return await SendCommand(turbineId, "stop", new { action = "stop", reason });
    }

    [HttpPost("{turbineId}/pitch")]
    public async Task<IActionResult> SetPitch(string turbineId, [FromQuery] double angle)
    {
        if (angle < 0 || angle > 30) return BadRequest("Pitch angle must be between 0 and 30.");
        return await SendCommand(turbineId, "setPitch", new { action = "setPitch", angle });
    }

    [HttpPost("{turbineId}/interval")]
    public async Task<IActionResult> SetInterval(string turbineId, [FromQuery] int interval)
    {
        if (interval < 1 || interval > 60) return BadRequest("Reporting interval must be between 1 and 60.");
        return await SendCommand(turbineId, "setInterval", new { action = "setInterval", value = interval });
    }

    private async Task<IActionResult> SendCommand(string turbineId, string action, object payload)
    {
        var jsonOptions = new JsonSerializerOptions 
        { 
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull 
        };
        var jsonPayload = JsonSerializer.Serialize(payload, jsonOptions);
        var topic = $"farm/{FarmId}/windmill/{turbineId}/command";

        _logger.LogInformation("Sending command {Action} to {TurbineId}", action, turbineId);

        // Audit Log
        var operatorName = User.Identity?.Name ?? "system-operator";
        var log = new CommandLog
        {
            TurbineId = turbineId,
            Action = action,
            Payload = jsonPayload,
            Timestamp = DateTime.UtcNow,
            Operator = operatorName,
            Status = "acknowledged"
        };
        _db.CommandLogs.Add(log);
        await _db.SaveChangesAsync();

        // Broadcast to SSE group "farm-updates"
        await _sse.Clients.SendToGroupAsync("farm-updates", log);

        // Publish to MQTT
        try
        {
            await _mqtt.PublishAsync(topic, jsonPayload, (QualityOfService)1);
            return Ok(new { success = true, logId = log.Id });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to publish command to MQTT");
            return StatusCode(500, "Failed to send command to IoT system.");
        }
    }
}