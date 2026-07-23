# Syntax-Bewerbungssammler

Eine Excel-Tabelle mit 47 Tabs, in der irgendwo der Überblick verloren geht – kennt jeder, der mal eine Zeit lang Bewerbungen geschrieben hat. Genau dafür gibt's das hier: eine kleine API, die Nutzer, Unternehmen, Stellenausschreibungen und Bewerbungen sauber miteinander verknüpft, damit man wenigstens in einer Sache im Bewerbungsprozess die Kontrolle behält.

## Was kann das Ding

- **Users** – wer bewirbt sich hier eigentlich
- **Companies** – bei wem
- **Job Postings** – auf welche Stelle genau
- **Applications** – Status, Datum, Notizen – der eigentliche Kern der Sache

Alles ganz normales CRUD über eine FastAPI-REST-API, nichts Wildes. Die Daten landen je nach Umgebung in SQLite (lokal, ganz ohne Setup), einer lokalen Postgres-Instanz via Docker, oder – für alle mit Hang zum Masochismus – direkt in einer echten AWS-RDS-Datenbank.

## Schnellstart

Der bequeme Weg, ganz ohne AWS-Account, IAM-Rollen oder sonstigen Ärger – ein einziger Befehl startet Datenbank, Backend und Frontend zusammen:

```bash
docker compose up --build
```

Danach läuft:

- das **Frontend** auf `http://localhost:5173`
- die **API** auf `http://localhost:8000` (Endpunkte unter `/api/...`), die interaktive Doku gibt's automatisch unter `http://localhost:8000/docs`

Für manuelles Rumklicken statt Swagger UI liegt außerdem eine fertige [Bruno](https://www.usebruno.com/)-Collection unter `bruno/` bereit – Collection öffnen, Environment „Local" auswählen, loslegen. Die Create-Requests merken sich die erzeugten IDs automatisch, sodass Get/Update/Delete direkt danach funktionieren.

Mehr Details zum Frontend (Projektstruktur, Entwicklung ohne Docker etc.) stehen in [`frontend/README.md`](frontend/README.md).

## Tech-Stack

FastAPI, SQLAlchemy, Pydantic, PostgreSQL (bzw. SQLite für den bequemen lokalen Fall), React + Vite + Tailwind fürs Frontend, Docker für die lokale Entwicklung, Terraform für die "richtige" Infrastruktur in AWS.

##TODO Terraform