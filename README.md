# Syntax-Bewerbungssammler

Eine Excel-Tabelle mit 47 Tabs, in der irgendwo der Überblick verloren geht – kennt jeder, der mal eine Zeit lang Bewerbungen geschrieben hat. Genau dafür gibt's das hier: eine kleine API, die Nutzer, Unternehmen, Stellenausschreibungen und Bewerbungen sauber miteinander verknüpft, damit man wenigstens in einer Sache im Bewerbungsprozess die Kontrolle behält.

## Was kann das Ding

- **Users** – wer bewirbt sich hier eigentlich
- **Companies** – bei wem
- **Job Postings** – auf welche Stelle genau
- **Applications** – Status, Datum, Notizen – der eigentliche Kern der Sache

Alles ganz normales CRUD über eine FastAPI-REST-API, nichts Wildes. Die Daten landen je nach Umgebung in SQLite (lokal, ganz ohne Setup), einer lokalen Postgres-Instanz via Docker, oder – für alle mit Hang zum Masochismus – direkt in einer echten AWS-RDS-Datenbank.

## Lokale Entwicklung mit Docker

Der bequeme Weg, ganz ohne AWS-Account, IAM-Rollen oder sonstigen Ärger – Datenbank, Backend und Frontend laufen zusammen in Docker-Containern. **Dieses Setup ist ausschließlich für die lokale Entwicklung gedacht**, keine Produktions-Konfiguration und kein Deployment (dafür siehe [AWS-Deployment](#aws-deployment)).

### Voraussetzungen

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS/Windows) bzw. Docker Engine + Compose-Plugin (Linux), Version 24+
- Docker Compose v2 (im Docker-Desktop-Client bereits enthalten, `docker compose version` prüfen)

### Erste Einrichtung

```bash
git clone <repository-url>
cd Syntax-Bewerbungssammler

# einmalig: .env-Dateien anlegen, Images bauen, DB starten
./scripts/docker.sh install      # macOS / Linux / Git-Bash
.\scripts\docker.ps1 install     # Windows PowerShell

# danach: alles starten
./scripts/docker.sh start        # macOS / Linux / Git-Bash
.\scripts\docker.ps1 start       # Windows PowerShell
```

Browser öffnen: `http://localhost:5173`

Für manuelles Rumklicken statt Swagger UI liegt außerdem eine fertige [Bruno](https://www.usebruno.com/)-Collection unter `bruno/` bereit – Collection öffnen, Environment „Local" auswählen, loslegen. Die Create-Requests merken sich die erzeugten IDs automatisch, sodass Get/Update/Delete direkt danach funktionieren.

Mehr Details zum Frontend (Projektstruktur, Entwicklung ohne Docker etc.) stehen in [`frontend/README.md`](frontend/README.md).

### Die vier Commands

Alle Commands funktionieren identisch unter macOS, Linux und Windows (Bash-Variante `scripts/docker.sh`, PowerShell-Variante `scripts/docker.ps1`). Wer den literalen Aufruf `docker start` möchte, kann sich in der Shell eine Funktion/einen Alias auf das jeweilige Skript anlegen (siehe [Troubleshooting](#troubleshooting) unten).

| Command | Beschreibung |
|---|---|
| `docker install` | Einmaliges Setup: prüft Docker/Compose/Daemon, kopiert `.env.example` → `.env` (Backend + Frontend, bestehende `.env` bleibt unangetastet), baut alle Images (installiert dabei `pip`- und `npm`-Abhängigkeiten im jeweiligen Container-Image), startet die Datenbank und das Backend einmal durch (legt die Tabellen an) und stoppt danach wieder. Idempotent – mehrfaches Ausführen ist unkritisch. |
| `docker start` | Startet alle Container (`docker compose up -d`), wartet auf die Healthchecks von Datenbank und Backend und gibt am Ende alle erreichbaren URLs aus. Mit `--build` werden die Images vorher neu gebaut. |
| `docker stop` | Stoppt alle Container (`docker compose down`). Datenbank-Volumes bleiben standardmäßig erhalten. Mit `-v` / `--volumes` werden die Volumes (inkl. aller lokalen Datenbank-Daten) nach Sicherheitsabfrage mitgelöscht. |
| `docker restart` | Ruft intern `stop` und anschließend `start` auf (keine doppelte Logik). Mit `--build` werden die Images dabei neu gebaut. |

Beispiele:

```bash
./scripts/docker.sh stop --volumes     # Container stoppen UND Datenbank zuruecksetzen (mit Rueckfrage)
./scripts/docker.sh restart --build    # Images neu bauen und alles neu starten
```

```powershell
.\scripts\docker.ps1 stop -Volumes
.\scripts\docker.ps1 restart -Build
```

### Services & Ports

| Service | URL / Port | Beschreibung |
|---|---|---|
| Frontend | http://localhost:5173 | React + Vite, Hot-Reload aktiv (Code-Änderungen in `frontend/src` wirken sofort) |
| Backend | http://localhost:8000 | FastAPI, Endpunkte unter `/api/...`, Hot-Reload aktiv (`uvicorn --reload`) |
| Backend-Doku | http://localhost:8000/docs | Automatisch generierte Swagger-UI |
| Datenbank | localhost:5432 | PostgreSQL 16, Zugangsdaten siehe `docker-compose.yml` (nur lokale Dev-Defaults, keine echten Secrets) |

Tabellen werden beim Start des Backends automatisch angelegt (SQLAlchemy `Base.metadata.create_all`) – es gibt aktuell kein separates Migrationstool (z. B. Alembic) im Projekt. Seed-Daten gibt es derzeit keine.

### Umgebungsvariablen

- `Backend/.env` (aus `Backend/.env.example`) – u. a. `DATABASE_URL`. Im Docker-Setup wird `DATABASE_URL` zusätzlich direkt in `docker-compose.yml` auf die Postgres-Instanz gesetzt; die `.env` greift, sobald das Backend ohne Docker (lokal gegen SQLite) läuft.
- `frontend/.env` (aus `frontend/.env.example`) – u. a. `VITE_API_BASE_URL`.

Beide `.env`-Dateien werden von `docker install` automatisch aus der jeweiligen `.env.example` erzeugt, falls sie noch nicht existieren, und sind über `.gitignore` vom Commit ausgeschlossen.

### Troubleshooting

- **Port bereits belegt** (`5173`, `8000` oder `5432`): anderen Prozess auf dem Port beenden oder das Port-Mapping in `docker-compose.yml` anpassen.
- **Docker-Daemon läuft nicht**: Docker Desktop starten, dann Command erneut ausführen – die Skripte brechen mit einer klaren Fehlermeldung ab, statt still zu hängen.
- **Datenbank-Verbindung schlägt fehl**: `docker compose logs db` prüfen; ggf. mit `./scripts/docker.sh stop --volumes` die Datenbank zurücksetzen (löscht lokale Daten!) und neu `docker install` ausführen.
- **Images neu bauen** (z. B. nach Abhängigkeits-Änderungen): `docker start --build` bzw. `docker restart --build`.
- **Literaler `docker start`-Befehl gewünscht**: In der Shell eine Funktion anlegen, z. B. in `~/.bashrc` / `~/.zshrc`:
  ```bash
  docker() {
    if [ "$1" = "start" ] || [ "$1" = "stop" ] || [ "$1" = "restart" ] || [ "$1" = "install" ]; then
      "$(git rev-parse --show-toplevel)/scripts/docker.sh" "$@"
    else
      command docker "$@"
    fi
  }
  ```
  Für PowerShell analog eine Funktion im Profil (`$PROFILE`) anlegen, die für `start/stop/restart/install` auf `scripts/docker.ps1` umleitet und ansonsten an `docker.exe` durchreicht.

## Tech-Stack

FastAPI, SQLAlchemy, Pydantic, PostgreSQL (bzw. SQLite für den bequemen lokalen Fall), React + Vite + Tailwind fürs Frontend, Docker für die lokale Entwicklung, Terraform für die "richtige" Infrastruktur in AWS.

## AWS-Deployment

Die "richtige" Infrastruktur (RDS PostgreSQL, ECR + App Runner fürs Backend, S3 + CloudFront fürs Frontend) wird per Terraform verwaltet und über GitHub-Actions-Workflows ausgerollt:

- **Terraform** (`terraform.yml` / `terraform-manual.yml`) – Plan/Apply/Destroy der Infrastruktur, inklusive einer Destroy-All-Option, die auch die Bootstrap-Ressourcen (State-Bucket, OIDC-Rolle) mit abräumt.
- **Deploy Backend / Deploy Frontend** – bauen bei Push auf `main` automatisch das Docker-Image bzw. den Vite-Build und rollen ihn aus.

Einmaliges Setup, Henne-Ei-Problem beim ersten Deployment (App Runner braucht schon ein Image aus ECR) und alle Details stehen in [`terraform/README.md`](terraform/README.md).