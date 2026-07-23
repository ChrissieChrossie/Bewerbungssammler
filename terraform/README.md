# Terraform: RDS-PostgreSQL für den Bewerbungssammler

Erstellt eine öffentlich erreichbare RDS-PostgreSQL-Instanz in `eu-central-1`.
Die Tabellen (`users`, `companies`, `job_postings`, `applications`) legt
Terraform **nicht** an – das übernimmt die FastAPI-App selbst beim Start
(`Base.metadata.create_all` in `Backend/main.py`).

Der State liegt remote in S3 (mit DynamoDB-Lock), damit sowohl du lokal als
auch GitHub Actions denselben Stand sehen. Dafür muss einmalig der
`bootstrap/`-Ordner ausgeführt werden.

## 1. Einmaliges Bootstrapping (lokal, nicht über GitHub Actions)

```bash
cd terraform/bootstrap
terraform init
terraform apply
```

Das erstellt:

- einen S3-Bucket für den Terraform-State
- eine DynamoDB-Tabelle für das State-Locking
- einen GitHub-OIDC-Provider in IAM (falls im Account noch keiner existiert –
  sonst `create_oidc_provider = false` in `terraform.tfvars` setzen)
- eine IAM-Rolle, die GitHub Actions per OIDC übernehmen darf (eingeschränkt
  auf `ChrissieChrossie/Bewerbungssammler`)

Outputs merken (werden gleich gebraucht):

```bash
terraform output
```

## 2. GitHub-Repo konfigurieren

**Repo-Variablen** (Settings → Secrets and variables → Actions → Variables):

| Name                       | Wert                                          |
| --------------------------- | ---------------------------------------------- |
| `AWS_REGION`                 | `eu-central-1`                                |
| `AWS_ROLE_ARN`                | Output `github_actions_role_arn` aus Schritt 1 |
| `TF_STATE_BUCKET`            | Output `tf_state_bucket` aus Schritt 1         |
| `TF_STATE_DYNAMODB_TABLE`    | Output `tf_lock_table` aus Schritt 1           |
| `ALLOWED_CIDR_BLOCKS`        | z.B. `["203.0.113.5/32"]`                     |

**Repo-Secrets:**

| Name          | Wert                              |
| -------------- | ---------------------------------- |
| `DB_PASSWORD` | Master-Passwort für die RDS-Instanz |

**GitHub Environment** `production` anlegen (Settings → Environments) und
mindestens dich selbst als "Required reviewer" eintragen – das ist die
manuelle Bestätigung, bevor `terraform apply` über GitHub Actions läuft.

## 3. Workflow nutzen

- **Plan:** läuft automatisch bei jedem PR, das `terraform/**` ändert, und
  kommentiert das Ergebnis in den PR. Kann auch manuell über
  *Actions → Terraform → Run workflow* mit Aktion `plan` gestartet werden.
- **Apply:** *Actions → Terraform → Run workflow* mit Aktion `apply` –
  wartet wegen des `production`-Environments auf deine Bestätigung.

## Lokale Nutzung (alternativ zu GitHub Actions)

```bash
terraform init \
  -backend-config="bucket=<tf_state_bucket>" \
  -backend-config="key=bewerbungssammler/terraform.tfstate" \
  -backend-config="region=eu-central-1" \
  -backend-config="dynamodb_table=<tf_lock_table>"

cp terraform.tfvars.example terraform.tfvars
# terraform.tfvars anpassen: db_password und allowed_cidr_blocks setzen

terraform plan
terraform apply
```

Nach `apply` die `DATABASE_URL` auslesen und in `Backend/.env` eintragen:

```bash
terraform output -raw database_url
```

Beim nächsten Start der FastAPI-App (`uvicorn main:app`) werden die Tabellen
automatisch in der RDS-Datenbank angelegt.

## Aufräumen

```bash
terraform destroy                    # Haupt-Ressourcen (RDS etc.)
cd bootstrap && terraform destroy    # Bootstrap-Ressourcen (State-Bucket etc.)
```
