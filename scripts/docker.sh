#!/usr/bin/env bash
# Steuert die lokale Docker-Entwicklungsumgebung (Postgres + Backend + Frontend).
# Nur fuer lokale Entwicklung gedacht -- keine Produktions-Konfiguration.
#
# Nutzung: ./scripts/docker.sh <start|stop|restart|install> [--build] [--volumes|-v]

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="docker-compose.yml"

ok()   { printf '\033[32m✔ %s\033[0m\n' "$1"; }
err()  { printf '\033[31m✖ %s\033[0m\n' "$1" >&2; }
info() { printf '\033[36m→ %s\033[0m\n' "$1"; }

fail() {
  err "$1"
  exit 1
}

compose() {
  docker compose -f "$COMPOSE_FILE" "$@"
}

check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    fail "Docker wurde nicht gefunden. Installiere Docker Desktop: https://www.docker.com/products/docker-desktop/"
  fi
  if ! docker compose version >/dev/null 2>&1; then
    fail "Docker Compose (v2 Plugin) wurde nicht gefunden. Aktualisiere Docker Desktop bzw. installiere das Compose-Plugin."
  fi
  if ! docker info >/dev/null 2>&1; then
    fail "Der Docker-Daemon laeuft nicht. Starte Docker Desktop und versuche es erneut."
  fi
  ok "Docker und Docker Compose sind verfuegbar, Daemon laeuft"
}

copy_env_if_missing() {
  local dir="$1"
  if [ -f "$dir/.env.example" ]; then
    if [ -f "$dir/.env" ]; then
      info "$dir/.env existiert bereits -- wird nicht ueberschrieben"
    else
      cp "$dir/.env.example" "$dir/.env"
      ok "$dir/.env aus .env.example erstellt"
    fi
  fi
}

wait_for_healthy() {
  local service="$1"
  local timeout="${2:-60}"
  local elapsed=0
  info "Warte auf Healthcheck von '$service'..."
  while true; do
    local cid
    cid="$(compose ps -q "$service" 2>/dev/null || true)"
    if [ -z "$cid" ]; then
      fail "Service '$service' wurde nicht gestartet."
    fi
    local status
    status="$(docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}no-healthcheck{{end}}' "$cid" 2>/dev/null || echo "unknown")"
    if [ "$status" = "healthy" ] || [ "$status" = "no-healthcheck" ]; then
      ok "'$service' ist bereit"
      return 0
    fi
    if [ "$status" = "unhealthy" ]; then
      fail "'$service' ist unhealthy. Logs: docker compose logs $service"
    fi
    if [ "$elapsed" -ge "$timeout" ]; then
      fail "Timeout beim Warten auf '$service' (${timeout}s). Logs: docker compose logs $service"
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
}

print_urls() {
  echo ""
  ok "Alle Services laufen"
  echo "    Frontend:  http://localhost:5173"
  echo "    Backend:   http://localhost:8000  (Docs: http://localhost:8000/docs)"
  echo "    Datenbank: localhost:5432"
  echo ""
}

cmd_start() {
  local build_flag=()
  for arg in "$@"; do
    case "$arg" in
      --build) build_flag=(--build) ;;
    esac
  done

  check_docker
  info "Starte Container..."
  compose up -d "${build_flag[@]}"

  wait_for_healthy db 60
  wait_for_healthy backend 60

  info "Tabellen werden beim Backend-Start automatisch angelegt (SQLAlchemy create_all, kein separates Migrationstool im Projekt vorhanden)."

  print_urls
}

cmd_stop() {
  local remove_volumes=false
  for arg in "$@"; do
    case "$arg" in
      --volumes|-v) remove_volumes=true ;;
    esac
  done

  check_docker

  if [ "$remove_volumes" = true ]; then
    err "ACHTUNG: Dies loescht auch die Datenbank-Volumes (alle lokalen Daten gehen verloren)!"
    read -r -p "Wirklich fortfahren? [y/N] " reply
    case "$reply" in
      [yY]|[yY][eE][sS])
        compose down --volumes
        ok "Alle Container gestoppt und Volumes geloescht"
        ;;
      *)
        info "Abgebrochen -- Volumes wurden nicht geloescht"
        compose down
        ok "Alle Container gestoppt (Volumes bleiben erhalten)"
        ;;
    esac
  else
    compose down
    ok "Alle Container gestoppt (Volumes/Datenbank-Daten bleiben erhalten)"
  fi
}

cmd_restart() {
  local build_flag=()
  for arg in "$@"; do
    case "$arg" in
      --build) build_flag=(--build) ;;
    esac
  done
  cmd_stop
  cmd_start "${build_flag[@]}"
}

cmd_install() {
  check_docker

  copy_env_if_missing "Backend"
  copy_env_if_missing "frontend"

  info "Baue Docker-Images (installiert dabei automatisch pip- und npm-Abhaengigkeiten im jeweiligen Image)..."
  compose build
  ok "Images gebaut"

  info "Starte Datenbank..."
  compose up -d db
  wait_for_healthy db 60

  info "Starte Backend (legt Tabellen automatisch an)..."
  compose up -d backend
  wait_for_healthy backend 60

  info "Kein Seed-Skript im Projekt gefunden -- ueberspringe Seed-Daten."

  compose stop backend db >/dev/null

  echo ""
  ok "Setup abgeschlossen -- starte das Projekt mit: ./scripts/docker.sh start"
  echo ""
}

usage() {
  cat <<EOF
Nutzung: $0 <command> [optionen]

Commands:
  install            Einmaliges Setup (.env, Images bauen, DB starten, Tabellen anlegen)
  start [--build]    Startet alle Services
  stop [-v|--volumes] Stoppt alle Services (Volumes bleiben, ausser -v/--volumes gesetzt)
  restart [--build]  Stoppt und startet alle Services neu
EOF
}

main() {
  local command="${1:-}"
  [ $# -gt 0 ] && shift || true

  case "$command" in
    start)   cmd_start "$@" ;;
    stop)    cmd_stop "$@" ;;
    restart) cmd_restart "$@" ;;
    install) cmd_install "$@" ;;
    *)
      usage
      exit 1
      ;;
  esac
}

main "$@"
