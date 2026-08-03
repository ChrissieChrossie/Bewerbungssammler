"""
Email-Notifications: Generiert Zusammenfassungen und versendet via AWS SES.

Verwendet boto3 zum Versenden via AWS Simple Email Service (SES).
"""

import os
from datetime import datetime
from typing import Dict, List
import boto3
from botocore.exceptions import ClientError

from .checker import ApplicationProblem


class EmailGenerator:
    """Erzeugt HTML-Email-Templates aus Prüfungsergebnissen."""

    @staticmethod
    def generate_daily_report(
        problems: Dict[str, List[ApplicationProblem]], generated_at: datetime | None = None
    ) -> str:
        """
        Erzeugt einen HTML-Email-Body aus Prüfungsergebnissen.

        Args:
            problems: Dict mit Keys "critical", "follow_up", "invited"
            generated_at: Zeitstempel (default: jetzt)

        Returns:
            HTML-String für die Email
        """
        if generated_at is None:
            generated_at = datetime.utcnow()

        critical = problems.get("critical", [])
        follow_up = problems.get("follow_up", [])
        invited = problems.get("invited", [])

        # HTML aufbauen
        html = f"""
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                h1 {{ color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }}
                .section {{ margin: 20px 0; }}
                .critical {{ border-left: 4px solid #d32f2f; padding-left: 15px; background: #ffebee; padding: 15px; }}
                .follow-up {{ border-left: 4px solid #f57c00; padding-left: 15px; background: #fff3e0; padding: 15px; }}
                .invited {{ border-left: 4px solid #388e3c; padding-left: 15px; background: #e8f5e9; padding: 15px; }}
                .ok {{ border-left: 4px solid #0066cc; padding-left: 15px; background: #e3f2fd; padding: 15px; }}
                .item {{ margin: 10px 0; padding: 10px; background: white; border-radius: 4px; }}
                .company-name {{ font-weight: bold; color: #0066cc; }}
                .job-title {{ font-style: italic; color: #666; }}
                .days {{ color: #d32f2f; font-weight: bold; }}
                .footer {{ margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📋 Bewerbungssammler - Tagesreport</h1>
                <p>Bericht vom <strong>{generated_at.strftime('%d.%m.%Y um %H:%M')} UTC</strong></p>

                <!-- KRITISCHE BEWERBUNGEN -->
                {EmailGenerator._render_section(
                    title="🚨 KRITISCH (Seit > 7 Tagen keine Antwort)",
                    problems=critical,
                    css_class="critical",
                    empty_message="Keine kritischen Bewerbungen - alles im grünen Bereich!"
                )}

                <!-- FOLGEN UP -->
                {EmailGenerator._render_section(
                    title="⚠️  ZUM FOLGEN UP (Seit > 14 Tagen im Prozess)",
                    problems=follow_up,
                    css_class="follow-up",
                    empty_message="Keine laufenden Prozesse, die zu lange dauern."
                )}

                <!-- LAUFENDE INTERVIEWS -->
                {EmailGenerator._render_section(
                    title="✅ LAUFENDE INTERVIEWS / TESTS",
                    problems=invited,
                    css_class="invited",
                    empty_message="Keine laufenden Interviews."
                )}

                <!-- SUMMARY -->
                <div class="section ok">
                    <h3>📊 Zusammenfassung</h3>
                    <ul>
                        <li>Kritische Bewerbungen: <strong>{len(critical)}</strong></li>
                        <li>Zum Nachfassen: <strong>{len(follow_up)}</strong></li>
                        <li>In Interviews: <strong>{len(invited)}</strong></li>
                    </ul>
                </div>

                <div class="footer">
                    <p>Dieser Report wurde automatisch generiert.
                    Bitte besuchen Sie Ihren Bewerbungssammler um mehr Details zu erfahren.</p>
                </div>
            </div>
        </body>
        </html>
        """
        return html

    @staticmethod
    def _render_section(
        title: str, problems: List[ApplicationProblem], css_class: str, empty_message: str
    ) -> str:
        """Rendert einen Abschnitt mit Bewerbungen."""
        if not problems:
            return f'<div class="section {css_class}"><h3>{title}</h3><p><em>{empty_message}</em></p></div>'

        items_html = ""
        for problem in problems:
            items_html += f"""
            <div class="item">
                <div class="company-name">{problem.company_name}</div>
                <div class="job-title">{problem.job_title}</div>
                <div>Bewerbung vom {problem.applied_at.strftime('%d.%m.%Y')}</div>
                <div>Status: <strong>{problem.status.value}</strong> |
                    <span class="days">{problem.days_elapsed} Tage</span></div>
                <div>{problem.message}</div>
            </div>
            """

        return f"""
        <div class="section {css_class}">
            <h3>{title}</h3>
            {items_html}
        </div>
        """


