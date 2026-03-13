using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ex1.api.Models;

public class Telemetry
{
    [Key]
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("turbineId")]
    public string TurbineId { get; set; } = string.Empty;
    [JsonPropertyName("turbineName")]
    public string TurbineName { get; set; } = string.Empty;
    [JsonPropertyName("farmId")]
    public string FarmId { get; set; } = string.Empty;
    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
    [JsonPropertyName("windSpeed")]
    public double WindSpeed { get; set; }
    [JsonPropertyName("windDirection")]
    public double WindDirection { get; set; }
    [JsonPropertyName("ambientTemperature")]
    public double AmbientTemperature { get; set; }
    [JsonPropertyName("rotorSpeed")]
    public double RotorSpeed { get; set; }
    [JsonPropertyName("powerOutput")]
    public double PowerOutput { get; set; }
    [JsonPropertyName("nacelleDirection")]
    public double NacelleDirection { get; set; }
    [JsonPropertyName("bladePitch")]
    public double BladePitch { get; set; }
    [JsonPropertyName("generatorTemp")]
    public double GeneratorTemp { get; set; }
    [JsonPropertyName("gearboxTemp")]
    public double GearboxTemp { get; set; }
    [JsonPropertyName("vibration")]
    public double Vibration { get; set; }
    [JsonPropertyName("status")]
    public string Status { get; set; } = "running";
}

public class Alert
{
    [Key]
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("turbineId")]
    public string TurbineId { get; set; } = string.Empty;
    [JsonPropertyName("farmId")]
    public string FarmId { get; set; } = string.Empty;
    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
    [JsonPropertyName("severity")]
    public string Severity { get; set; } = "info"; // info, warning, critical
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}

public class CommandLog
{
    [Key]
    [JsonPropertyName("id")]
    public int Id { get; set; }
    [JsonPropertyName("turbineId")]
    public string TurbineId { get; set; } = string.Empty;
    [JsonPropertyName("farmId")]
    public string FarmId { get; set; } = string.Empty;
    [JsonPropertyName("command")]
    public string Action { get; set; } = string.Empty;
    
    [JsonPropertyName("payload")]
    public string? Payload { get; set; }
    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; }
    [JsonPropertyName("operator")]
    public string Operator { get; set; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; set; } = "acknowledged";
}

public class User
{
    [Key]
    public string Id { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "operator"; // admin, operator
}

public class Turbine
{
    [Key]
    [MaxLength(100)]
    public string Id { get; set; } = string.Empty; // e.g. turbine-alpha
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string FarmId { get; set; } = string.Empty;
}
