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

variable "github_org_id" {
  description = "Numerische GitHub-Owner-ID (aus dem OIDC-Sub-Claim, z.B. via Debug-Step ermittelt). Nötig, weil GitHub das 'immutable' Subject-Format mit @<id> nutzt."
  type        = string
  default     = "5886958"
}

variable "github_repo_id" {
  description = "Numerische GitHub-Repository-ID (aus dem OIDC-Sub-Claim)."
  type        = string
  default     = "1306443518"
}

variable "create_oidc_provider" {
  description = "Ob der GitHub-OIDC-Provider in IAM neu angelegt werden soll. Auf false setzen, falls im AWS-Account schon einer für token.actions.githubusercontent.com existiert."
  type        = bool
  default     = true
}
