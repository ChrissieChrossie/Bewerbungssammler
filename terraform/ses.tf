# AWS SES (Simple Email Service): Konfiguriert Email-Versand für die Automation.
#
# Im MVP: Sandbox-Modus (nur verifizierte Adressen können Emails empfangen).
# AWS schickt nach "terraform apply" einen Verifikations-Link an beide Adressen.
# Diese Links MÜSSEN angeklickt werden, bevor die Lambda Emails versenden kann.
#
# SANDBOX-MODUS:
#   - Sender UND Empfänger müssen verifiziert sein
#   - Nützlich für Tests, kostenlos
#   - Verification-Links per Email anklicken
#
# PRODUCTION-MODUS (nach Sandbox-Exit):
#   - Emails können an beliebige Adressen versendet werden
#   - AWS-Review notwendig (1-24h) - Antrag in SES Console stellen

resource "aws_ses_email_identity" "automation_sender" {
  email = var.automation_sender_email
}

# Im Sandbox-Modus muss auch der Empfänger verifiziert sein.
resource "aws_ses_email_identity" "automation_recipient" {
  email = var.automation_recipient_email
}
