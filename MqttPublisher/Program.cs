using System;
using System.Text.Json;
using System.Threading.Tasks;
using System.Text;
using HiveMQtt.Client;
using HiveMQtt.Client.Options;
using HiveMQtt.Client.Events;

var farmId = "0b57aefe-6e6c-4a36-ad90-880321aa6d7b";
var turbineId = "turbine-alpha";
var turbineName = "Alpha";

var options = new HiveMQClientOptions
{
    Host = "broker.emqx.io",
    Port = 1883
};
var client = new HiveMQClient(options);

var status = "running";
var windSpeed = 12.5;
var powerOutput = 1500.0;
var bladePitch = 10.0;
var interval = 5;

client.OnMessageReceived += (sender, args) =>
{
    var topic = args.PublishMessage.Topic;
    var payload = Encoding.UTF8.GetString(args.PublishMessage.Payload);
    Console.WriteLine($"[MOCK] Received command on {topic}: {payload}");

    try
    {
        using var doc = JsonDocument.Parse(payload);
        var action = doc.RootElement.GetProperty("action").GetString();

        if (action == "stop")
        {
            status = "stopped";
            powerOutput = 0;
            Console.WriteLine("[MOCK] Turbine STOPPED");
        }
        else if (action == "start")
        {
            status = "running";
            powerOutput = 1500.0;
            Console.WriteLine("[MOCK] Turbine STARTED");
        }
        else if (action == "setPitch")
        {
            bladePitch = doc.RootElement.GetProperty("angle").GetDouble();
            Console.WriteLine($"[MOCK] Blade pitch set to {bladePitch}");
        }
        else if (action == "setInterval")
        {
            interval = doc.RootElement.GetProperty("value").GetInt32();
            Console.WriteLine($"[MOCK] Reporting interval set to {interval}s");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[MOCK] Error parsing command: {ex.Message}");
    }
};

Console.WriteLine("[MOCK] Connecting to broker...");
await client.ConnectAsync();
Console.WriteLine("[MOCK] Connected!");

var commandTopic = $"farm/{farmId}/windmill/{turbineId}/command";
await client.SubscribeAsync(commandTopic);
Console.WriteLine($"[MOCK] Subscribed to {commandTopic}");

var telemetryTopic = $"farm/{farmId}/windmill/{turbineId}/telemetry";

while (true)
{
    var telemetry = new {
        turbineId,
        turbineName,
        farmId,
        timestamp = DateTime.UtcNow.ToString("O"),
        windSpeed = status == "running" ? 12.0 + Random.Shared.NextDouble() : 5.0,
        windDirection = 180.0,
        ambientTemperature = 15.0,
        rotorSpeed = status == "running" ? 15.0 : 0.0,
        powerOutput = status == "running" ? 1400.0 + Random.Shared.NextDouble() * 200.0 : 0.0,
        nacelleDirection = 180.0,
        bladePitch,
        generatorTemp = 60.0,
        gearboxTemp = 55.0,
        vibration = status == "running" ? 2.0 : 0.1,
        status
    };

    var json = JsonSerializer.Serialize(telemetry);
    await client.PublishAsync(telemetryTopic, json);
    Console.WriteLine($"[MOCK] Published telemetry: {status}, Power: {telemetry.powerOutput:F1}W");

    // Send Alert if power output is high (randomly for verification)
    if (telemetry.powerOutput > 1400.0)
    {
        var alert = new {
            turbineId,
            farmId,
            timestamp = DateTime.UtcNow.ToString("O"),
            severity = "warning",
            message = "High power output detected"
        };
        var alertJson = JsonSerializer.Serialize(alert);
        var alertTopic = $"farm/{farmId}/windmill/{turbineId}/alert";
        await client.PublishAsync(alertTopic, alertJson);
        Console.WriteLine($"[MOCK] Published alert: {alert.message}");
    }

    await Task.Delay(interval * 1000);
}
