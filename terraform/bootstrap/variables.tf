variable "aws_region" {
  description = "AWS-Region für State-Bucket und Lock-Table."
  type        = string
  default     = "eu-central-1"
}

variable "project_name" {
  description = "Name/Präfix für die Bootstrap-Ressourcen."
  type        = string
  default     = "bewerbungssammler"
}

variable "github_org" {
  description = "GitHub-Organisation/-User des Repos."
  type        = string
  default     = "ChrissieChrossie"
}

variable "github_repo" {
  description = "Name des GitHub-Repos."
  type        = string
  default     = "Bewerbungssammler"
}

variable "create_oidc_provider" {
  description = "Ob der GitHub-OIDC-Provider in IAM neu angelegt werden soll. Auf false setzen, falls im AWS-Account schon einer für token.actions.githubusercontent.com existiert."
  type        = bool
  default     = true
}
