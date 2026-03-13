using ex1.api.Models;
using ex1.api.Mqtt;
using ex1.dataaccess;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.DependencyInjection;
using Moq;
using NUnit.Framework;
using StateleSSE.AspNetCore;

namespace server.tests;

[TestFixture]
public class WindFarmMqttControllerTests
{
    private WindFarmDbContext _db;
    private Mock<ISseBackplane> _sseMock;
    private Mock<IServiceScopeFactory> _scopeFactoryMock;
    private WindFarmMqttController _controller;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<WindFarmDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new WindFarmDbContext(options);

        _sseMock = new Mock<ISseBackplane>();
        _sseMock.Setup(s => s.Clients.SendToGroupAsync(It.IsAny<string>(), It.IsAny<object>()))
                .Returns(Task.CompletedTask);

        var serviceProviderMock = new Mock<IServiceProvider>();
        serviceProviderMock.Setup(s => s.GetService(typeof(WindFarmDbContext)))
                           .Returns(_db);

        var scopeMock = new Mock<IServiceScope>();
        scopeMock.Setup(s => s.ServiceProvider)
                 .Returns(serviceProviderMock.Object);

        _scopeFactoryMock = new Mock<IServiceScopeFactory>();
        _scopeFactoryMock.Setup(s => s.CreateScope())
                         .Returns(scopeMock.Object);

        _controller = new WindFarmMqttController(_scopeFactoryMock.Object, NullLogger<WindFarmMqttController>.Instance, _sseMock.Object);
    }

    [TearDown]
    public void TearDown()
    {
        _db.Dispose();
    }

    [Test]
    public async Task HandleTelemetry_SavesToDbAndBroadcasts()
    {
        // Arrange
        var turbineId = "turbine-1";
        var telemetry = new Telemetry { PowerOutput = 100, WindSpeed = 10, Status = "active" };

        // Act
        await _controller.HandleTelemetry(turbineId, telemetry);

        // Assert
        var saved = await _db.Telemetries.FirstOrDefaultAsync(t => t.TurbineId == turbineId);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.PowerOutput, Is.EqualTo(100));

        _sseMock.Verify(s => s.Clients.SendToGroupAsync("farm-updates", telemetry), Times.Once);
    }

    [Test]
    public async Task HandleAlert_SavesToDbAndBroadcasts()
    {
        // Arrange
        var turbineId = "turbine-1";
        var alert = new Alert { Severity = "critical", Message = "Emergency Stop" };

        // Act
        await _controller.HandleAlert(turbineId, alert);

        // Assert
        var saved = await _db.Alerts.FirstOrDefaultAsync(a => a.TurbineId == turbineId);
        Assert.That(saved, Is.Not.Null);
        Assert.That(saved.Message, Is.EqualTo("Emergency Stop"));

        _sseMock.Verify(s => s.Clients.SendToGroupAsync("farm-updates", alert), Times.Once);
    }
}
