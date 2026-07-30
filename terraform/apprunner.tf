# Security-Group für den App-Runner-VPC-Connector. Egress offen (keine öffentliche IP auf
# den Connector-ENIs, daher unkritisch), damit der Connector die RDS-Instanz erreichen kann.
resource "aws_security_group" "apprunner_connector" {
  name        = "${var.project_name}-apprunner-connector-sg"
  description = "Egress der App-Runner-VPC-Connector-ENIs (u.a. Zugriff auf RDS)."
  vpc_id      = data.aws_vpc.default.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# Erlaubt App Runner, sich in die Default-VPC zu hängen (nötig, um RDS zu erreichen, das
# nicht öffentlich ohne Whitelist ansprechbar sein soll).
resource "aws_apprunner_vpc_connector" "this" {
  vpc_connector_name = "${var.project_name}-connector"
  subnets            = data.aws_subnets.default.ids
  security_groups    = [aws_security_group.apprunner_connector.id]
}

# Rolle, die App Runner beim Image-Pull aus ECR annimmt.
resource "aws_iam_role" "apprunner_ecr_access" {
  name = "${var.project_name}-apprunner-ecr-access"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = { Service = "build.apprunner.amazonaws.com" }
        Action    = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr_access" {
  role       = aws_iam_role.apprunner_ecr_access.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

# Der eigentliche Backend-Service. Erwartet, dass unter "${ecr_repository_url}:latest"
# bereits ein Image liegt (siehe terraform/README.md, Abschnitt "Erstmaliges Deployment").
resource "aws_apprunner_service" "backend" {
  service_name = "${var.project_name}-backend"

  source_configuration {
    auto_deployments_enabled = false

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr_access.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.backend.repository_url}:latest"
      image_repository_type = "ECR"

      image_configuration {
        port = "8000"
        runtime_environment_variables = {
          DATABASE_URL = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.this.address}:5432/${var.db_name}"
        }
      }
    }
  }

  instance_configuration {
    cpu    = var.apprunner_cpu
    memory = var.apprunner_memory
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.this.arn
    }
    ingress_configuration {
      is_publicly_accessible = true
    }
  }

  health_check_configuration {
    protocol = "HTTP"
    path     = "/"
  }
}
