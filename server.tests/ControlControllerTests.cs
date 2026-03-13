using System.Security.Claims;
using System.Text.Json;
using ex1.api.Controllers;
using ex1.api.Models;
using ex1.dataaccess;
using ex1.api.Mqtt;
using HiveMQtt.MQTT5.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using NUnit.Framework;
using StateleSSE.AspNetCore;

namespace server.tests;

[TestFixture]
public class ControlControllerTests
{
    private WindFarmDbContext _db;
    private Mock<IMqttClient> _mqttMock;
    private Mock<ISseBackplane> _sseMock;
    private ControlController _controller;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<WindFarmDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new WindFarmDbContext(options);

        _mqttMock = new Mock<IMqttClient>();
        _sseMock = new Mock<ISseBackplane>();
        _sseMock.Setup(s => s.Clients.SendToGroupAsync(It.IsAny<string>(), It.IsAny<object>()))
                .Returns(Task.CompletedTask);

        _controller = new ControlController(_db, _mqttMock.Object, NullLogger<ControlController>.Instance, _sseMock.Object);

        // Mock User identity
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "test-operator")
        }, "mock"));

        _controller.ControllerContext = new ControllerContext()
        {
            HttpContext = new DefaultHttpContext() { User = user }
        };
    }

    [TearDown]
    public void TearDown()
    {
        _db.Dispose();
    }

    [Test]
    public async Task Start_SavesAuditLogAndPublishesToMqtt()
    {
        // Arrange
        var turbineId = "turbine-1";

        // Act
        var result = await _controller.Start(turbineId);

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        
        var log = await _db.CommandLogs.FirstOrDefaultAsync(l => l.TurbineId == turbineId && l.Action == "start");
        Assert.That(log, Is.Not.Null);
        Assert.That(log.Operator, Is.EqualTo("test-operator"));

        // If PublishAsync is virtual, this will pass. If not, it will just not verify.
        // We'll see if it compiles and runs.
        _mqttMock.Verify(m => m.PublishAsync(It.Is<string>(s => s.Contains(turbineId)), It.Is<string>(s => s.Contains("start")), It.IsAny<QualityOfService>()), Times.Once);
    }

    [Test]
    public async Task SetPitch_ValidatesRange()
    {
        // Arrange
        var turbineId = "turbine-1";

        // Act & Assert (too high)
        var resultHigh = await _controller.SetPitch(turbineId, 31);
        Assert.That(resultHigh, Is.InstanceOf<BadRequestObjectResult>());

        // Act & Assert (too low)
        var resultLow = await _controller.SetPitch(turbineId, -1);
        Assert.That(resultLow, Is.InstanceOf<BadRequestObjectResult>());

        // Act & Assert (valid)
        var resultOk = await _controller.SetPitch(turbineId, 15);
        Assert.That(resultOk, Is.InstanceOf<OkObjectResult>());
    }
}
