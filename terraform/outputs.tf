output "db_endpoint" {
  description = "Host:Port der RDS-Instanz."
  value       = aws_db_instance.this.endpoint
}

output "db_address" {
  description = "Hostname der RDS-Instanz (ohne Port)."
  value       = aws_db_instance.this.address
}

output "database_url" {
  description = "Fertige DATABASE_URL zum Eintragen in Backend/.env."
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:5432/${var.db_name}"
  sensitive   = true
}

output "ecr_repository_url" {
  description = "URL des ECR-Repos für das Backend-Image (für 'docker push')."
  value       = aws_ecr_repository.backend.repository_url
}

output "apprunner_service_arn" {
  description = "ARN des App-Runner-Services (für 'aws apprunner start-deployment' in CI)."
  value       = aws_apprunner_service.backend.arn
}

output "apprunner_service_url" {
  description = "Direkte App-Runner-URL des Backends (ohne CloudFront davor)."
  value       = aws_apprunner_service.backend.service_url
}

output "frontend_bucket_name" {
  description = "Name des S3-Buckets für den Frontend-Build (Ziel für 'aws s3 sync')."
  value       = aws_s3_bucket.frontend.id
}

output "cloudfront_distribution_id" {
  description = "ID der CloudFront-Distribution (für Cache-Invalidierung in CI)."
  value       = aws_cloudfront_distribution.this.id
}

output "cloudfront_domain_name" {
  description = "Die öffentliche URL der Seite."
  value       = "https://${aws_cloudfront_distribution.this.domain_name}"
}

# ============================================================================
# AUTOMATION OUTPUTS
# ============================================================================

output "lambda_function_name" {
  description = "Name der Lambda-Funktion für die Automation"
  value       = aws_lambda_function.automation.function_name
}

output "lambda_function_arn" {
  description = "ARN der Lambda-Funktion"
  value       = aws_lambda_function.automation.arn
}

output "lambda_log_group" {
  description = "CloudWatch Log Group für Lambda Logs"
  value       = aws_cloudwatch_log_group.automation_lambda.name
}

output "eventbridge_rule_name" {
  description = "Name der EventBridge Rule (täglich Trigger)"
  value       = aws_cloudwatch_event_rule.daily_automation.name
}

output "eventbridge_rule_schedule" {
  description = "Schedule Expression der EventBridge Rule (Cron-Format)"
  value       = aws_cloudwatch_event_rule.daily_automation.schedule_expression
}

output "ses_sender_email" {
  description = "Verifizierte Sender-Email in SES"
  value       = aws_ses_email_identity.automation_sender.email
}

output "ses_recipient_email" {
  description = "Verifizierte Recipient-Email in SES (für Sandbox-Modus)"
  value       = aws_ses_email_identity.automation_recipient.email
}

output "automation_summary" {
  description = "Zusammenfassung der Automation-Konfiguration"
  value = {
    enabled            = var.automation_enabled
    schedule_hour_utc  = var.automation_schedule_hour
    days_open_critical = var.automation_days_open_critical
    days_in_progress   = var.automation_days_in_progress_warning
    sender_email       = aws_ses_email_identity.automation_sender.email
    recipient_email    = aws_ses_email_identity.automation_recipient.email
    lambda_log_group   = aws_cloudwatch_log_group.automation_lambda.name
  }
}
