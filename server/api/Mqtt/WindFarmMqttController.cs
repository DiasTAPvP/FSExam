using ex1.api.Models;
using ex1.dataaccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Mqtt.Controllers;
using StateleSSE.AspNetCore;

namespace ex1.api.Mqtt;

public class WindFarmMqttController : MqttController
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<WindFarmMqttController> _logger;
    private readonly ISseBackplane _sse;

    public WindFarmMqttController(IServiceScopeFactory scopeFactory, ILogger<WindFarmMqttController> logger, ISseBackplane sse)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
        _sse = sse;
        _logger.LogInformation("WindFarmMqttController created!");
    }

    [MqttRoute("farm/0b57aefe-6e6c-4a36-ad90-880321aa6d7b/windmill/{turbineId}/telemetry")]
    public async Task HandleTelemetry(string turbineId, Telemetry telemetry)
    {
        try
        {
            _logger.LogInformation("Received telemetry for {TurbineId}", turbineId);
            
            // Ensure turbine ID matches the route and timestamp is set
            telemetry.TurbineId = turbineId;
            if (telemetry.Timestamp == default) telemetry.Timestamp = DateTime.UtcNow;
            
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<WindFarmDbContext>();
                db.Telemetries.Add(telemetry);
                await db.SaveChangesAsync();
            }

            // Broadcast to SSE group "farm-updates"
            // We use the generic message event as we cannot easily change event type here
            await _sse.Clients.SendToGroupAsync("farm-updates", telemetry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving telemetry for {TurbineId}", turbineId);
        }
    }

    [MqttRoute("farm/0b57aefe-6e6c-4a36-ad90-880321aa6d7b/windmill/{turbineId}/alert")]
    public async Task HandleAlert(string turbineId, Alert alert)
    {
        try
        {
            _logger.LogWarning("Received alert for {TurbineId}: {Message}", turbineId, alert.Message);
            
            // Ensure turbine ID matches the route and timestamp is set
            alert.TurbineId = turbineId;
            if (alert.Timestamp == default) alert.Timestamp = DateTime.UtcNow;
            
            using (var scope = _scopeFactory.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<WindFarmDbContext>();
                db.Alerts.Add(alert);
                await db.SaveChangesAsync();
            }

            // Broadcast to SSE group "farm-updates"
            await _sse.Clients.SendToGroupAsync("farm-updates", alert);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving alert for {TurbineId}", turbineId);
        }
    }
}
