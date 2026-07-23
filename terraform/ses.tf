# AWS SES (Simple Email Service): Konfiguriert Email-Versand für die Automation.
#
# Im MVP: Test-/Sandbox-Modus (nur verifizierte Adressen können Emails empfangen)
# Später: Aus Sandbox "graduieren" für unbegrenzten Versand

# ============================================================================
# SES EMAIL IDENTITY: Verifiziere die Sender-Email
# ============================================================================

resource "aws_ses_email_identity" "automation_sender" {
  email = var.automation_sender_email

  tags = {
    Name    = "${var.project_name}-automation-sender"
    Purpose = "Sender Email für Automatisierung"
  }
}

# ============================================================================
# SES EMAIL IDENTITY: Verifiziere die Recipient-Email (für Sandbox)
# ============================================================================
# Im Sandbox-Modus muss auch der Empfänger verifiziert sein.
# Später (nach Sandbox-Exit) nicht mehr nötig.

resource "aws_ses_email_identity" "automation_recipient" {
  email = var.automation_recipient_email

  tags = {
    Name    = "${var.project_name}-automation-recipient"
    Purpose = "Recipient Email (für Sandbox-Modus)"
  }
}

# ============================================================================
# SES CONFIGURATION SET: Für erweiterte Email-Tracking (optional)
# ============================================================================
# Optional: Ermöglicht Bounce/Complaint Tracking
# Kann später hinzugefügt werden wenn nötig

# resource "aws_ses_configuration_set" "automation" {
#   name = "${var.project_name}-automation-config-set"
# }

# ============================================================================
# SES IDENTITY POLICY: Lambda darf von Sender versenden
# ============================================================================
# Nicht zwingend nötig, da Lambda die SendEmail-Permission hat.
# Kann aber für explizite Kontrolle hinzugefügt werden.

# resource "aws_ses_identity_policy" "automation" {
#   identity = aws_ses_email_identity.automation_sender.arn
#   name     = "${var.project_name}-automation-ses-policy"
#   policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [
#       {
#         Effect = "Allow"
#         Principal = {
#           AWS = aws_iam_role.automation_lambda.arn
#         }
#         Action   = ["ses:SendEmail", "ses:SendRawEmail"]
#         Resource = aws_ses_email_identity.automation_sender.arn
#       }
#     ]
#   })
# }

# ============================================================================
# NOTES
# ============================================================================
#
# SANDBOX-MODUS:
#   - Emails können nur an verifizierte Adressen versendet werden
#   - Nützlich für Tests, kostenlos
#   - Sender UND Recipient müssen in terraform verifiziert werden
#   - Verification-Links werden per Email versendet (in AWS Console auf Links klicken)
#
# PRODUCTION-MODUS (nach Sandbox-Exit):
#   - Emails können an beliebige Adressen versendet werden
#   - AWS-Review notwendig (ca. 1-24h)
#   - Antrag in AWS SES Console stellen
#   - Erfordert Domain-Verification via DKIM/SPF
#
# EMPFEHLUNG FÜR MVP:
#   1. Lokal testen (Mock-Mode in checker.py + notifications.py)
#   2. In AWS deployen mit Sandbox (verifizierte Emails)
#   3. Nach MVP: Domain verifizieren + Sandbox-Exit antragen
