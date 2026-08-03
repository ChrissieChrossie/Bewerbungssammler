# Lambda ZIP ohne Docker - laedt ALLE Pakete als fertige Linux/Python-3.12-Wheels von PyPI
param(
    [string]$OutputPath = ".\terraform\automation_lambda.zip"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.IO.Compression.FileSystem

$buildDir = Join-Path $env:TEMP "lambda_build_$(Get-Random)"
$wheelDir = Join-Path $env:TEMP "lambda_wheels_$(Get-Random)"
$zipPath  = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputPath)

Write-Host "Baue Lambda ZIP (Linux/Python 3.12 Wheels von PyPI)..." -ForegroundColor Cyan

New-Item -ItemType Directory -Path $buildDir, $wheelDir -Force | Out-Null

try {
    # 1. Alle Pakete als fertige Wheels herunterladen (kein Kompilieren, kein Docker)
    #    --platform + --python-version 312 = Lambda-kompatible Binaries
    #    --only-binary :all:              = niemals Source-Code kompilieren
    Write-Host "  Lade alle Pakete als Linux-Wheels (Python 3.12)..." -ForegroundColor Yellow
    pip download `
        --platform "manylinux_2_17_x86_64" `
        --python-version "312" `
        --implementation "cp" `
        --only-binary ":all:" `
        --dest $wheelDir `
        --quiet `
        "boto3==1.35.0" `
        "psycopg2-binary==2.9.9" `
        "sqlalchemy==2.0.35" `
        "pydantic==2.9.2" `
        "pydantic-settings==2.5.2" `
        "python-dotenv==1.0.1"

    $wheels = Get-ChildItem $wheelDir -Filter "*.whl"
    Write-Host "  $($wheels.Count) Wheels heruntergeladen." -ForegroundColor Gray

    # 2. Alle Wheels entpacken (.whl = ZIP, nur andere Endung)
    Write-Host "  Entpacke Wheels..." -ForegroundColor Yellow
    foreach ($wheel in $wheels) {
        $zip = [System.IO.Compression.ZipFile]::OpenRead($wheel.FullName)
        foreach ($entry in $zip.Entries) {
            # dist-info Ordner weglassen (Lambda braucht die nicht)
            if ($entry.FullName -match "\.dist-info/") { continue }
            if ($entry.FullName -match "\.dist-info\\") { continue }

            $destPath = Join-Path $buildDir $entry.FullName.Replace("/", "\")
            $destDir  = Split-Path $destPath -Parent
            if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
            if (-not $entry.FullName.EndsWith("/")) {
                [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destPath, $true)
            }
        }
        $zip.Dispose()
    }

    # 3. Automation-Code kopieren
    Write-Host "  Kopiere Automation-Code..." -ForegroundColor Yellow
    Copy-Item "Backend\automation" "$buildDir\automation" -Recurse -Force
    Copy-Item "Backend\models"     "$buildDir\models"     -Recurse -Force
    Copy-Item "Backend\database.py" "$buildDir\database.py" -Force

    # 4. Lambda Entry-Point
    Set-Content "$buildDir\lambda_handler.py" `
        "from automation.lambda_handler import lambda_handler`n__all__ = ['lambda_handler']" `
        -Encoding UTF8

    # 5. ZIP erstellen (ohne __pycache__ und .pyc)
    Write-Host "  Erstelle ZIP..." -ForegroundColor Yellow
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

    $outZip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
    $files  = Get-ChildItem $buildDir -Recurse -File |
              Where-Object { $_.FullName -notmatch "__pycache__" -and $_.Extension -ne ".pyc" }

    foreach ($file in $files) {
        $entryName = $file.FullName.Substring($buildDir.Length + 1).Replace("\", "/")
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($outZip, $file.FullName, $entryName) | Out-Null
    }
    $outZip.Dispose()

    $sizeMB = [Math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host ""
    Write-Host "Lambda ZIP erfolgreich erstellt!" -ForegroundColor Green
    Write-Host "   Pfad:    $zipPath"
    Write-Host "   Groesse: $sizeMB MB"

} finally {
    Remove-Item $buildDir -Recurse -Force -ErrorAction SilentlyContinue
    Remove-Item $wheelDir -Recurse -Force -ErrorAction SilentlyContinue
}
