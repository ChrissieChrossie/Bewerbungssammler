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
  default     = "16.4"
}

variable "allowed_cidr_blocks" {
  description = "IP-Adressen (als CIDR, z.B. \"203.0.113.5/32\"), die auf die Datenbank zugreifen dürfen."
  type        = list(string)
}
