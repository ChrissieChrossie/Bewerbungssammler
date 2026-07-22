output "tf_state_bucket" {
  description = "Name des S3-Buckets für den Terraform-Remote-State."
  value       = aws_s3_bucket.tf_state.bucket
}

output "tf_lock_table" {
  description = "Name der DynamoDB-Tabelle für das State-Locking."
  value       = aws_dynamodb_table.tf_lock.name
}

output "github_actions_role_arn" {
  description = "ARN der IAM-Rolle, die GitHub Actions per OIDC übernimmt (als Repo-Variable AWS_ROLE_ARN eintragen)."
  value       = aws_iam_role.github_actions.arn
}
