"""
Lambda Handler: Entry-Point für AWS Lambda + EventBridge Automation.

Diese Datei wird von AWS Lambda aufgerufen, wenn EventBridge (täglich um X Uhr) triggert.

Ablauf:
  1. EventBridge triggert diese Lambda
  2. check_applications() lädt alle Bewerbungen aus RDS
  3. Probleme werden identifiziert (zu lange ohne Antwort, etc.)
  4. Email wird generiert
  5. Email wird via SES versendet
  6. Lambda gibt Status zurück
"""

import json
import os
from datetime import datetime

# Import der Automation-Logik
from .checker import check_applications
from .notifications import EmailSender, EmailGenerator


def lambda_handler(event, context):
    """
    AWS Lambda Handler für tägliche Automatisierung.

    Args:
        event: Dict mit EventBridge-Daten (enthält meist nur Metadaten)
        context: Lambda Context Object (Runtime-Info)

    Returns:
        Dict mit statusCode, body und Details
    """
    print(f"🚀 Lambda-Automation gestartet um {datetime.utcnow().isoformat()}")
    print(f"Event: {json.dumps(event)}")

    try:
        # 1. Bewerbungen prüfen
        print("📍 Schritt 1: Prüfe Bewerbungen...")
        problems = check_applications()

        critical_count = len(problems.get("critical", []))
        follow_up_count = len(problems.get("follow_up", []))
        invited_count = len(problems.get("invited", []))

        print(
            f"✅ Prüfung abgeschlossen: "
            f"{critical_count} kritisch, "
            f"{follow_up_count} Follow-up, "
            f"{invited_count} Interviews"
        )

        # 2. Email generieren
        print("📍 Schritt 2: Generiere Email...")
        email_html = EmailGenerator.generate_daily_report(problems)
        print(f"✅ Email-Template generiert ({len(email_html)} Zeichen)")

        # 3. Email versenden
        print("📍 Schritt 3: Versende Email...")
        recipient_email = os.getenv("AUTOMATION_RECIPIENT_EMAIL", "admin@example.com")
        sender_email = os.getenv("AUTOMATION_SENDER_EMAIL", "noreply@bewerbungssammler.local")

        email_sender = EmailSender()
        success = email_sender.send_daily_report(
            problems=problems, recipient_email=recipient_email, sender_email=sender_email
        )

        if not success:
            print("⚠️  Email-Versand fehlgeschlagen, aber Prüfung war erfolgreich")

        # 4. Response zusammenstellen
        return {
            "statusCode": 200,
            "body": json.dumps(
                {
                    "message": "Automatisierung erfolgreich durchgeführt",
                    "timestamp": datetime.utcnow().isoformat(),
                    "problems": {
                        "critical": critical_count,
                        "follow_up": follow_up_count,
                        "invited": invited_count,
                    },
                    "email_sent": success,
                    "recipient": recipient_email,
                }
            ),
        }

    except Exception as e:
        print(f"❌ FEHLER: {type(e).__name__}: {str(e)}")
        import traceback

        traceback.print_exc()

        return {
            "statusCode": 500,
            "body": json.dumps(
                {
                    "error": str(e),
                    "type": type(e).__name__,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            ),
        }


# Für lokale Tests
if __name__ == "__main__":
    # Simuliere EventBridge Event
    mock_event = {
        "version": "0",
        "id": "12345",
        "detail-type": "Scheduled Event",
        "source": "aws.events",
        "account": "123456789",
        "time": "2026-07-22T08:00:00Z",
        "region": "eu-central-1",
        "resources": [],
        "detail": {},
    }

    class MockContext:
        """Mock Lambda Context für lokale Tests."""

        def __init__(self):
            self.function_name = "bewerbungssammler-automation"
            self.function_version = "$LATEST"
            self.invoked_function_arn = "arn:aws:lambda:eu-central-1:123456789:function:bewerbungssammler-automation"
            self.memory_limit_in_mb = 128
            self.aws_request_id = "local-test-123"
            self.log_group_name = "/aws/lambda/bewerbungssammler-automation"
            self.log_stream_name = "2026/07/22/[$LATEST]abcd1234"
            self.identity = None
            self.client_context = None

        def get_remaining_time_in_millis(self):
            return 300000

    print("🧪 Lokaler Test von Lambda Handler\n")
    result = lambda_handler(mock_event, MockContext())
    print(f"\n📤 Response:\n{json.dumps(json.loads(result['body']), indent=2)}")
