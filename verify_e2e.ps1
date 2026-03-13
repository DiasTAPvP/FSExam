# verify_e2e.ps1
$ErrorActionPreference = "Stop"

# 1. Kill any existing dotnet processes and cleanup logs
Write-Host "Cleaning up old processes and logs..."
Get-Process dotnet -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Path "*.txt" -ErrorAction SilentlyContinue

# 2. Build Projects
Write-Host "Building Projects..."
dotnet build server/server.csproj
dotnet build MqttPublisher/MqttPublisher.csproj

# 3. Start Server
Write-Host "Starting Server..."
$root = Get-Location
$serverDir = Join-Path $root "server"
$serverProc = Start-Process dotnet -ArgumentList "run --no-build --urls http://localhost:5208" -WorkingDirectory $serverDir -PassThru -NoNewWindow -RedirectStandardOutput (Join-Path $root "server_stdout.txt") -RedirectStandardError (Join-Path $root "server_stderr.txt")
Start-Sleep -Seconds 15

# 4. Start Mock Turbine
Write-Host "Starting Mock Turbine..."
$mockDir = Join-Path $root "MqttPublisher"
$mockProc = Start-Process dotnet -ArgumentList "run --no-build" -WorkingDirectory $mockDir -PassThru -NoNewWindow -RedirectStandardOutput (Join-Path $root "mock_stdout.txt") -RedirectStandardError (Join-Path $root "mock_stderr.txt")
Start-Sleep -Seconds 10

try {
    # 4. Login
    Write-Host "Logging in..."
    $loginBody = @{ username = "operator"; password = "hashed_windmill123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "http://localhost:5208/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    Write-Host "Logged in! Token: $($token.Substring(0, 10))..."

    # 5. Check Initial Telemetry in DB
    Write-Host "Checking for telemetry in DB..."
    Start-Sleep -Seconds 5
    $telRes = Invoke-RestMethod -Uri "http://localhost:5208/api/history/telemetry/turbine-alpha?limit=1" -Method Get
    if ($telRes.Count -gt 0) {
        Write-Host "Found telemetry: Status=$($telRes[0].status), Power=$($telRes[0].powerOutput)"
    } else {
        Write-Warning "No telemetry found yet!"
    }

    # 6. Send STOP Command
    Write-Host "Sending STOP command..."
    $headers = @{ "Authorization" = "Bearer $token" }
    $stopRes = Invoke-RestMethod -Uri "http://localhost:5208/api/control/turbine-alpha/stop?reason=E2E-Test" -Method Post -Headers $headers
    Write-Host "Stop command sent: $($stopRes | ConvertTo-Json -Compress)"

    # 7. Wait for update
    Write-Host "Waiting for status update (10s)..."
    Start-Sleep -Seconds 10

    # 8. Check Alerts
    Write-Host "Checking for alerts in DB..."
    $alertRes = Invoke-RestMethod -Uri "http://localhost:5208/api/history/alerts/turbine-alpha?limit=1" -Method Get
    if ($alertRes.Count -gt 0) {
        Write-Host "SUCCESS: Found alert: $($alertRes[0].message)" -ForegroundColor Green
    } else {
        Write-Warning "No alerts found yet (expected 1)."
    }

    # 9. Verify Status Change in DB
    $telRes = Invoke-RestMethod -Uri "http://localhost:5208/api/history/telemetry/turbine-alpha?limit=5" -Method Get
    Write-Host "JSON Response for Alpha: $($telRes | ConvertTo-Json -Depth 2)"
    
    $latest = $telRes | Select-Object -First 1
    Write-Host "Latest telemetry after STOP: Status=$($latest.status), Power=$($latest.powerOutput)"

    if ($latest.status -eq "stopped") {
        Write-Host "SUCCESS: Turbine stopped successfully!" -ForegroundColor Green
    } else {
        Write-Error "FAILURE: Turbine status is still $($latest.status)"
    }

} finally {
    Write-Host "Cleaning up processes..."
    $serverProc | Stop-Process -Force
    $mockProc | Stop-Process -Force
    
    Write-Host "Server Stdout Tail:"
    Get-Content server_stdout.txt -Tail 10
    Write-Host "Mock Stdout Tail:"
    Get-Content mock_stdout.txt -Tail 10
}
