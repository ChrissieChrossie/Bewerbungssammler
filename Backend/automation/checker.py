"""
Prüflogik für Bewerbungen: Erkennt überfällige Bewerbungen und Fristen.

Diese Funktion kann standalone laufen (z.B. in Lambda) und benötigt nur
Zugriff auf die RDS-Datenbank via DATABASE_URL Umgebungsvariable.
"""

from datetime import date, timedelta
from typing import Dict, List
from sqlalchemy.orm import Session

from database import SessionLocal
from models.application import Application, ApplicationStatus
from models.user import User
from models.company import Company
from models.job_posting import JobPosting


# Konfigurierbare Schwellwerte (in Tagen)
DAYS_OPEN_CRITICAL = 7  # Nach X Tagen OPEN = wahrscheinlich Ablehnung
DAYS_IN_PROGRESS_WARNING = 14  # Nach X Tagen IN_PROGRESS = Nachfassen nötig


class ApplicationProblem:
    """Ein einzelnes Problem mit einer Bewerbung (zu viele Tage ohne Antwort, etc.)."""

    def __init__(
        self,
        application_id: int,
        user_name: str,
        user_email: str,
        company_name: str,
        job_title: str,
        status: ApplicationStatus,
        applied_at: date,
        days_elapsed: int,
        severity: str,  # "critical", "follow_up", "info"
        message: str,
    ):
        self.application_id = application_id
        self.user_name = user_name
        self.user_email = user_email
        self.company_name = company_name
        self.job_title = job_title
        self.status = status
        self.applied_at = applied_at
        self.days_elapsed = days_elapsed
        self.severity = severity
        self.message = message

    def to_dict(self) -> dict:
        """Konvertiert zu Dictionary für JSON-Serialisierung."""
        return {
            "application_id": self.application_id,
            "user_name": self.user_name,
            "user_email": self.user_email,
            "company_name": self.company_name,
            "job_title": self.job_title,
            "status": self.status.value,
            "applied_at": self.applied_at.isoformat(),
            "days_elapsed": self.days_elapsed,
            "severity": self.severity,
            "message": self.message,
        }


def check_applications(db: Session | None = None) -> Dict[str, List[ApplicationProblem]]:
    """
    Prüft alle aktiven Bewerbungen auf Probleme (zu lange Wartezeiten, überfällige Fristen).

    Args:
        db: SQLAlchemy Session. Wenn None, wird eine neue erstellt.
            (Ermöglicht Dependency Injection in FastAPI-Routen)

    Returns:
        Dict mit drei Keys:
        - "critical": Bewerbungen, bei denen lange Stille (OPEN > 7 Tage)
        - "follow_up": Bewerbungen, die Nachfassen brauchen (IN_PROGRESS > 14 Tage)
        - "invited": Laufende Interviews/Tests (Status INVITED)

    Beispiel:
        {
            "critical": [
                ApplicationProblem(
                    application_id=1,
                    user_name="Max Mustermann",
                    company_name="Google",
                    days_elapsed=10,
                    severity="critical",
                    message="Bewerbung seit 10 Tagen im Status OPEN - wahrscheinlich abgelehnt"
                )
            ],
            "follow_up": [...],
            "invited": [...]
        }
    """
    # DB-Session erstellen, wenn nicht vorhanden
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        critical = []
        follow_up = []
        invited = []

        today = date.today()

        # Alle Bewerbungen laden (ausser REJECTED und ACCEPTED, da diese erledigt sind)
        applications = (
            db.query(Application)
            .filter(
                Application.status.in_(
                    [ApplicationStatus.OPEN, ApplicationStatus.IN_PROGRESS, ApplicationStatus.INVITED]
                )
            )
            .options(
                # Eager Loading: Relationships mitladen um N+1 Queries zu vermeiden
            )
            .all()
        )

        for app in applications:
            # Relationships laden (diese sind geladen via eager loading in der Query)
            user: User = app.user
            job_posting: JobPosting = app.job_posting
            company: Company = job_posting.company

            days_since_applied = (today - app.applied_at).days

            # Prüflogik je nach Status
            if app.status == ApplicationStatus.OPEN:
                if days_since_applied > DAYS_OPEN_CRITICAL:
                    # Wahrscheinlich abgelehnt wenn nach X Tagen immer noch OPEN
                    problem = ApplicationProblem(
                        application_id=app.id,
                        user_name=user.name,
                        user_email=user.email,
                        company_name=company.name,
                        job_title=job_posting.title,
                        status=app.status,
                        applied_at=app.applied_at,
                        days_elapsed=days_since_applied,
                        severity="critical",
                        message=f"Seit {days_since_applied} Tagen keine Rückmeldung. "
                        f"Wahrscheinlich abgelehnt oder ignoriert.",
                    )
                    critical.append(problem)

            elif app.status == ApplicationStatus.IN_PROGRESS:
                if days_since_applied > DAYS_IN_PROGRESS_WARNING:
                    # Prozess läuft zu lange, sollte man nachfassen
                    problem = ApplicationProblem(
                        application_id=app.id,
                        user_name=user.name,
                        user_email=user.email,
                        company_name=company.name,
                        job_title=job_posting.title,
                        status=app.status,
                        applied_at=app.applied_at,
                        days_elapsed=days_since_applied,
                        severity="follow_up",
                        message=f"Bewerbung seit {days_since_applied} Tagen im Prozess. "
                        f"Nachfassen könnte sinnvoll sein.",
                    )
                    follow_up.append(problem)

            elif app.status == ApplicationStatus.INVITED:
                # INVITED bedeutet Interview/Test ist angeboten oder läuft
                # Das ist positiv - einfach auflisten (Info-Level)
                problem = ApplicationProblem(
                    application_id=app.id,
                    user_name=user.name,
                    user_email=user.email,
                    company_name=company.name,
                    job_title=job_posting.title,
                    status=app.status,
                    applied_at=app.applied_at,
                    days_elapsed=days_since_applied,
                    severity="info",
                    message="Interview/Test lädt vor. Dran bleiben!",
                )
                invited.append(problem)

        return {
            "critical": critical,
            "follow_up": follow_up,
            "invited": invited,
        }

    finally:
        if close_session:
            db.close()


