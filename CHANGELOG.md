# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden hier dokumentiert.
Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.0.0/).

### Added

- Terraform-Setup zur Bereitstellung einer AWS RDS-PostgreSQL-Instanz (`terraform/`), inklusive:
  - Remote-State über S3 mit DynamoDB-Locking (`terraform/bootstrap/`)
  - GitHub-OIDC-Anbindung für passwortlose AWS-Authentifizierung in CI
  - GitHub-Actions-Workflow (`terraform.yml`) mit `plan` auf Pull Requests und manuellem `apply`

## [0.1.0] - 2026-07-21

### Added

- Erste FastAPI-Anwendung mit CRUD-Endpunkten für Users, Companies, Job Postings und Applications
- SQLAlchemy-Models mit SQLite für lokale Entwicklung, PostgreSQL-Unterstützung vorbereitet
- Pylint- und Danger-Checks als Pull-Request-Workflow

## [0.0.1] - 2026-07-20

### Added

- Initiales Projekt-Setup und einfaches HTML-Frontend-Mockup
