# Dieser Bootstrap-Ordner erstellt die Ressourcen, die der Haupt-Terraform-Ordner
# (terraform/) braucht, um selbst per Remote-State zu laufen (S3 + DynamoDB-Lock)
# sowie die IAM-Rolle, die GitHub Actions per OIDC übernimmt.
#
# Muss EINMALIG lokal ausgeführt werden (nicht über GitHub Actions, da hierfür
# noch keine Rolle existiert – Henne-Ei-Problem). Nutzt bewusst lokalen State.

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}
