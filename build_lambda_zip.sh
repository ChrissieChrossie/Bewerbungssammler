#!/bin/bash
# Build-Script für Lambda Zip-Archiv
# Packt alle notwendigen Python-Dateien + Dependencies

set -e

OUTPUT_PATH="${1:-./terraform/automation_lambda.zip}"
BACKEND_PATH="./Backend"
TEMP_DIR=$(mktemp -d)

echo "📦 Baue Lambda Zip-Archiv..."

cleanup() {
    echo "  • Räume Temp-Verzeichnis auf..."
    rm -rf "$TEMP_DIR"
}

trap cleanup EXIT

# 1. Temp-Verzeichnis vorbereiten
echo "  • Erstelle Temp-Verzeichnis: $TEMP_DIR"

# 2. Python-Module kopieren
echo "  • Kopiere automation Module..."
cp -r "$BACKEND_PATH/automation" "$TEMP_DIR/"
cp -r "$BACKEND_PATH/models" "$TEMP_DIR/"
cp "$BACKEND_PATH/database.py" "$TEMP_DIR/"

# 3. Lambda Handler als Einstiegspunkt
echo "  • Erstelle lambda_handler Wrapper..."
cat > "$TEMP_DIR/lambda_handler.py" << 'EOF'
# Lambda Entry-Point
import sys
import os

# Importiere automation module
from automation.lambda_handler import lambda_handler

__all__ = ['lambda_handler']
EOF

# 4. Requirements installieren
echo "  • Installiere Python Dependencies..."

cat > "$TEMP_DIR/requirements.txt" << 'EOF'
boto3==1.35.0
psycopg2-binary==2.9.9
sqlalchemy==2.0.35
pydantic==2.9.2
pydantic-settings==2.5.2
python-dotenv==1.0.1
EOF

pip install -q -r "$TEMP_DIR/requirements.txt" -t "$TEMP_DIR" 2>&1 | grep -v "already satisfied" || true

# 5. Zip-Archiv erstellen
echo "  • Erstelle Zip-Archiv: $OUTPUT_PATH"

# Alte Zip löschen
rm -f "$OUTPUT_PATH"

# Zip erstellen
cd "$TEMP_DIR"
zip -q -r "../$OUTPUT_PATH" .
cd - > /dev/null

ZIP_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
echo "✅ Zip-Archiv erfolgreich erstellt!"
echo "   Pfad: $OUTPUT_PATH"
echo "   Größe: $ZIP_SIZE"
echo ""
echo "📋 Inhalt (erste 30 Dateien):"
unzip -l "$OUTPUT_PATH" | head -35

echo ""
echo "🚀 Nächste Schritte:"
echo "   1. cd terraform"
echo "   2. terraform plan"
echo "   3. terraform apply"
echo "   4. CloudWatch Logs prüfen:"
echo "      aws logs tail /aws/lambda/bewerbungssammler-automation --follow"
