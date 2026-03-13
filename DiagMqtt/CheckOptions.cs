using System;
using HiveMQtt.Client.Options;

var options = new HiveMQClientOptions();
options.Host = "test";
options.Port = 1234;
Console.WriteLine($"Host: {options.Host}, Port: {options.Port}");
