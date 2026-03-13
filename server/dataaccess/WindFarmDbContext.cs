using Microsoft.EntityFrameworkCore;
using ex1.api.Models;

namespace ex1.dataaccess;

public class WindFarmDbContext : DbContext
{
    public WindFarmDbContext(DbContextOptions<WindFarmDbContext> options) : base(options)
    {
    }

    public DbSet<Telemetry> Telemetries => Set<Telemetry>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<CommandLog> CommandLogs => Set<CommandLog>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Turbine> Turbines => Set<Turbine>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("windmilliot");
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.Entity<Turbine>(entity =>
        {
            entity.ToTable("turbines");
            entity.Property(e => e.Id).HasColumnName("id").HasMaxLength(100);
            entity.Property(e => e.Name).HasColumnName("name");
            entity.Property(e => e.Location).HasColumnName("location");
            entity.Property(e => e.FarmId).HasColumnName("farmId").HasMaxLength(100);
        });

        modelBuilder.Entity<Telemetry>(entity =>
        {
            entity.ToTable("telemetry");
            entity.HasIndex(e => new { e.TurbineId, e.Timestamp }).IsDescending(false, true);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TurbineId).HasColumnName("turbineId").HasMaxLength(100);
            entity.Property(e => e.TurbineName).HasColumnName("turbineName");
            entity.Property(e => e.FarmId).HasColumnName("farmId").HasMaxLength(100);
            entity.Property(e => e.Timestamp).HasColumnName("timestamp");
            entity.Property(e => e.WindSpeed).HasColumnName("windSpeed");
            entity.Property(e => e.WindDirection).HasColumnName("windDirection");
            entity.Property(e => e.AmbientTemperature).HasColumnName("ambientTemperature");
            entity.Property(e => e.RotorSpeed).HasColumnName("rotorSpeed");
            entity.Property(e => e.PowerOutput).HasColumnName("powerOutput");
            entity.Property(e => e.NacelleDirection).HasColumnName("nacelleDirection");
            entity.Property(e => e.BladePitch).HasColumnName("bladePitch");
            entity.Property(e => e.GeneratorTemp).HasColumnName("generatorTemp");
            entity.Property(e => e.GearboxTemp).HasColumnName("gearboxTemp");
            entity.Property(e => e.Vibration).HasColumnName("vibration");
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(20);
        });

        modelBuilder.Entity<Alert>(entity =>
        {
            entity.ToTable("alerts");
            entity.HasIndex(e => new { e.TurbineId, e.Timestamp }).IsDescending(false, true);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TurbineId).HasColumnName("turbineId").HasMaxLength(100);
            entity.Property(e => e.FarmId).HasColumnName("farmId").HasMaxLength(100);
            entity.Property(e => e.Timestamp).HasColumnName("timestamp");
            entity.Property(e => e.Severity).HasColumnName("severity").HasMaxLength(20);
            entity.Property(e => e.Message).HasColumnName("message");
        });

        modelBuilder.Entity<CommandLog>(entity =>
        {
            entity.ToTable("commandLogs");
            entity.HasIndex(e => new { e.TurbineId, e.Timestamp }).IsDescending(false, true);
            entity.Property(e => e.Action).HasColumnName("action").HasMaxLength(100);
            entity.Property(e => e.Status).HasColumnName("status").HasMaxLength(50);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.TurbineId).HasColumnName("turbineId").HasMaxLength(100);
            entity.Property(e => e.Action).HasColumnName("action").HasMaxLength(100);
            entity.Property(e => e.Payload).HasColumnName("payload");
            entity.Property(e => e.FarmId).HasColumnName("farmId").HasMaxLength(100);
            entity.Property(e => e.Timestamp).HasColumnName("timestamp");
            entity.Property(e => e.Operator).HasColumnName("operator").HasMaxLength(100);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasIndex(e => e.Username).IsUnique();
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Username).HasColumnName("username").HasMaxLength(100);
            entity.Property(e => e.PasswordHash).HasColumnName("passwordHash");
            entity.Property(e => e.Role).HasColumnName("role").HasMaxLength(50);
        });
    }
}
