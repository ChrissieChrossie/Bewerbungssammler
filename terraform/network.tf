# Nutzt die Default-VPC des Accounts, damit kein eigenes Netzwerk aufgebaut werden muss.
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = data.aws_subnets.default.ids
}

resource "aws_security_group" "db" {
  name        = "${var.project_name}-db-sg"
  description = "Erlaubt Postgres-Zugriff (5432) von den freigegebenen IP-Adressen."
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "Postgres von erlaubten IPs"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = var.allowed_cidr_blocks
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
