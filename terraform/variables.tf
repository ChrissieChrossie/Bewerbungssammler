variable "aws_region" {
  description = "AWS-Region, in der die Datenbank erstellt wird."
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Name/Präfix, unter dem alle Ressourcen benannt werden."
  type        = string
  default     = "bewerbungssammler"
}

variable "db_name" {
  description = "Name der Postgres-Datenbank (muss mit dem Namen in DATABASE_URL übereinstimmen)."
  type        = string
  default     = "bewerbungssammler"
}

variable "db_username" {
  description = "Master-Username für die RDS-Instanz."
  type        = string
  default     = "bewerbungssammler_admin"
}

variable "db_password" {
  description = "Master-Passwort für die RDS-Instanz. In terraform.tfvars setzen, nicht einchecken."
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "RDS-Instanzklasse."
  type        = string
  default     = "db.t3.micro"
}

variable "db_allocated_storage" {
  description = "Speicherplatz in GB."
  type        = number
  default     = 20
}

variable "db_engine_version" {
  description = "PostgreSQL-Engine-Version."
  type        = string
  default     = "16.14"
}

variable "allowed_cidr_blocks" {
  description = "IP-Adressen (als CIDR, z.B. \"203.0.113.5/32\"), die auf die Datenbank zugreifen dürfen."
  type        = list(string)
}

# ============================================================================
# AUTOMATION VARIABLES (für Lambda + EventBridge + SES)
# ============================================================================

variable "automation_sender_email" {
  description = "Sender-Email für Automation-Reports (muss in SES verifiziert sein)"
  type        = string
  default     = "noreply@bewerbungssammler.local"
}

variable "automation_recipient_email" {
  description = "Empfänger-Email für Automation-Reports (im Sandbox-Modus muss auch diese verifiziert sein)"
  type        = string
}

variable "automation_schedule_hour" {
  description = "Stunde (UTC), um die die Automation täglich läuft (0-23, z.B. 8 für 8 Uhr)"
  type        = number
  default     = 8
  validation {
    condition     = var.automation_schedule_hour >= 0 && var.automation_schedule_hour <= 23
    error_message = "Stunde muss zwischen 0 und 23 liegen."
  }
}

variable "automation_enabled" {
  description = "Ist die Automation aktiviert? (true/false)"
  type        = bool
  default     = true
}

variable "automation_days_open_critical" {
  description = "Nach wie vielen Tagen ist Status OPEN kritisch? (keine Antwort)"
  type        = number
  default     = 7
}

variable "automation_days_in_progress_warning" {
  description = "Nach wie vielen Tagen ist Status IN_PROGRESS ein Warning? (Nachfassen nötig)"
  type        = number
  default     = 14
}
