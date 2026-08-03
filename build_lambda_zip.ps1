# Build-Script fuer Lambda Zip-Archiv (Docker-basiert, Amazon Linux 2023)
# Nutzt das offizielle AWS Lambda Image fuer plattformkonforme Binaries

param(
    [string]$OutputPath = ".\terraform\automation_lambda.zip",
    [string]$PythonVersion = "3.12"
)

Write-Host "Baue Lambda Zip-Archiv (Docker / Amazon Linux 2023, Python $PythonVersion)..." -ForegroundColor Cyan

# Docker verfuegbarkeit pruefen
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker nicht gefunden! Bitte Docker Desktop installieren."
    exit 1
}
$dockerInfo = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Docker laeuft nicht! Bitte Docker Desktop starten."
    exit 1
}

$BackendPath = (Resolve-Path ".\Backend").Path
$OutputFull  = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($OutputPath)
$OutputDir   = Split-Path $OutputFull

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$TempOut = Join-Path ([System.IO.Path]::GetTempPath()) "lambda_out_$(Get-Random)"
New-Item -ItemType Directory -Path $TempOut -Force | Out-Null

try {
    # Lambda-spezifische Requirements (kein FastAPI/Uvicorn)
    $LambdaReqPath = Join-Path $TempOut "lambda_requirements.txt"
    $LambdaReqContent = "boto3==1.35.0`npsycopg2-binary==2.9.9`nsqlalchemy==2.0.35`npydantic==2.9.2`npydantic-settings==2.5.2`npython-dotenv==1.0.1`n"
    [System.IO.File]::WriteAllText($LambdaReqPath, $LambdaReqContent, [System.Text.Encoding]::UTF8)

    Write-Host "  Starte Docker Container (public.ecr.aws/lambda/python:$PythonVersion)..."
    Write-Host "  (Beim ersten Mal wird das Image heruntergeladen, das dauert einen Moment)"

    # Shell-Script das im Container laeuft
    $BuildScript = 'set -e; mkdir -p /build; pip install -q -r /requirements/lambda_requirements.txt -t /build; cp -r /src/automation /build/automation; cp -r /src/models /build/models; cp /src/database.py /build/database.py; printf "from automation.lambda_handler import lambda_handler\n__all__ = [\"lambda_handler\"]\n" > /build/lambda_handler.py; cd /build; zip -r /output/lambda.zip . -x "*.pyc" -x "*/__pycache__/*" > /dev/null; echo "ZIP erstellt: $(du -h /output/lambda.zip | cut -f1)"'

    docker run --rm `
        -v "${BackendPath}:/src:ro" `
        -v "${TempOut}:/output" `
        -v "${TempOut}:/requirements:ro" `
        "public.ecr.aws/lambda/python:$PythonVersion" `
        bash -c $BuildScript

    if ($LASTEXITCODE -ne 0) {
        throw "Docker Build fehlgeschlagen (Exit Code $LASTEXITCODE)"
    }

    $TempZip = Join-Path $TempOut "lambda.zip"
    if (-not (Test-Path $TempZip)) {
        throw "ZIP wurde vom Container nicht erstellt."
    }

    if (Test-Path $OutputFull) { Remove-Item $OutputFull -Force }
    Copy-Item $TempZip $OutputFull

    $SizeMB = [Math]::Round((Get-Item $OutputFull).Length / 1MB, 2)
    Write-Host ""
    Write-Host "Lambda ZIP erfolgreich erstellt!" -ForegroundColor Green
    Write-Host "   Pfad:    $OutputFull"
    Write-Host "   Groesse: $SizeMB MB"

} catch {
    Write-Error "Fehler beim Bauen: $_"
    exit 1
} finally {
    if (Test-Path $TempOut) {
        Remove-Item $TempOut -Recurse -Force
    }
}

Write-Host ""
Write-Host "Naechste Schritte:"
Write-Host "   1. terraform plan"
Write-Host "   2. terraform apply"
Write-Host "   3. CloudWatch Logs pruefen:"
Write-Host "      aws logs tail /aws/lambda/bewerbungssammler-automation --follow"
