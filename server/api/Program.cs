using ex1.dataaccess;
using ex1.api.Mqtt;
using Microsoft.EntityFrameworkCore;
using Mqtt.Controllers;
using Microsoft.AspNetCore.Builder;
using StateleSSE.AspNetCore;
using StateleSSE.AspNetCore.GroupRealtime;
using StateleSSE.AspNetCore.EfRealtime;
using HiveMQtt.Client;
using HiveMQtt.Client.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using NSwag;
using NSwag.Generation.Processors.Security;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<HostOptions>(options =>
{
    options.ShutdownTimeout = TimeSpan.FromSeconds(0); 
});
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Vite default for local dev
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddOpenApiDocument(config =>
{
    config.PostProcess = document =>
    {
        document.Info.Version = "v1.0.0";
        document.Info.Title = "Windmill IoT Control API";
        document.Info.Description = "Real-time monitoring and control system for windmill platforms. Authenticate via JWT to send commands.";
    };
    config.AddSecurity("JWT", new OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.ApiKey,
        Name = "Authorization",
        In = OpenApiSecurityApiKeyLocation.Header,
        Description = "Enter 'Bearer {token}' to authenticate."
    });
    config.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
});

// JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "VerySecretWindmillKeyThatIsLongEnough";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "WindFarmAPI",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "WindFarmOperators",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
        // Allow token in query string for SSE
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/api/sse"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });

// Database
var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
builder.Services.AddDbContext<WindFarmDbContext>(options =>
    options.UseNpgsql(connectionString));

// MQTT
// We'll use the variables defined here throughout the script
var mqttHost = builder.Configuration["Mqtt:Host"] ?? "broker.hivemq.com";
var mqttPort = int.Parse(builder.Configuration["Mqtt:Port"] ?? "1883");
bool useTls = mqttPort == 8883 || mqttPort == 8884;


var mqttOptions = new HiveMQClientOptions
{
    Host = mqttHost,
    Port = mqttPort,
    CleanStart = true,
    ClientId = "WindmillBackend-" + Guid.NewGuid().ToString().Substring(0, 8)
};
var mqttClient = new HiveMQtt.Client.HiveMQClient(mqttOptions);

// Register OUR client instance FIRST so it's used by any library services
builder.Services.AddSingleton<HiveMQtt.Client.HiveMQClient>(mqttClient);
builder.Services.AddSingleton<IMqttClient, HiveMQClientWrapper>();

// Now register MQTT Controllers which will find our client in DI
builder.Services.AddMqttControllers(typeof(Program).Assembly);

// Real-time SSE
builder.Services.AddGroupRealtime();
builder.Services.AddInMemorySseBackplane();

var app = builder.Build();

// Connect MQTT THROUGH the library service and verify result
// This satisfies the library's requirement and prevents the "MQTT client not connected" crash
try 
{
    var mqttClientService = app.Services.GetRequiredService<Mqtt.Controllers.IMqttClientService>();
    
    // First, try direct connection to HiveMQClient instance to ensure it's ready
    await mqttClient.ConnectAsync();
    Console.WriteLine($"[MQTT] HiveMQClient connection established to {mqttHost}:{mqttPort}.");

    // Then call the service's ConnectAsync to satisfy the library's internal state
    await mqttClientService.ConnectAsync(mqttHost, mqttPort, null, null, useTls);
    Console.WriteLine("[MQTT] Service ConnectAsync completed.");
}
catch (Exception ex)
{
    Console.WriteLine($"[MQTT] Initial connection attempt to {mqttHost} failed: {ex.Message}");
    Console.WriteLine("[MQTT] Tip: If port 1883 is failing, try changing to 8883 in appsettings.json.");
}

// Ensure DB is created and seeded
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WindFarmDbContext>();
    db.Database.EnsureCreated();
    
    // Seed Users
    if (!db.Users.Any())
    {
        db.Users.Add(new ex1.api.Models.User 
        { 
            Id = Guid.NewGuid().ToString(), 
            Username = "operator", 
            PasswordHash = "windmill123", 
            Role = "operator" 
        });
        db.Users.Add(new ex1.api.Models.User 
        { 
            Id = Guid.NewGuid().ToString(), 
            Username = "admin", 
            PasswordHash = "admin", 
            Role = "admin" 
        });
        db.SaveChanges();
    }

    // Seed Turbines
    if (!db.Turbines.Any())
    {
        var farmId = "0b57aefe-6e6c-4a36-ad90-880321aa6d7b";
        db.Turbines.AddRange(new[]
        {
            new ex1.api.Models.Turbine { Id = "turbine-alpha", Name = "Alpha", Location = "North Platform", FarmId = farmId },
            new ex1.api.Models.Turbine { Id = "turbine-beta", Name = "Beta", Location = "North Platform", FarmId = farmId },
            new ex1.api.Models.Turbine { Id = "turbine-gamma", Name = "Gamma", Location = "South Platform", FarmId = farmId },
            new ex1.api.Models.Turbine { Id = "turbine-delta", Name = "Delta", Location = "East Platform", FarmId = farmId }
        });
        db.SaveChanges();
    }
}

app.UseCors("AllowAll");

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");
// The MqttControllerHostedService is already registered by AddMqttControllers
// app.MapMqttControllers();
app.UseOpenApi();
app.UseSwaggerUi();

app.Run();