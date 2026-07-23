# EventBridge (CloudWatch Events): Triggert täglich die Lambda-Automation.
#
# Führt die Lambda-Funktion nach einem Zeitplan aus (z.B. täglich um 8 Uhr UTC).

# ============================================================================
# EVENTBRIDGE RULE: Zeitplan für die Automation
# ============================================================================

resource "aws_cloudwatch_event_rule" "daily_automation" {
  name                = "${var.project_name}-daily-automation"
  description         = "Triggert täglich um ${var.automation_schedule_hour} Uhr UTC die Application-Prüfung"
  schedule_expression = "cron(0 ${var.automation_schedule_hour} * * ? *)"
  is_enabled          = var.automation_enabled

  tags = {
    Name    = "${var.project_name}-daily-automation-rule"
    Purpose = "Täglicher Trigger für Bewerbungsprüfung"
  }
}

# ============================================================================
# EVENTBRIDGE TARGET: Lambda aufrufen
# ============================================================================

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.daily_automation.name
  target_id = "AutomationLambda"
  arn       = aws_lambda_function.automation.arn

  # Optional: Input-Mapping (hier nicht nötig, da Lambda die Standard-EventBridge-Event verarbeitet)
  # input = jsonencode({
  #   "source": "automation"
  # })
}

# ============================================================================
# EVENTBRIDGE PERMISSION: Lambda darf durch EventBridge getriggert werden
# ============================================================================
# (Siehe auch: aws_lambda_permission in lambda.tf)