class EmailSender:
    """Versendet Emails via AWS SES."""

    def __init__(self, region: str = "eu-central-1"):
        """
        Initialisiert SES Client.

        Args:
            region: AWS Region (default: eu-central-1)
        """
        self.client = boto3.client("ses", region_name=region)
        self.region = region

    def send_daily_report(
        self,
        problems: Dict[str, List[ApplicationProblem]],
        recipient_email: str,
        sender_email: str | None = None,
    ) -> bool:
        """
        Versendet den täglichen Report per Email.

        Args:
            problems: Dict mit "critical", "follow_up", "invited"
            recipient_email: Empfänger-Email
            sender_email: Sender-Email (default: aus Umgebungsvariable AUTOMATION_SENDER_EMAIL)

        Returns:
            True wenn erfolgreich, False bei Fehler
        """
        if sender_email is None:
            sender_email = os.getenv("AUTOMATION_SENDER_EMAIL", "noreply@bewerbungssammler.local")

        html_body = EmailGenerator.generate_daily_report(problems)

        try:
            self.client.send_email(
                Source=sender_email,
                Destination={"ToAddresses": [recipient_email]},
                Message={
                    "Subject": {
                        "Data": "🎯 Bewerbungssammler - Tagesreport",
                        "Charset": "UTF-8",
                    },
                    "Body": {
                        "Html": {
                            "Data": html_body,
                            "Charset": "UTF-8",
                        },
                        "Text": {
                            "Data": EmailSender._html_to_text(html_body),
                            "Charset": "UTF-8",
                        },
                    },
                },
            )
            print(f"✅ Email erfolgreich versendet an {recipient_email}")
            return True

        except ClientError as e:
            error_code = e.response["Error"]["Code"]
            print(f"❌ Fehler beim Email-Versand ({error_code}): {e}")

            if error_code == "MessageRejected":
                print(f"   → Empfänger '{recipient_email}' nicht verifiziert.")
                print(f"   → In SES Console verifizieren oder aus Sandbox kommen.")
            elif error_code == "ConfigurationSetDoesNotExist":
                print(f"   → ConfigurationSet nicht gefunden.")
            elif error_code == "InvalidParameterValue":
                print(f"   → Email-Adresse ungültig.")

            return False

    @staticmethod
    def _html_to_text(html: str) -> str:
        """
        Einfache HTML→Text Konvertierung für Plain-Text-Fallback.
        (Produktiv würde man html2text oder ähnlich verwenden)
        """
        text = html
        # Entferne HTML-Tags
        import re

        text = re.sub(r"<[^>]+>", "\n", text)
        # Mehrfache Newlines auf eine reduzieren
        text = re.sub(r"\n\n+", "\n\n", text)
        return text.strip()


if __name__ == "__main__":
    # Test: HTML generieren (ohne zu versenden)
    from .checker import check_applications

    print("🔄 Generiere Test-Email...")
    problems = check_applications()
    html = EmailGenerator.generate_daily_report(problems)

    # Speichere zum Anschauen
    with open("/tmp/test_email.html", "w", encoding="utf-8") as f:
        f.write(html)

    print(f"✅ Email-Template gespeichert: /tmp/test_email.html")
    print(f"\n📊 Summary:")
    print(f"  - Kritisch: {len(problems['critical'])}")
    print(f"  - Zum Nachfassen: {len(problems['follow_up'])}")
    print(f"  - In Interviews: {len(problems['invited'])}")
