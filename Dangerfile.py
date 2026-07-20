import json
import os

from danger import danger, fail, message, warn

modified_files = danger.git.modified_files + danger.git.created_files
python_files = [f for f in modified_files if f.endswith(".py")]

if not danger.github.pr.body:
    warn("Bitte eine PR-Beschreibung hinzufügen.")

if len(modified_files) > 20:
    warn(f"Große PR: {len(modified_files)} geänderte Dateien. Erwäge kleinere PRs.")

report_path = "pylint-report.json"
if python_files and os.path.exists(report_path):
    with open(report_path) as f:
        content = f.read().strip()
    issues = json.loads(content) if content else []
    changed_issues = [i for i in issues if i["path"] in python_files]

    errors = [i for i in changed_issues if i["type"] in ("error", "fatal")]
    warnings = [i for i in changed_issues if i["type"] not in ("error", "fatal")]

    for issue in errors:
        fail(f"Pylint [{issue['symbol']}] {issue['path']}:{issue['line']} – {issue['message']}")

    for issue in warnings[:15]:
        warn(f"Pylint [{issue['symbol']}] {issue['path']}:{issue['line']} – {issue['message']}")

    if len(warnings) > 15:
        message(f"... und {len(warnings) - 15} weitere Pylint-Hinweise (siehe Actions-Log).")

    if not changed_issues:
        message("Pylint: keine Beanstandungen an den geänderten Python-Dateien.")
