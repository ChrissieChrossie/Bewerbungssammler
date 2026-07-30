# Lambda-Funktion für die tägliche Automation
#
# Führt täglich (via EventBridge) folgende Schritte durch:
#   1. Lädt alle Bewerbungen aus RDS
#   2. Prüft auf Probleme (zu lange ohne Antwort, etc.)
#   3. Versendet Email-Zusammenfassung via SES
#
# IAM: Lambda darf auf RDS + SES + Logs zugreifen

# ============================================================================
# IAM ROLE für Lambda
# ============================================================================

resource "aws_iam_role" "automation_lambda" {
  name               = "${var.project_name}-automation-lambda-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })

  tags = {
    Name    = "${var.project_name}-automation-lambda-role"
    Purpose = "Lambda Automation für Bewerbungssammler"
  }
}

# ============================================================================
# IAM POLICY: Was darf die Lambda?
# ============================================================================

resource "aws_iam_role_policy" "automation_lambda" {
  name = "${var.project_name}-automation-lambda-policy"
  role = aws_iam_role.automation_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      # CloudWatch Logs: Lambda darf Logs schreiben
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/*"
      },

      # SES: Lambda darf Emails versenden
      {
        Effect = "Allow"
        Action = [
          "ses:SendEmail",
          "ses:SendRawEmail"
        ]
        Resource = "*"
      },

      # VPC ENI Management: Lambda braucht das für RDS-Zugriff
      {
        Effect = "Allow"
        Action = [
          "ec2:CreateNetworkInterface",
          "ec2:DescribeNetworkInterfaces",
          "ec2:DeleteNetworkInterface",
          "ec2:AssignPrivateIpAddresses",
          "ec2:UnassignPrivateIpAddresses"
        ]
        Resource = "*"
      }
    ]
  })
}

# ============================================================================
# LAMBDA FUNCTION: Python-Code für Automation
# ============================================================================

resource "aws_lambda_function" "automation" {
  filename         = "automation_lambda.zip"
  function_name    = "${var.project_name}-automation"
  role             = aws_iam_role.automation_lambda.arn
  handler          = "lambda_handler.lambda_handler"
  source_code_hash = filebase64sha256("automation_lambda.zip")
  runtime          = "python3.12"
  timeout          = 60
  memory_size      = 256

  # VPC-Zugriff: Lambda braucht das um auf RDS zuzugreifen
  vpc_config {
    subnet_ids         = data.aws_subnets.default.ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  # Environment-Variablen
  environment {
    variables = {
      DATABASE_URL                  = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:5432/${var.db_name}"
      AUTOMATION_SENDER_EMAIL       = var.automation_sender_email
      AUTOMATION_RECIPIENT_EMAIL    = var.automation_recipient_email
      AUTOMATION_DAYS_OPEN_CRITICAL = var.automation_days_open_critical
      AUTOMATION_DAYS_IN_PROGRESS   = var.automation_days_in_progress_warning
    }
  }

  logging_config {
    log_group  = aws_cloudwatch_log_group.automation_lambda.name
    log_format = "JSON"
  }

  depends_on = [
    aws_iam_role_policy.automation_lambda,
    aws_cloudwatch_log_group.automation_lambda
  ]

  tags = {
    Name    = "${var.project_name}-automation"
    Purpose = "Tägliche Bewerbungsprüfung und Email-Versand"
  }
}

# ============================================================================
# LAMBDA PERMISSION: EventBridge darf Lambda triggern
# ============================================================================

resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.automation.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.daily_automation.arn
}

# ============================================================================
# CLOUDWATCH LOG GROUP: Logging für Lambda
# ============================================================================

resource "aws_cloudwatch_log_group" "automation_lambda" {
  name = "/aws/lambda/${var.project_name}-automation"
}

# ============================================================================
# SECURITY GROUP: Erlaubt Lambda den Ausgehenden-Traffic (für RDS + SES)
# ============================================================================

resource "aws_security_group" "lambda" {
  name        = "${var.project_name}-lambda-sg"
  description = "Erlaubt Lambda Zugriff auf RDS PostgreSQL und SES"
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "${var.project_name}-lambda-sg"
    Purpose = "Lambda Automation Security Group"
  }
}
