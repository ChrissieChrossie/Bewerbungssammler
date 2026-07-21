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