def check_applications_summary() -> dict:
    """
    Vereinfachte Version die nur die Counts zurückgibt (für Status-Checks).

    Beispiel:
        {
            "total_active": 42,
            "critical_count": 3,
            "follow_up_count": 5,
            "invited_count": 8,
            "ok_count": 26
        }
    """
    problems = check_applications()

    db = SessionLocal()
    try:
        total_active = (
            db.query(Application)
            .filter(
                Application.status.in_(
                    [ApplicationStatus.OPEN, ApplicationStatus.IN_PROGRESS, ApplicationStatus.INVITED]
                )
            )
            .count()
        )

        return {
            "total_active": total_active,
            "critical_count": len(problems["critical"]),
            "follow_up_count": len(problems["follow_up"]),
            "invited_count": len(problems["invited"]),
            "ok_count": total_active
            - len(problems["critical"])
            - len(problems["follow_up"])
            - len(problems["invited"]),
        }
    finally:
        db.close()


if __name__ == "__main__":
    # Lokal testen
    print("🔍 Prüfe Bewerbungen...")
    problems = check_applications()

    print(f"\n🚨 KRITISCH ({len(problems['critical'])} Bewerbungen):")
    for p in problems["critical"]:
        print(f"  • {p.company_name} - {p.job_title}: {p.message}")

    print(f"\n⚠️  ZUM FOLGEN UP ({len(problems['follow_up'])} Bewerbungen):")
    for p in problems["follow_up"]:
        print(f"  • {p.company_name} - {p.job_title}: {p.message}")

    print(f"\n✅ AKTIVE INTERVIEWS ({len(problems['invited'])} Bewerbungen):")
    for p in problems["invited"]:
        print(f"  • {p.company_name} - {p.job_title}")

    print("\n📊 Summary:")
    summary = check_applications_summary()
    print(f"  Gesamt aktiv: {summary['total_active']}")
    print(f"  Kritisch: {summary['critical_count']}")
    print(f"  Zum Nachfassen: {summary['follow_up_count']}")
    print(f"  In Interviews: {summary['invited_count']}")
    print(f"  OK: {summary['ok_count']}")
