# Die eigentlichen Tabellen (users, companies, job_postings, applications) werden NICHT
# hier von Terraform angelegt, sondern automatisch von der FastAPI-App beim Start via
# SQLAlchemy (Base.metadata.create_all, siehe Backend/main.py), sobald sie sich mit
# dieser Datenbank verbindet.
resource "aws_db_instance" "this" {
  identifier     = "${var.project_name}-db"
  engine         = "postgres"
  engine_version = var.db_engine_version

  instance_class    = var.db_instance_class
  allocated_storage = var.db_allocated_storage
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  port     = 5432

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = true

  skip_final_snapshot = true
  multi_az            = false

  backup_retention_period = 1
  deletion_protection     = false
}
