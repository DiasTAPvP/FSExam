using System;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

var assembly = typeof(Mqtt.Controllers.MqttControllerHostedService).Assembly;
foreach (var type in assembly.GetExportedTypes())
{
    foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.Static))
    {
        if (method.Name.Contains("MapMqtt"))
        {
            Console.WriteLine($"Type: {type.FullName} Method: {method.Name}");
            foreach (var param in method.GetParameters())
            {
                Console.WriteLine($"  Param: {param.Name} ({param.ParameterType.Name})");
            }
        }
    }
}
