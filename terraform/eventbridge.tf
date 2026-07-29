# EventBridge (CloudWatch Events): Triggert täglich die Lambda-Automation.
#
# Führt die Lambda-Funktion nach einem Zeitplan aus (täglich um automation_schedule_hour Uhr UTC).

resource "aws_cloudwatch_event_rule" "daily_automation" {
  name                = "${var.project_name}-daily-automation"
  description         = "Triggert täglich um ${var.automation_schedule_hour} Uhr UTC die Application-Prüfung"
  schedule_expression = "cron(0 ${var.automation_schedule_hour} * * ? *)"
  state               = var.automation_enabled ? "ENABLED" : "DISABLED"

  tags = {
    Name    = "${var.project_name}-daily-automation-rule"
    Purpose = "Täglicher Trigger für Bewerbungsprüfung"
  }
}

resource "aws_cloudwatch_event_target" "lambda_target" {
  rule      = aws_cloudwatch_event_rule.daily_automation.name
  target_id = "AutomationLambda"
  arn       = aws_lambda_function.automation.arn
}
