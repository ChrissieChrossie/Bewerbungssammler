<#
Steuert die lokale Docker-Entwicklungsumgebung (Postgres + Backend + Frontend).
Nur fuer lokale Entwicklung gedacht -- keine Produktions-Konfiguration.

Nutzung: .\scripts\docker.ps1 <start|stop|restart|install> [-Build] [-Volumes]
#>

param(
    [Parameter(Position = 0, Mandatory = $true)]
    [ValidateSet("start", "stop", "restart", "install")]
    [string]$Command,

    [switch]$Build,
    [switch]$Volumes
)

$RootDir = Split-Path -Parent $PSScriptRoot
Set-Location $RootDir
$ComposeFile = "docker-compose.yml"

function Write-Ok   { param([string]$Message) Write-Host "OK  $Message" -ForegroundColor Green }
function Write-Err  { param([string]$Message) Write-Host "X   $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message) Write-Host "->  $Message" -ForegroundColor Cyan }

function Fail {
    param([string]$Message)
    Write-Err $Message
    exit 1
}

function Invoke-Compose {
    param([string[]]$ComposeArgs)
    & docker compose -f $ComposeFile @ComposeArgs
    if ($LASTEXITCODE -ne 0) {
        Fail "docker compose $($ComposeArgs -join ' ') ist fehlgeschlagen (Exit-Code $LASTEXITCODE)."
    }
}

function Test-DockerReady {
    $dockerCmd = Get-Command docker -ErrorAction SilentlyContinue
    if (-not $dockerCmd) {
        Fail "Docker wurde nicht gefunden. Installiere Docker Desktop: https://www.docker.com/products/docker-desktop/"
    }

    docker compose version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Fail "Docker Compose (v2 Plugin) wurde nicht gefunden. Aktualisiere Docker Desktop bzw. installiere das Compose-Plugin."
    }

    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Fail "Der Docker-Daemon laeuft nicht. Starte Docker Desktop und versuche es erneut."
    }

    Write-Ok "Docker und Docker Compose sind verfuegbar, Daemon laeuft"
}

function Copy-EnvIfMissing {
    param([string]$Dir)
    $examplePath = Join-Path $Dir ".env.example"
    $envPath = Join-Path $Dir ".env"
    if (Test-Path $examplePath) {
        if (Test-Path $envPath) {
            Write-Info "$envPath existiert bereits -- wird nicht ueberschrieben"
        } else {
            Copy-Item $examplePath $envPath
            Write-Ok "$envPath aus .env.example erstellt"
        }
    }
}

function Wait-ForHealthy {
    param(
        [string]$Service,
        [int]$TimeoutSeconds = 60
    )
    Write-Info "Warte auf Healthcheck von '$Service'..."
    $elapsed = 0
    while ($true) {
        $cid = (docker compose -f $ComposeFile ps -q $Service 2>$null)
        if (-not $cid) {
            Fail "Service '$Service' wurde nicht gestartet."
        }
        $status = (docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' $cid 2>$null)
        if ($status -eq "healthy" -or $status -eq "no-healthcheck") {
            Write-Ok "'$Service' ist bereit"
            return
        }
        if ($status -eq "unhealthy") {
            Fail "'$Service' ist unhealthy. Logs: docker compose logs $Service"
        }
        if ($elapsed -ge $TimeoutSeconds) {
            Fail "Timeout beim Warten auf '$Service' (${TimeoutSeconds}s). Logs: docker compose logs $Service"
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
    }
}

function Write-Urls {
    Write-Host ""
    Write-Ok "Alle Services laufen"
    Write-Host "    Frontend:  http://localhost:5173"
    Write-Host "    Backend:   http://localhost:8000  (Docs: http://localhost:8000/docs)"
    Write-Host "    Datenbank: localhost:5432"
    Write-Host ""
}

function Invoke-Start {
    param([switch]$DoBuild)

    Test-DockerReady
    Write-Info "Starte Container..."
    if ($DoBuild) {
        Invoke-Compose @("up", "-d", "--build")
    } else {
        Invoke-Compose @("up", "-d")
    }

    Wait-ForHealthy -Service "db" -TimeoutSeconds 60
    Wait-ForHealthy -Service "backend" -TimeoutSeconds 60

    Write-Info "Tabellen werden beim Backend-Start automatisch angelegt (SQLAlchemy create_all, kein separates Migrationstool im Projekt vorhanden)."

    Write-Urls
}

function Invoke-Stop {
    param([switch]$RemoveVolumes)

    Test-DockerReady

    if ($RemoveVolumes) {
        Write-Err "ACHTUNG: Dies loescht auch die Datenbank-Volumes (alle lokalen Daten gehen verloren)!"
        $reply = Read-Host "Wirklich fortfahren? [y/N]"
        if ($reply -match '^[yY]') {
            Invoke-Compose @("down", "--volumes")
            Write-Ok "Alle Container gestoppt und Volumes geloescht"
        } else {
            Write-Info "Abgebrochen -- Volumes wurden nicht geloescht"
            Invoke-Compose @("down")
            Write-Ok "Alle Container gestoppt (Volumes bleiben erhalten)"
        }
    } else {
        Invoke-Compose @("down")
        Write-Ok "Alle Container gestoppt (Volumes/Datenbank-Daten bleiben erhalten)"
    }
}

function Invoke-Restart {
    param([switch]$DoBuild)
    Invoke-Stop
    Invoke-Start -DoBuild:$DoBuild
}

function Invoke-Install {
    Test-DockerReady

    Copy-EnvIfMissing -Dir "Backend"
    Copy-EnvIfMissing -Dir "frontend"

    Write-Info "Baue Docker-Images (installiert dabei automatisch pip- und npm-Abhaengigkeiten im jeweiligen Image)..."
    Invoke-Compose @("build")
    Write-Ok "Images gebaut"

    Write-Info "Starte Datenbank..."
    Invoke-Compose @("up", "-d", "db")
    Wait-ForHealthy -Service "db" -TimeoutSeconds 60

    Write-Info "Starte Backend (legt Tabellen automatisch an)..."
    Invoke-Compose @("up", "-d", "backend")
    Wait-ForHealthy -Service "backend" -TimeoutSeconds 60

    Write-Info "Kein Seed-Skript im Projekt gefunden -- ueberspringe Seed-Daten."

    Invoke-Compose @("stop", "backend", "db")

    Write-Host ""
    Write-Ok "Setup abgeschlossen -- starte das Projekt mit: .\scripts\docker.ps1 start"
    Write-Host ""
}

switch ($Command) {
    "start"   { Invoke-Start -DoBuild:$Build }
    "stop"    { Invoke-Stop -RemoveVolumes:$Volumes }
    "restart" { Invoke-Restart -DoBuild:$Build }
    "install" { Invoke-Install }
}
