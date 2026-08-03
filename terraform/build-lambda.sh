#!/bin/bash
# Bash Script: Baut das Lambda ZIP-Archiv
# Verwendung: bash build-lambda.sh
# Resultat: automation_lambda.zip (im aktuellen Verzeichnis)

set -e  # Exit bei jedem Fehler

PYTHON_VERSION="${1:-3.12}"
CLEANUP="${2:-true}"

echo "🔨 Baue Lambda ZIP-Archiv..."
echo "Python-Version: $PYTHON_VERSION"
echo ""

# ============================================================================
# SCHRITT 1: Zu Backend-Verzeichnis wechseln
# ============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="${SCRIPT_DIR}/../Backend"

if [ ! -d "$BACKEND_PATH" ]; then
    echo "❌ Backend-Verzeichnis nicht gefunden: $BACKEND_PATH"
    exit 1
fi

cd "$BACKEND_PATH"
echo "✅ Wechsel zu: $BACKEND_PATH"

# ============================================================================
# SCHRITT 2: Virtuelle Python-Umgebung erstellen
# ============================================================================
echo ""
echo "📦 Erstelle virtuelle Python-Umgebung..."

if [ -d "venv" ]; then
    echo "   ⓘ venv existiert bereits, überspringe Creation"
else
    python${PYTHON_VERSION} -m venv venv
    echo "✅ venv erstellt"
fi

# ============================================================================
# SCHRITT 3: Virtuelle Umgebung aktivieren & Requirements installieren
# ============================================================================
echo ""
echo "📥 Installiere Requirements..."

source venv/bin/activate

python -m pip install --upgrade pip --quiet
pip install -r requirements.txt --quiet

echo "✅ Requirements installiert"

# ============================================================================
# SCHRITT 4: Lambda Build-Verzeichnis vorbereiten
# ============================================================================
echo ""
echo "📂 Vorbereitung Lambda Build-Verzeichnis..."

LAMBDA_BUILD_DIR="${SCRIPT_DIR}/lambda_build"
TERRAFORM_DIR="${SCRIPT_DIR}"

# Altes Build-Verzeichnis löschen
if [ -d "$LAMBDA_BUILD_DIR" ]; then
    rm -rf "$LAMBDA_BUILD_DIR"
    echo "   🗑️  Altes Build-Verzeichnis gelöscht"
fi

mkdir -p "$LAMBDA_BUILD_DIR"
echo "✅ Build-Verzeichnis erstellt: $LAMBDA_BUILD_DIR"

# ============================================================================
# SCHRITT 5: Code kopieren
# ============================================================================
echo ""
echo "📋 Kopiere Python-Code..."

# Automation Module
cp -r automation "$LAMBDA_BUILD_DIR/"
echo "   ✓ automation/"

# Datenbank-Module
cp database.py "$LAMBDA_BUILD_DIR/"
echo "   ✓ database.py"

cp -r models "$LAMBDA_BUILD_DIR/"
echo "   ✓ models/"

echo "✅ Code kopiert"

# ============================================================================
# SCHRITT 6: Dependencies kopieren
# ============================================================================
echo ""
echo "📦 Kopiere Python Dependencies..."

# Site-packages Pfad finden
SITE_PACKAGES=$(python -c "import site; print(site.getsitepackages()[0])")
echo "   Site-packages: $SITE_PACKAGES"

if [ ! -d "$SITE_PACKAGES" ]; then
    echo "❌ Site-packages Verzeichnis nicht gefunden: $SITE_PACKAGES"
    exit 1
fi

# Dependencies kopieren
cp -r "$SITE_PACKAGES"/* "$LAMBDA_BUILD_DIR/" 2>/dev/null || true

echo "✅ Dependencies kopiert"

# ============================================================================
# SCHRITT 7: ZIP-Archiv erstellen
# ============================================================================
echo ""
echo "📦 Erstelle ZIP-Archiv..."

ZIP_PATH="${TERRAFORM_DIR}/automation_lambda.zip"

# Altes ZIP löschen
if [ -f "$ZIP_PATH" ]; then
    rm "$ZIP_PATH"
    echo "   🗑️  Altes ZIP gelöscht"
fi

cd "$LAMBDA_BUILD_DIR"
zip -r -q "$ZIP_PATH" .
cd - > /dev/null

# Größe anzeigen
ZIP_SIZE_MB=$(du -m "$ZIP_PATH" | cut -f1)
echo "✅ ZIP erstellt: $ZIP_PATH"
echo "   Größe: ${ZIP_SIZE_MB}MB"

# ============================================================================
# SCHRITT 8: Aufräumen
# ============================================================================
if [ "$CLEANUP" = "true" ]; then
    echo ""
    echo "🧹 Räume auf..."
    rm -rf "$LAMBDA_BUILD_DIR"
    echo "✅ Cleanup abgeschlossen"
else
    echo ""
    echo "ⓘ Build-Verzeichnis bleibt erhalten: $LAMBDA_BUILD_DIR"
fi

# ============================================================================
# SUCCESS
# ============================================================================
echo ""
echo "✨ Lambda ZIP erfolgreich gebaut!"
echo "Nächster Schritt: terraform apply"
