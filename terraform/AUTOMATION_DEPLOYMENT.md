# Automatisierung: Deployment Guide

Dieses Dokument erklärt, wie die Lambda-Automation deployt wird.

---

## 📋 Voraussetzungen

- AWS Account mit ausreichenden Permissions (Lambda, EventBridge, SES, RDS, VPC)
- Terraform ≥ 1.5
- Python 3.12 lokal installiert
- Terraform State bereits konfiguriert (siehe `terraform/bootstrap/`)

---

## 🔧 Schritt 1: Lambda ZIP-Archiv bauen

Die Lambda-Funktion benötigt Python-Code + Dependencies als ZIP-Datei.

### 1a: Build-Skript (Windows PowerShell)

```powershell
# Wechsle ins Backend-Verzeichnis
cd Backend

# 1. Virtuelle Umgebung erstellen
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Dependencies installieren
pip install -r requirements.txt

# 3. Lambda ZIP bauen
mkdir -p ..\lambda_build
cp -r automation ..\lambda_build\
cp database.py ..\lambda_build\
cp models ..\lambda_build\ -Recurse

# 4. Dependencies ins Archiv kopieren
$site_packages = (Get-ChildItem ".\venv\Lib\site-packages" -Directory | Select-Object -First 1).FullName
Copy-Item -Path "$site_packages\*" -Destination "..\lambda_build\" -Recurse -Force

# 5. ZIP erstellen
cd ..\lambda_build
Compress-Archive -Path * -DestinationPath ..\automation_lambda.zip -Force

# 6. Aufräumen
cd ..
Remove-Item lambda_build -Recurse -Force
```

### 1b: Build-Skript (Linux/Mac Bash)

```bash
#!/bin/bash

cd Backend

# 1. Virtuelle Umgebung
python3.12 -m venv venv
source venv/bin/activate

# 2. Dependencies
pip install -r requirements.txt

# 3. Lambda-Verzeichnis
mkdir -p ../lambda_build
cp -r automation ../lambda_build/
cp database.py ../lambda_build/
cp -r models ../lambda_build/

# 4. Site-packages kopieren
SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])")
cp -r "$SITE_PACKAGES"/* ../lambda_build/

# 5. ZIP
cd ../lambda_build
zip -r ../automation_lambda.zip .

# 6. Aufräumen
cd ..
rm -rf lambda_build
```

### Resultat
→ `automation_lambda.zip` im Terraform-Verzeichnis

---

## 🚀 Schritt 2: Terraform konfigurieren

### 2a: Umgebungsvariablen/terraform.tfvars

```hcl
# terraform/terraform.tfvars

# Bestehende Variablen
db_password = "YourSecurePassword123!"
allowed_cidr_blocks = ["0.0.0.0/0"]  # Oder spezifische IPs

# NEUE Automation-Variablen
automation_sender_email       = "noreply@bewerbungssammler.com"
automation_recipient_email    = "admin@bewerbungssammler.com"
automation_schedule_hour      = 8  # Täglich 8 Uhr UTC
automation_enabled            = true
automation_days_open_critical = 7
automation_days_in_progress_warning = 14
```

**Wichtig**: `terraform.tfvars` in `.gitignore`, nicht committen!

### 2b: GitHub Secrets (falls über GitHub Actions deployt)

Wenn ihr den `terraform.yml` Workflow nutzt:

```
Secrets:
- DB_PASSWORD=YourSecurePassword123!

Variables (Settings → Secrets and variables → Variables):
- ALLOWED_CIDR_BLOCKS="0.0.0.0/0"
- AUTOMATION_SENDER_EMAIL=noreply@bewerbungssammler.com
- AUTOMATION_RECIPIENT_EMAIL=admin@bewerbungssammler.com
- AWS_ROLE_ARN=arn:aws:iam::123456789:role/github-oidc-role
- AWS_REGION=eu-central-1
- TF_STATE_BUCKET=your-state-bucket
- TF_STATE_DYNAMODB_TABLE=your-lock-table
```

---

## 📝 Schritt 3: Terraform Plan & Apply

### 3a: Lokal deployen (mit AWS Credentials)

```bash
cd terraform

# Credentials konfigurieren
export AWS_ACCESS_KEY_ID="your_key"
export AWS_SECRET_ACCESS_KEY="your_secret"
export AWS_REGION="eu-central-1"

# Terraform init (wenn noch nicht geschehen)
terraform init \
  -backend-config="bucket=your-state-bucket" \
  -backend-config="key=bewerbungssammler/terraform.tfstate" \
  -backend-config="region=eu-central-1" \
  -backend-config="dynamodb_table=your-lock-table"

# Plan ansehen
terraform plan -var-file=terraform.tfvars

# Apply (deployt alles)
terraform apply -var-file=terraform.tfvars
```

### 3b: Über GitHub Actions

```bash
# Push auf develop-Branch
git push origin develop

# Auf GitHub: Actions → Terraform → Run workflow
# → "plan" ausführen
# → Plan in PR-Kommentar prüfen
# → Manuell "apply" triggern (workflow_dispatch)
```

---

## ✅ Schritt 4: Nach dem Deploy

### 4a: SES Email-Verifikation

