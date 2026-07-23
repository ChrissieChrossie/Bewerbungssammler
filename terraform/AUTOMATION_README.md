# AWS Lambda Automation - Quick Start

Dies ist das Terraform-Setup für die tägliche Automatisierung (Bewerbungs-Prüfung + Email-Versand).

---

## 🚀 Quick Start (5 Minuten)

### 1️⃣ Lambda ZIP bauen

**Windows (PowerShell)**:
```powershell
.\build-lambda.ps1
```

**Linux/Mac (Bash)**:
```bash
chmod +x build-lambda.sh
./build-lambda.sh
```

Resultat: `automation_lambda.zip`

### 2️⃣ Terraform konfigurieren

Erstelle `terraform.tfvars`:
```hcl
db_password = "YourPassword123!"
allowed_cidr_blocks = ["0.0.0.0/0"]
automation_recipient_email = "admin@example.com"
automation_sender_email = "noreply@example.com"
```

### 3️⃣ Deployen

```bash
terraform plan
terraform apply
```

### 4️⃣ SES Emails verifizieren

Nach Apply: AWS Console → SES → Verified identities
→ Bestätigungs-Links in Emails klicken

✅ Done! Lambda läuft täglich um 8 Uhr UTC.

---

## 📁 Dateien

| Datei | Zweck |
|-------|-------|
| `lambda.tf` | Lambda-Funktion + IAM + VPC |
| `eventbridge.tf` | Täglicher Trigger (Cron) |
| `ses.tf` | Email-Versand Konfiguration |
| `variables.tf` | Variablen (Sender, Recipient, Schedule) |
| `outputs.tf` | Outputs (Lambda ARN, etc.) |
| `build-lambda.ps1` | Build-Script (Windows) |
| `build-lambda.sh` | Build-Script (Linux/Mac) |
| `AUTOMATION_DEPLOYMENT.md` | Ausführlicher Deployment-Guide |

---

## 🔧 Konfiguration

### Zeitplan ändern

In `terraform.tfvars`:
```hcl
automation_schedule_hour = 18  # 18:00 UTC statt 8:00 UTC
```

### Schwellwerte anpassen

```hcl
automation_days_open_critical = 5      # Statt 7 Tage
automation_days_in_progress_warning = 10  # Statt 14 Tage
```

### Email-Adressen

```hcl
automation_sender_email = "noreply@yourdomain.com"
automation_recipient_email = "your-email@yourdomain.com"
```

---

## 🧪 Testen

### Test 1: Lambda manuell invoking

```bash
aws lambda invoke \
  --function-name bewerbungssammler-automation \
  /tmp/response.json

cat /tmp/response.json
```

### Test 2: Logs ansehen

```bash
aws logs tail /aws/lambda/bewerbungssammler-automation --follow
```

### Test 3: LocalStack (Mock AWS)

Für echte lokale Tests ohne AWS:
```bash
docker run -d localstack/localstack
```

---

## 📊 Monitoring

### CloudWatch Dashboard

```bash
# Erstelle Dashboard (optional)
aws cloudwatch put-dashboard \
  --dashboard-name bewerbungssammler-automation \
  --dashboard-body '{...}'
```

### Logs durchsuchen

```bash
# Fehler finden
aws logs filter-log-events \
  --log-group-name /aws/lambda/bewerbungssammler-automation \
  --filter-pattern "ERROR"

# Erfolgreiche Runs
aws logs filter-log-events \
  --log-group-name /aws/lambda/bewerbungssammler-automation \
  --filter-pattern "erfolgreich"
```

---

## ⚠️ Häufige Fehler

| Fehler | Lösung |
|--------|--------|
| `FileNotFoundError: automation_lambda.zip` | ZIP-Script ausführen: `build-lambda.ps1` |
| `MessageRejected` in SES | Emails in SES Console verifizieren |
| `DB connection failed` | RDS Security Group: Lambda-SG erlauben |
| `Lambda cannot assume role` | IAM Policy auf Role prüfen |

Siehe `AUTOMATION_DEPLOYMENT.md` für detaillierte Lösungen.

---

## 🔐 Best Practices

✅ `terraform.tfvars` in `.gitignore`  
✅ Secrets via Umgebungsvariablen, nicht hardcoded  
✅ CloudWatch Logs prüfen nach jedem Deploy  
✅ SES Sandbox-Modus für MVP  
✅ IAM Permissions minimal halten  

---

## 🆘 Support

1. **Logs**: `aws logs tail /aws/lambda/bewerbungssammler-automation --follow`
2. **Terraform State**: `terraform show`
3. **AWS Console**: Lambda → Monitoring → CloudWatch
4. **Vollständiger Guide**: Siehe `AUTOMATION_DEPLOYMENT.md`

---

## 📞 Links

- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [EventBridge Docs](https://docs.aws.amazon.com/eventbridge/)
- [SES Docs](https://docs.aws.amazon.com/ses/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
