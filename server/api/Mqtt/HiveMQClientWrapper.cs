using HiveMQtt.Client;
using HiveMQtt.MQTT5.Types;
using HiveMQtt.Client.Results;

namespace ex1.api.Mqtt;

public class HiveMQClientWrapper : IMqttClient
{
    private readonly HiveMQClient _client;

    public HiveMQClientWrapper(HiveMQClient client)
    {
        _client = client;
    }

    public Task<PublishResult> PublishAsync(string topic, string payload, QualityOfService qos)
    {
        return _client.PublishAsync(topic, payload, qos);
    }
}
