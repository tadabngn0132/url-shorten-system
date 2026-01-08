# Test Docker Builds Locally

Write-Host "Testing Docker builds for Railway deployment..." -ForegroundColor Cyan
Write-Host ""

$services = @(
    @{Name="service-node"; Path=".\service-node"},
    @{Name="service-dotnet"; Path=".\service-dotnet"},
    @{Name="gateway"; Path=".\gateway"},
    @{Name="frontend"; Path=".\frontend"}
)

$results = @()

foreach ($service in $services) {
    Write-Host "Building $($service.Name)..." -ForegroundColor Yellow
    
    $buildCommand = "docker build -t test-$($service.Name) $($service.Path)"
    
    try {
        $output = Invoke-Expression $buildCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "? $($service.Name) build successful" -ForegroundColor Green
            $results += @{Service=$service.Name; Status="Success"}
        } else {
            Write-Host "? $($service.Name) build failed" -ForegroundColor Red
            $results += @{Service=$service.Name; Status="Failed"}
            Write-Host $output -ForegroundColor Red
        }
    } catch {
        Write-Host "? $($service.Name) build error: $_" -ForegroundColor Red
        $results += @{Service=$service.Name; Status="Error"}
    }
    
    Write-Host ""
}

Write-Host "=" * 50 -ForegroundColor Cyan
Write-Host "Build Summary:" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

foreach ($result in $results) {
    $color = if ($result.Status -eq "Success") { "Green" } else { "Red" }
    Write-Host "$($result.Service): $($result.Status)" -ForegroundColor $color
}

Write-Host ""
Write-Host "Note: Successful local builds don't guarantee Railway deployment success." -ForegroundColor Yellow
Write-Host "Railway may have different environment constraints." -ForegroundColor Yellow
