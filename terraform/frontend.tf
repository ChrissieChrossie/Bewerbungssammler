data "aws_caller_identity" "current" {}

# S3-Bucket für den statischen Vite-Build (frontend/dist). Kein direkter öffentlicher
# Zugriff - nur CloudFront darf lesen (siehe cloudfront.tf, aws_s3_bucket_policy.frontend).
resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Deaktiviert ACLs, damit der Zugriff ausschließlich über die Bucket-Policy (CloudFront OAC)
# geregelt wird.
resource "aws_s3_bucket_ownership_controls" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Sicherheitsnetz gegen ein fehlerhaftes "aws s3 sync --delete" im Deploy-Workflow.
resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}
