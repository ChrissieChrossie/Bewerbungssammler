# GitHub-Actions-OIDC-Provider in IAM, damit GitHub Actions ohne langlebige
# AWS-Zugangsschlüssel eine IAM-Rolle übernehmen kann.
resource "aws_iam_openid_connect_provider" "github" {
  count = var.create_oidc_provider ? 1 : 0

  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]
  thumbprint_list = [
    "6938fd4d98bab03faadb97b34396831e3780aea1",
    "1c58a3a8518e8759bf075b76b750d4f2df264fcd",
  ]
}

data "aws_iam_openid_connect_provider" "existing" {
  count = var.create_oidc_provider ? 0 : 1
  url   = "https://token.actions.githubusercontent.com"
}

locals {
  oidc_provider_arn = var.create_oidc_provider ? aws_iam_openid_connect_provider.github[0].arn : data.aws_iam_openid_connect_provider.existing[0].arn
}

# Rolle, die GitHub Actions per OIDC übernimmt. Eingeschränkt auf dieses Repo.
resource "aws_iam_role" "github_actions" {
  name = "${var.project_name}-github-actions"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Federated = local.oidc_provider_arn }
        Action    = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
          }
          StringLike = {
            "token.actions.githubusercontent.com:sub" = "repo:${var.github_org}@${var.github_org_id}/${var.github_repo}@${var.github_repo_id}:*"
          }
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "github_actions" {
  name = "${var.project_name}-github-actions-policy"
  role = aws_iam_role.github_actions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "TerraformStateBucket"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.tf_state.arn}/*"
      },
      {
        Sid      = "TerraformStateBucketList"
        Effect   = "Allow"
        Action   = ["s3:ListBucket", "s3:ListBucketVersions"]
        Resource = aws_s3_bucket.tf_state.arn
      },
      {
        Sid      = "TerraformStateLock"
        Effect   = "Allow"
        Action   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:DeleteItem"]
        Resource = aws_dynamodb_table.tf_lock.arn
      },
      {
        # Nur für den "destroy-all"-Nuke-Job in terraform-manual.yml: räumt die
        # Bootstrap-Ressourcen (State-Bucket, Lock-Table, sich selbst, OIDC-Provider)
        # per rohem AWS-CLI ab, da deren Terraform-State bewusst nur lokal existiert.
        Sid    = "NukeBootstrap"
        Effect = "Allow"
        Action = [
          "s3:GetObjectVersion",
          "s3:DeleteObjectVersion",
          "s3:DeleteBucket",
        ]
        Resource = [
          aws_s3_bucket.tf_state.arn,
          "${aws_s3_bucket.tf_state.arn}/*",
        ]
      },
      {
        Sid      = "NukeBootstrapLockTable"
        Effect   = "Allow"
        Action   = ["dynamodb:DescribeTable", "dynamodb:DeleteTable"]
        Resource = aws_dynamodb_table.tf_lock.arn
      },
      {
        Sid      = "NukeBootstrapRole"
        Effect   = "Allow"
        Action   = ["iam:DeleteRolePolicy", "iam:DeleteRole"]
        Resource = aws_iam_role.github_actions.arn
      },
      {
        Sid      = "NukeBootstrapOidcProvider"
        Effect   = "Allow"
        Action   = ["iam:DeleteOpenIDConnectProvider"]
        Resource = local.oidc_provider_arn
      },
      {
        Sid    = "RdsManagement"
        Effect = "Allow"
        Action = [
          "rds:CreateDBInstance",
          "rds:DeleteDBInstance",
          "rds:ModifyDBInstance",
          "rds:DescribeDBInstances",
          "rds:AddTagsToResource",
          "rds:RemoveTagsFromResource",
          "rds:ListTagsForResource",
          "rds:CreateDBSubnetGroup",
          "rds:DeleteDBSubnetGroup",
          "rds:ModifyDBSubnetGroup",
          "rds:DescribeDBSubnetGroups",
        ]
        Resource = "*"
      },
      {
        Sid    = "Ec2NetworkingForRds"
        Effect = "Allow"
        Action = [
          "ec2:DescribeVpcs",
          "ec2:DescribeVpcAttribute",
          "ec2:DescribeSubnets",
          "ec2:DescribeSecurityGroups",
          "ec2:DescribeSecurityGroupRules",
          "ec2:CreateSecurityGroup",
          "ec2:DeleteSecurityGroup",
          "ec2:AuthorizeSecurityGroupIngress",
          "ec2:AuthorizeSecurityGroupEgress",
          "ec2:RevokeSecurityGroupIngress",
          "ec2:RevokeSecurityGroupEgress",
          "ec2:CreateTags",
          "ec2:DescribeTags",
        ]
        Resource = "*"
      },
      {
        Sid    = "EcrManagement"
        Effect = "Allow"
        Action = [
          "ecr:CreateRepository",
          "ecr:DeleteRepository",
          "ecr:DescribeRepositories",
          "ecr:PutLifecyclePolicy",
          "ecr:GetLifecyclePolicy",
          "ecr:SetRepositoryPolicy",
          "ecr:TagResource",
          "ecr:ListTagsForResource",
        ]
        Resource = "*"
      },
      {
        Sid    = "EcrPushPull"
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
          "ecr:BatchGetImage",
        ]
        Resource = "*"
      },
      {
        Sid    = "AppRunnerManagement"
        Effect = "Allow"
        Action = [
          "apprunner:CreateService",
          "apprunner:DeleteService",
          "apprunner:UpdateService",
          "apprunner:DescribeService",
          "apprunner:ListServices",
          "apprunner:StartDeployment",
          "apprunner:TagResource",
          "apprunner:UntagResource",
          "apprunner:ListTagsForResource",
          "apprunner:CreateVpcConnector",
          "apprunner:DeleteVpcConnector",
          "apprunner:DescribeVpcConnector",
          "apprunner:ListVpcConnectors",
        ]
        Resource = "*"
      },
      {
        # Eng gescopt auf die App-Runner-Rolle(n) dieses Projekts - niemals "*", damit
        # GitHub Actions nicht beliebige IAM-Rollen an beliebige Services übergeben kann.
        Sid    = "IamForAppRunnerRole"
        Effect = "Allow"
        Action = [
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:TagRole",
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:PassRole",
        ]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-apprunner-*"
      },
      {
        # Falls App Runner beim ersten Einsatz im Account noch keine Service-Linked-Role hat.
        Sid      = "AppRunnerServiceLinkedRole"
        Effect   = "Allow"
        Action   = ["iam:CreateServiceLinkedRole"]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/aws-service-role/apprunner.amazonaws.com/*"
        Condition = {
          StringEquals = {
            "iam:AWSServiceName" = "apprunner.amazonaws.com"
          }
        }
      },
      {
        Sid    = "S3FrontendBucketManagement"
        Effect = "Allow"
        Action = [
          "s3:CreateBucket",
          "s3:PutBucketPolicy",
          "s3:DeleteBucketPolicy",
          "s3:GetBucketPolicy",
          "s3:PutBucketPublicAccessBlock",
          "s3:PutBucketOwnershipControls",
          "s3:PutBucketVersioning",
          "s3:PutBucketTagging",
        ]
        Resource = "arn:aws:s3:::${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}"
      },
      {
        Sid    = "S3FrontendObjectSync"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = [
          "arn:aws:s3:::${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}",
          "arn:aws:s3:::${var.project_name}-frontend-${data.aws_caller_identity.current.account_id}/*",
        ]
      },
      {
        Sid    = "CloudFrontManagement"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateDistribution",
          "cloudfront:GetDistribution",
          "cloudfront:UpdateDistribution",
          "cloudfront:DeleteDistribution",
          "cloudfront:CreateOriginAccessControl",
          "cloudfront:GetOriginAccessControl",
          "cloudfront:DeleteOriginAccessControl",
          "cloudfront:TagResource",
          "cloudfront:ListTagsForResource",
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
        ]
        Resource = "*"
      },
      {
        # Eng gescopt auf die Lambda-Rolle der Automation - analog zu IamForAppRunnerRole.
        Sid    = "IamForAutomationLambdaRole"
        Effect = "Allow"
        Action = [
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:GetRolePolicy",
          "iam:PassRole",
        ]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.project_name}-automation-lambda-role"
      },
      {
        Sid    = "CloudWatchLogsForAutomationLambda"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:PutRetentionPolicy",
          "logs:TagResource",
          "logs:UntagResource",
          "logs:ListTagsForResource",
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.project_name}-automation*"
      },
      {
        # DescribeLogGroups unterstuetzt kein Resource-Scoping, daher separates Statement mit "*".
        Sid      = "CloudWatchLogsDescribe"
        Effect   = "Allow"
        Action   = ["logs:DescribeLogGroups"]
        Resource = "*"
      },
      {
        Sid    = "LambdaManagement"
        Effect = "Allow"
        Action = [
          "lambda:CreateFunction",
          "lambda:DeleteFunction",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:TagResource",
          "lambda:UntagResource",
          "lambda:ListTags",
          "lambda:AddPermission",
          "lambda:RemovePermission",
          "lambda:GetPolicy",
        ]
        Resource = "arn:aws:lambda:${var.aws_region}:${data.aws_caller_identity.current.account_id}:function:${var.project_name}-automation"
      },
      {
        Sid    = "EventBridgeManagement"
        Effect = "Allow"
        Action = [
          "events:PutRule",
          "events:DeleteRule",
          "events:DescribeRule",
          "events:PutTargets",
          "events:RemoveTargets",
          "events:ListTargetsByRule",
          "events:ListTagsForResource",
          "events:TagResource",
          "events:UntagResource",
          "events:EnableRule",
          "events:DisableRule",
        ]
        Resource = "arn:aws:events:${var.aws_region}:${data.aws_caller_identity.current.account_id}:rule/${var.project_name}-daily-automation"
      },
      {
        # SES-Identity-ARNs sind nicht sinnvoll vorhersagbar vor dem Apply (E-Mail als ARN-Teil),
        # deshalb wie schon in lambda.tf's eigener Policy Resource "*" statt Scoping.
        Sid    = "SesEmailIdentityManagement"
        Effect = "Allow"
        Action = [
          "ses:VerifyEmailIdentity",
          "ses:DeleteIdentity",
          "ses:GetIdentityVerificationAttributes",
        ]
        Resource = "*"
      }
    ]
  })
}