Nach `terraform apply` sind die Emails noch **unverifiziert**.

1. AWS Console → **SES** → **Verified identities**
2. Klick auf Sender-Email
3. Bestätigungs-Link in Email-Inbox klicken
4. Repeat für Recipient-Email

**Ohne Verifikation**: Lambda wird fehlschlagen, "MessageRejected" Error

### 4b: Lambda manuell testen

```bash
# Test-Event invoking
aws lambda invoke \
  --function-name bewerbungssammler-automation \
  --invocation-type RequestResponse \
  /tmp/lambda_response.json

# Response anschauen
cat /tmp/lambda_response.json
```

### 4c: CloudWatch Logs ansehen

```bash
# Live Logs
aws logs tail /aws/lambda/bewerbungssammler-automation --follow

# Oder: AWS Console → CloudWatch → Log groups → /aws/lambda/bewerbungssammler-automation
```

### 4d: EventBridge Rule testen

```bash
# Manuell triggern (optional, zum Testen)
aws events put-events \
  --entries '[{"Source":"test","DetailType":"Test","Detail":"{}"}]'
```

---

## 🔍 Häufige Probleme

### Problem: "Lambda cannot be invoked due to error"

**Ursache**: Security Group fehlt oder RDS ist nicht erreichbar

**Lösung**:
```bash
# Prüfen ob SG richtig ist
aws ec2 describe-security-groups --filter Name=group-name,Values=bewerbungssammler-lambda-sg

# Security Group Rule prüfen
aws ec2 describe-security-group-rules \
  --filter Name=description,Values="Erlaubt Lambda Zugriff auf RDS"
```

---

### Problem: "MessageRejected" in SES

**Ursache**: Email nicht verifiziert oder im Sandbox

**Lösung**:
1. AWS Console → SES → Verified identities
2. Sender UND Recipient emails verifizieren
3. Bestätigungs-Links in Emails klicken

---

### Problem: "FileNotFoundError: automation_lambda.zip"

**Ursache**: ZIP-Datei wurde nicht gebaut

**Lösung**:
```bash
# ZIP neu bauen (siehe Schritt 1)
cd terraform
# Stelle sicher dass `automation_lambda.zip` existiert
ls -la automation_lambda.zip
```

---

### Problem: "Database connection failed"

**Ursache**: RDS Credentials falsch oder Netzwerk-Problem

**Lösung**:
```bash
# DATABASE_URL in Lambda prüfen
aws lambda get-function-configuration \
  --function-name bewerbungssammler-automation \
  --query 'Environment.Variables.DATABASE_URL'

# RDS Endpoint prüfen
aws rds describe-db-instances \
  --query 'DBInstances[*].[DBInstanceIdentifier,Endpoint.Address]'
```

---

## 🎯 Nächste Schritte nach erfolgreichem Deploy

### 1. Lokal testen
```bash
cd Backend
python -m automation.checker
```

### 2. Lambda-Logs prüfen
```bash
aws logs tail /aws/lambda/bewerbungssammler-automation --follow
```

### 3. EventBridge Rule prüfen
```bash
aws events describe-rule --name bewerbungssammler-daily-automation
```

### 4. Test-Email manuell versenden
```bash
aws lambda invoke \
  --function-name bewerbungssammler-automation \
  /tmp/test.json && cat /tmp/test.json
```

---

## 📦 Terraform-Dateien

| Datei | Zweck |
|-------|-------|
| `lambda.tf` | Lambda-Funktion, IAM, VPC, Logs |
| `eventbridge.tf` | EventBridge Rule (täglicher Trigger) |
| `ses.tf` | SES Email-Identities |
| `variables.tf` | Neue Variablen (Sender, Recipient, Schedule, etc.) |
| `outputs.tf` | Neue Outputs (Lambda ARN, EventBridge Rule, etc.) |

---

## 🔐 Sicherheit

### Best Practices

- ✅ `terraform.tfvars` in `.gitignore` (Secrets nicht committen)
- ✅ Database-Passwort via `terraform.tfvars` (sensitive = true)
- ✅ SES Sandbox für MVP (nur verifizierte Adressen)
- ✅ Lambda in VPC für RDS Zugriff
- ✅ IAM Policy prinzipiell (minimal nötige Permissions)

### Secrets Management

```hcl
# Nicht tun:
variable "db_password" {
  default = "MyPassword123"  # ❌ NIEMALS Hardcoded!
}

# Stattdessen:
variable "db_password" {
  sensitive = true  # ✅ Output wird gemaskiert
  # Wert aus terraform.tfvars, Env-Var oder AWS Secrets Manager
}
```

---

## 🚨 Cleanup (Falls nötig)

```bash
# Alles löschen
terraform destroy -var-file=terraform.tfvars

# Nur Lambda (nicht RDS/VPC)
terraform destroy \
  -var-file=terraform.tfvars \
  -target=aws_lambda_function.automation \
  -target=aws_cloudwatch_event_rule.daily_automation
```

---

## 📞 Support

Bei Fragen/Problemen:
1. CloudWatch Logs ansehen: `aws logs tail /aws/lambda/bewerbungssammler-automation`
2. Terraform state prüfen: `terraform show`
3. AWS Console: Lambda → Monitoring → Logs
