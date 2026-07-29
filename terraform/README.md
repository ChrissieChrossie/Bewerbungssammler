# Terraform: AWS-Infrastruktur für den Bewerbungssammler

Erstellt die komplette AWS-Infrastruktur in `eu-central-1`:

- **RDS PostgreSQL** – öffentlich erreichbar per IP-Whitelist (lokale Entwicklung)
  und zusätzlich vom App-Runner-VPC-Connector aus (Backend in Produktion).
  Die Tabellen (`users`, `companies`, `job_postings`, `applications`) legt
  Terraform **nicht** an – das übernimmt die FastAPI-App selbst beim Start
  (`Base.metadata.create_all` in `Backend/main.py`).
- **ECR-Repository + App Runner** – Backend läuft als Container in App Runner,
  Image kommt aus ECR.
- **S3 + CloudFront** – Frontend-Build (`frontend/dist`) liegt in einem privaten
  S3-Bucket, ausgeliefert über eine CloudFront-Distribution. `/api/*` wird von
  derselben Distribution an App Runner durchgereicht, sodass Frontend und
  Backend eine gemeinsame Domain teilen (kein CORS nötig).

Die öffentliche URL der Seite ist der Output `cloudfront_domain_name`.

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
| `ECR_REPOSITORY_URL`         | Output `ecr_repository_url` (nach Schritt 4)  |
| `APPRUNNER_SERVICE_ARN`      | Output `apprunner_service_arn` (nach Schritt 5) |
| `FRONTEND_BUCKET`            | Output `frontend_bucket_name` (nach Schritt 5) |
| `CLOUDFRONT_DISTRIBUTION_ID` | Output `cloudfront_distribution_id` (nach Schritt 5) |

**Repo-Secrets:**

| Name          | Wert                              |
| -------------- | ---------------------------------- |
| `DB_PASSWORD` | Master-Passwort für die RDS-Instanz |

**GitHub Environment** `production` anlegen (Settings → Environments) und
mindestens dich selbst als "Required reviewer" eintragen – das ist die
manuelle Bestätigung, bevor `terraform apply`, `deploy-backend.yml` oder
`deploy-frontend.yml` über GitHub Actions laufen.

## 3. Erstmaliges Deployment (Henne-Ei-Problem: App Runner braucht ein Image)

App Runner prüft beim Anlegen des Service, ob unter `<ecr_repository_url>:latest`
bereits ein Image liegt. Ein einziger `terraform apply` von Anfang an schlägt
deshalb fehl, solange das Repo noch leer ist. Reihenfolge beim ersten Mal:

```bash
# 1. Bootstrap mit der erweiterten IAM-Policy neu anwenden (ECR/App Runner/S3/CloudFront)
cd terraform/bootstrap
terraform apply

# 2. Nur das ECR-Repo anlegen
cd ../
terraform apply -target=aws_ecr_repository.backend

# 3. Erstes Image bauen und pushen
aws ecr get-login-password --region eu-central-1 \
  | docker login --username AWS --password-stdin <ecr_repository_url ohne :tag>
docker build -t <ecr_repository_url>:latest ../Backend
docker push <ecr_repository_url>:latest

# 4. Vollständiger Apply – jetzt kann App Runner das Image ziehen,
#    danach kann CloudFront angelegt werden (hängt vom App-Runner-Output ab)
terraform apply
```

Anschließend `terraform output` auslesen und die vier neuen Repo-Variablen
oben eintragen. Ab da übernehmen `deploy-backend.yml` / `deploy-frontend.yml`
alle weiteren Deploys automatisch bei Push auf `main`.

## 4. Workflows im Alltag

- **Terraform Plan:** läuft automatisch bei jedem PR, das `terraform/**` ändert, und
  kommentiert das Ergebnis in den PR. Kann auch manuell über
  *Actions → Terraform → Run workflow* mit Aktion `plan` gestartet werden.
- **Terraform Apply:** *Actions → Terraform → Run workflow* mit Aktion `apply` –
  wartet wegen des `production`-Environments auf deine Bestätigung.
- **Deploy Backend:** läuft automatisch bei Push auf `main` mit Änderungen unter
  `Backend/**` – baut das Image, pusht es nach ECR und startet ein neues
  App-Runner-Deployment.
- **Deploy Frontend:** läuft automatisch bei Push auf `main` mit Änderungen unter
  `frontend/**` – baut `frontend/dist`, synct es nach S3 und invalidiert den
  CloudFront-Cache.

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
