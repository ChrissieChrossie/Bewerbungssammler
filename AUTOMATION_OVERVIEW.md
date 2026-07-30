# Bewerbungssammler – Automation Übersicht

## Was macht die Automation?

Jeden Morgen um **8:00 Uhr UTC (= 9/10 Uhr DE)** läuft automatisch ein Prozess, der alle
offenen Bewerbungen in der Datenbank prüft und eine Zusammenfassung per Email verschickt.

---

## Ablauf (Schritt für Schritt)

```
EventBridge (täglich 8 Uhr UTC)
        │
        ▼
  AWS Lambda (Python 3.12)
        │
        ├─► 1. Verbindet sich mit RDS PostgreSQL
        │
        ├─► 2. Prüft alle aktiven Bewerbungen:
        │       - Status OPEN  seit > 7 Tagen  → "Kritisch" (wahrscheinlich abgelehnt)
        │       - Status IN_PROGRESS > 14 Tage → "Nachfassen" (zu lange kein Feedback)
        │       - Status INVITED               → "Info" (Interview läuft, gut so!)
        │
        ├─► 3. Generiert einen HTML-Email-Report
        │
        └─► 4. Versendet Report via AWS SES an post@dennis-rapp.com
```

---

## AWS-Dienste

| Dienst | Rolle |
|---|---|
| **EventBridge** | Zeitgesteuerte Auslösung täglich um 8:00 UTC (Cron-Job in der Cloud) |
| **Lambda** | Führt den Python-Code aus (serverless, kein Server nötig) |
| **RDS PostgreSQL** | Datenbank mit allen Bewerbungen |
| **SES** | Versendet die tägliche Email |
| **CloudWatch Logs** | Speichert alle Lambda-Logs für 14 Tage (zum Debuggen) |
| **IAM** | Regelt was Lambda darf (nur Logs schreiben, Email senden, RDS lesen) |

---

## Email-Report (Inhalt)

Der tägliche Report enthält drei Abschnitte:

- **Kritisch** – Bewerbungen seit > 7 Tagen ohne Rückmeldung
- **Zum Nachfassen** – Bewerbungen seit > 14 Tagen im Prozess
- **Laufende Interviews** – Bewerbungen mit Status INVITED (positiv!)
- **Zusammenfassung** – Gesamtzahlen

Abgelehnte (`REJECTED`) und angenommene (`ACCEPTED`) Bewerbungen werden ignoriert.

---

## Konfiguration (anpassbar per Terraform-Variable)

| Variable | Standardwert | Bedeutung |
|---|---|---|
| `automation_schedule_hour` | `8` | Uhrzeit UTC (8 = 9/10 Uhr DE) |
| `automation_days_open_critical` | `7` | Ab wann OPEN kritisch ist |
| `automation_days_in_progress_warning` | `14` | Ab wann IN_PROGRESS ein Warning auslöst |
| `automation_enabled` | `true` | Automation ein/ausschalten |

---

## Code-Struktur

```
Backend/automation/
├── lambda_handler.py   # Entry-Point für Lambda (wird von AWS aufgerufen)
├── checker.py          # Prüflogik (welche Bewerbungen haben ein Problem?)
├── notifications.py    # Email-Generierung und SES-Versand
└── __init__.py

terraform/
├── lambda.tf           # Lambda-Funktion + IAM-Rolle + Security Group
├── eventbridge.tf      # Täglicher Zeitplan (Cron)
└── ses.tf              # Email-Verifikation (Sandbox-Modus)
```

---

## Aktueller Deployment-Status

| Schritt | Status |
|---|---|
| Terraform Bootstrap (S3 State-Bucket) | ✅ Erledigt |
| Lambda ZIP gebaut (`automation_lambda.zip`) | ✅ Erledigt |
| Terraform Init (Haupt-Infrastruktur) | ✅ Erledigt |
| Terraform Apply | ✅ Erledigt (13 Ressourcen deployed) |
| SES Email-Verifikation | ✅ Erledigt (post@dennis-rapp.com verifiziert) |
