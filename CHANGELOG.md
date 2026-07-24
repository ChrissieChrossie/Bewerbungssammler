# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.
Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

## [0.3.0] - 2026-07-24

### Added

- Vollständiges AWS-Deployment: Backend läuft als Container in App Runner (Image aus ECR), Frontend-Build wird über S3 + CloudFront ausgeliefert
- Eine CloudFront-Distribution für die ganze Seite – `/api/*` wird an App Runner durchgereicht, alles andere an S3 (kein CORS nötig, da Frontend und Backend dieselbe Domain teilen)
- App-Runner-VPC-Connector, damit das Backend die RDS-Instanz erreicht, ohne sie öffentlich freigeben zu müssen
- Neue GitHub-Actions-Workflows `deploy-backend.yml` und `deploy-frontend.yml`, die bei Push auf `main` automatisch bauen und deployen
- Terraform-Ressourcen für ECR, App Runner, S3 und CloudFront (`terraform/ecr.tf`, `terraform/apprunner.tf`, `terraform/frontend.tf`, `terraform/cloudfront.tf`), erweiterte GitHub-OIDC-IAM-Policy für die neuen Ressourcen

## [0.2.1] - 2026-07-24

### Added

- Frontend komplett überarbeitet: neue Landing-, Login- und Signup-Seiten, Dashboard-Layout, wiederverwendbare Komponenten (Button, Card, Navigation, Breadcrumbs, Footer, Modal u.a.)
- Tailwind-Konfiguration erweitert für ein einheitlicheres Design
- ESLint-Workflow für das Frontend (`.github/workflows/frontend-lint.yml`)

## [0.2.0] - 2026-07-24

### Added

- Frontend mit Backend verbunden: React-Frontend spricht über die API-Client-Schicht (`frontend/src/api/client.js`) und den Vite-Dev-Proxy mit der FastAPI-API

## [0.1.0] - 2026-07-22

### Added

- Erste FastAPI-Anwendung mit CRUD-Endpunkten für Users, Companies, Job Postings und Applications
- SQLAlchemy-Models mit SQLite für lokale Entwicklung, PostgreSQL-Unterstützung vorbereitet
- Pylint- und Danger-Checks als Pull-Request-Workflow
- Terraform-Setup zur Bereitstellung einer AWS RDS-PostgreSQL-Instanz (`terraform/`), inklusive:
  - Remote-State über S3 mit DynamoDB-Locking (`terraform/bootstrap/`)
  - GitHub-OIDC-Anbindung für passwortlose AWS-Authentifizierung in CI
  - GitHub-Actions-Workflow (`terraform.yml`) mit `plan` auf Pull Requests und manuellem `apply`
- Docker-Compose-Setup (`docker-compose.yml`, `Backend/Dockerfile`) für eine lokale Postgres-Instanz samt Backend, ganz ohne AWS
- Bruno-API-Collection (`bruno/`) mit allen CRUD-Endpunkten inkl. automatischer ID-Übernahme zwischen Requests

### Fixed

- `HttpUrl`-Felder (`companies.homepage`, `job_postings.link`) wurden vor dem Schreiben in Postgres nicht in einen String umgewandelt, was zu einem 500er führte

## [0.0.1] - 2026-07-20

### Added

- Initiales Projekt-Setup und einfaches HTML-Frontend-Mockup
