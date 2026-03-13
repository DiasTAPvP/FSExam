using HiveMQtt.MQTT5.Types;

namespace ex1.api.Mqtt;

public interface IMqttClient
{
    Task<HiveMQtt.Client.Results.PublishResult> PublishAsync(string topic, string payload, QualityOfService qos);
    // Add other methods as needed by the application
}
