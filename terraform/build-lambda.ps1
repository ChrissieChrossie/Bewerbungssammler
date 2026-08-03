# PowerShell Script: Baut das Lambda ZIP-Archiv
# Verwendung: .\build-lambda.ps1
# Resultat: automation_lambda.zip (im aktuellen Verzeichnis)

param(
    [string]$PythonVersion = "3.12",
    [bool]$CleanupAfter = $true
)

Write-Host "🔨 Baue Lambda ZIP-Archiv..." -ForegroundColor Green
Write-Host "Python-Version: $PythonVersion`n" -ForegroundColor Gray

# Fehlerbehandlung
$ErrorActionPreference = "Stop"

try {
    # ========================================================================
    # SCHRITT 1: Zu Backend-Verzeichnis wechseln
    # ========================================================================
    $BackendPath = Join-Path $PSScriptRoot "..\Backend"
    if (-not (Test-Path $BackendPath)) {
        throw "Backend-Verzeichnis nicht gefunden: $BackendPath"
    }

    Push-Location $BackendPath
    Write-Host "✅ Wechsel zu: $BackendPath" -ForegroundColor Green

    # ========================================================================
    # SCHRITT 2: Virtuelle Python-Umgebung erstellen
    # ========================================================================
    Write-Host "`n📦 Erstelle virtuelle Python-Umgebung..." -ForegroundColor Cyan
    if (Test-Path "venv") {
        Write-Host "   ⓘ venv existiert bereits, überspringe Creation" -ForegroundColor Yellow
    }
    else {
        python -m venv venv
        Write-Host "✅ venv erstellt" -ForegroundColor Green
    }

    # ========================================================================
    # SCHRITT 3: Virtuelle Umgebung aktivieren & Requirements installieren
    # ========================================================================
    Write-Host "`n📥 Installiere Requirements..." -ForegroundColor Cyan
    & .\venv\Scripts\Activate.ps1

    python -m pip install --upgrade pip --quiet
    pip install -r requirements.txt --quiet
    Write-Host "✅ Requirements installiert" -ForegroundColor Green

    # ========================================================================
    # SCHRITT 4: Lambda Build-Verzeichnis vorbereiten
    # ========================================================================
    Write-Host "`n📂 Vorbereitung Lambda Build-Verzeichnis..." -ForegroundColor Cyan
    $LambdaBuildDir = Join-Path $PSScriptRoot "lambda_build"
    $TerraformDir = $PSScriptRoot

    # Altes Build-Verzeichnis löschen
    if (Test-Path $LambdaBuildDir) {
        Remove-Item $LambdaBuildDir -Recurse -Force
        Write-Host "   🗑️  Altes Build-Verzeichnis gelöscht" -ForegroundColor Yellow
    }

    New-Item -ItemType Directory -Path $LambdaBuildDir | Out-Null
    Write-Host "✅ Build-Verzeichnis erstellt: $LambdaBuildDir" -ForegroundColor Green

    # ========================================================================
    # SCHRITT 5: Code kopieren
    # ========================================================================
    Write-Host "`n📋 Kopiere Python-Code..." -ForegroundColor Cyan

    # Automation Module
    Copy-Item -Path "automation" -Destination $LambdaBuildDir -Recurse -Force
    Write-Host "   ✓ automation/" -ForegroundColor Gray

    # Datenbank-Module
    Copy-Item -Path "database.py" -Destination $LambdaBuildDir -Force
    Write-Host "   ✓ database.py" -ForegroundColor Gray

    Copy-Item -Path "models" -Destination $LambdaBuildDir -Recurse -Force
    Write-Host "   ✓ models/" -ForegroundColor Gray

    Write-Host "✅ Code kopiert" -ForegroundColor Green

    # ========================================================================
    # SCHRITT 6: Dependencies kopieren
    # ========================================================================
    Write-Host "`n📦 Kopiere Python Dependencies..." -ForegroundColor Cyan

    # Site-packages Pfad finden
    $SitePackages = & python -c "import site; print(site.getsitepackages()[0])"
    Write-Host "   Site-packages: $SitePackages" -ForegroundColor Gray

    if (-not (Test-Path $SitePackages)) {
        throw "Site-packages Verzeichnis nicht gefunden: $SitePackages"
    }

    # Dependencies kopieren (Timeout-sicher)
    Get-ChildItem -Path $SitePackages -Directory | ForEach-Object {
        $SourcePath = Join-Path $SitePackages $_.Name
        $DestPath = Join-Path $LambdaBuildDir $_.Name

        # Bestimmte Verzeichnisse ausschließen (zu groß, nicht nötig)
        if ($_.Name -notin @("pip", "setuptools", "wheel", "pkg_resources", "__pycache__", "tests", "*.dist-info")) {
            Copy-Item -Path $SourcePath -Destination $DestPath -Recurse -Force -ErrorAction SilentlyContinue
        }
    }

    # .dist-info Dateien kopieren (nötig für Runtime)
    Get-ChildItem -Path $SitePackages -Filter "*.dist-info" -Directory | ForEach-Object {
        Copy-Item -Path $_ -Destination $LambdaBuildDir -Recurse -Force -ErrorAction SilentlyContinue
    }

    Write-Host "✅ Dependencies kopiert" -ForegroundColor Green

    # ========================================================================
    # SCHRITT 7: ZIP-Archiv erstellen
    # ========================================================================
    Write-Host "`n📦 Erstelle ZIP-Archiv..." -ForegroundColor Cyan

    $ZipPath = Join-Path $TerraformDir "automation_lambda.zip"

    # Altes ZIP löschen
    if (Test-Path $ZipPath) {
        Remove-Item $ZipPath -Force
        Write-Host "   🗑️  Altes ZIP gelöscht" -ForegroundColor Yellow
    }

    Push-Location $LambdaBuildDir
    Compress-Archive -Path * -DestinationPath $ZipPath -Force
    Pop-Location

    # Größe anzeigen
    $ZipSize = (Get-Item $ZipPath).Length / 1MB
    Write-Host "✅ ZIP erstellt: $ZipPath" -ForegroundColor Green
    Write-Host "   Größe: $($ZipSize.ToString('F2')) MB" -ForegroundColor Gray

    # ========================================================================
    # SCHRITT 8: Aufräumen
    # ========================================================================
    if ($CleanupAfter) {
        Write-Host "`n🧹 Räume auf..." -ForegroundColor Cyan
        Remove-Item $LambdaBuildDir -Recurse -Force
        Write-Host "✅ Cleanup abgeschlossen" -ForegroundColor Green
    }
    else {
        Write-Host "`nⓘ Build-Verzeichnis bleibt erhalten: $LambdaBuildDir" -ForegroundColor Yellow
    }

    # ========================================================================
    # SUCCESS
    # ========================================================================
    Write-Host "`n✨ Lambda ZIP erfolgreich gebaut!" -ForegroundColor Green
    Write-Host "Nächster Schritt: terraform apply" -ForegroundColor Cyan

}
catch {
    Write-Host "`n❌ FEHLER: $_" -ForegroundColor Red
    exit 1
}
finally {
    Pop-Location -ErrorAction SilentlyContinue
}
