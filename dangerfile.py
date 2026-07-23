"""Dangerfile: prüft PR-Beschreibung, PR-Größe und Pylint-Ergebnisse."""

import json
import os
import traceback

# danger, fail, warn und message werden von danger-python zur Laufzeit
# als Globals injiziert und müssen daher nicht importiert werden.
# pylint: disable=undefined-variable

try:
    modified_files = danger.git.modified_files + danger.git.created_files
    python_files = [f for f in modified_files if f.endswith(".py")]

    if not danger.github.pr.body:
        warn("Bitte eine PR-Beschreibung hinzufügen.")

    if len(modified_files) > 20:
        warn(f"Große PR: {len(modified_files)} geänderte Dateien. Erwäge kleinere PRs.")

    REPORT_PATH = "pylint-report.json"
    if not python_files:
        message("Keine Python-Dateien in diesem PR geändert – Pylint übersprungen.")
    elif not os.path.exists(REPORT_PATH):
        warn("Pylint-Report nicht gefunden – wurde der Pylint-Schritt übersprungen?")
    else:
        with open(REPORT_PATH, encoding="utf-8") as f:
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

except Exception as e:  # pylint: disable=broad-exception-caught
    # Absichtlich breit gefangen: jeder Fehler im Dangerfile soll als
    # PR-Kommentar sichtbar werden statt den CI-Job stumm abzubrechen.
    fail(f"Dangerfile-Fehler: {e}\n```\n{traceback.format_exc()}\n```")
