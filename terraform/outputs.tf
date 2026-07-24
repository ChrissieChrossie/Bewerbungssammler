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
