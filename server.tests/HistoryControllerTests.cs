using ex1.api.Controllers;
using ex1.api.Models;
using ex1.dataaccess;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;

namespace server.tests;

[TestFixture]
public class HistoryControllerTests
{
    private WindFarmDbContext _db;
    private HistoryController _controller;

    [SetUp]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<WindFarmDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new WindFarmDbContext(options);
        _controller = new HistoryController(_db);
    }

    [TearDown]
    public void TearDown()
    {
        _db.Dispose();
    }

    [Test]
    public async Task GetTelemetry_ReturnsCorrectData()
    {
        // Arrange
        var turbineId = "turbine-1";
        var telemetry = new Telemetry 
        { 
            TurbineId = turbineId, 
            Timestamp = DateTime.UtcNow, 
            PowerOutput = 100, 
            WindSpeed = 10,
            Status = "active"
        };
        _db.Telemetries.Add(telemetry);
        await _db.SaveChangesAsync();

        // Act
        var result = await _controller.GetTelemetry(turbineId);

        // Assert
        Assert.That(result.Value, Is.Not.Null);
        Assert.That(result.Value.Count(), Is.EqualTo(1));
        Assert.That(result.Value.First().TurbineId, Is.EqualTo(turbineId));
    }

    [Test]
    public async Task GetAlerts_ReturnsCorrectData()
    {
        // Arrange
        var turbineId = "turbine-1";
        var alert = new Alert 
        { 
            TurbineId = turbineId, 
            Timestamp = DateTime.UtcNow, 
            Severity = "warning", 
            Message = "Test alert" 
        };
        _db.Alerts.Add(alert);
        await _db.SaveChangesAsync();

        // Act
        var result = await _controller.GetAlerts(turbineId);

        // Assert
        Assert.That(result.Value, Is.Not.Null);
        Assert.That(result.Value.Count(), Is.EqualTo(1));
        Assert.That(result.Value.First().Message, Is.EqualTo("Test alert"));
    }

    [Test]
    public async Task GetCommands_ReturnsCorrectData()
    {
        // Arrange
        var turbineId = "turbine-1";
        var log = new CommandLog 
        { 
            TurbineId = turbineId, 
            Timestamp = DateTime.UtcNow, 
            Action = "start", 
            Operator = "admin" 
        };
        _db.CommandLogs.Add(log);
        await _db.SaveChangesAsync();

        // Act
        var result = await _controller.GetCommands(turbineId);

        // Assert
        Assert.That(result.Value, Is.Not.Null);
        Assert.That(result.Value.Count(), Is.EqualTo(1));
        Assert.That(result.Value.First().Action, Is.EqualTo("start"));
    }
}
