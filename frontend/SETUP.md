# 🚀 Frontend Setup Guide für Mitentwickler

**Willkommen!** Diese Anleitung hilft dir, das Frontend schnell zum Laufen zu bringen.

---

## ⚡ 5-Minuten Quick Start

### Schritt 1: Repository klonen (falls noch nicht geschehen)
```bash
git clone <repository-url>
cd Bewerbungssammler
```

### Schritt 2: Alles zusammen starten
```bash
docker compose up --build
```
→ Startet Datenbank, Backend (`http://localhost:8000`) und Frontend (`http://localhost:5173`) zusammen. Änderungen in `frontend/src` werden dank Volume-Mount + Hot Reload sofort übernommen, kein Neubau nötig.

### Schritt 3: Browser öffnen
```
http://localhost:5173
```

✅ **FERTIG!** Die App sollte jetzt laufen.

---

### Alternative: Nur das Frontend lokal (ohne Docker)

Falls das Backend schon anderweitig läuft und du nur am Frontend arbeiten willst:

```bash
cd frontend
npm install
npm run dev
```
→ Frontend läuft auf `http://localhost:5173`, proxyt `/api`-Requests standardmäßig an `http://localhost:8000`.

---

## 📁 Projektstruktur - Was gehört wo?

```
frontend/
├── src/
│   ├── pages/                    ← Ganze Seiten (Dashboard, etc.)
│   │   ├── Dashboard.jsx         # Startseite mit Stats
│   │   ├── ApplicationsPage.jsx  # Bewerbungen verwalten
│   │   ├── CompaniesPage.jsx     # Unternehmen verwalten
│   │   └── JobPostingsPage.jsx   # Stellenausschreibungen verwalten
│   │
│   ├── components/               ← Wiederverwendbare Komponenten
│   │   ├── Header.jsx            # Oben Header mit Logo
│   │   ├── Navigation.jsx        # Navigation Tabs
│   │   ├── Modal.jsx             # Popup-Fenster
│   │   ├── FormInput.jsx         # Input-Feld mit Label/Fehler
│   │   ├── FormSelect.jsx        # Dropdown-Feld
│   │   ├── StatusBadge.jsx       # Farbige Status-Anzeige
│   │   ├── LoadingSpinner.jsx    # Lade-Animation
│   │   ├── ErrorMessage.jsx      # Fehlerbox
│   │   └── SuccessMessage.jsx    # Erfolgsbox
│   │
│   ├── api/
│   │   └── client.js             # HTTP-Client (API-Calls)
│   │
│   ├── App.jsx                   # Root Component (Seiten-Routing)
│   ├── main.jsx                  # Einstiegspunkt
│   └── index.css                 # Globale Styles (Tailwind)
│
├── index.html                    # HTML Template
├── package.json                  # Dependencies & Scripts
├── vite.config.js                # Vite Konfiguration
├── tailwind.config.js            # Tailwind Konfiguration
└── postcss.config.js             # PostCSS Konfiguration
```

---

## 💻 Entwicklung

### Komponente bauen
Neue Seite hinzufügen? So geht's:

1. **Neue Datei erstellen**: `src/pages/MyNewPage.jsx`
2. **In `App.jsx` importieren** und zum Router hinzufügen
3. **Navigation updaten** (`src/components/Navigation.jsx`)

### Stilisierung mit Tailwind
```jsx
// ❌ NICHT: CSS-Dateien schreiben
// ✅ JA: Tailwind Classes nutzen

<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Speichern
</button>
```

**Tailwind Ressourcen:**
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Utility Classes](https://tailwindcss.com/docs/table-of-contents)

### API-Calls (Backend ansprechen)
```jsx
import { applicationApi, companyApi } from '../api/client'

// Alle Bewerbungen laden
const res = await applicationApi.getAll()
console.log(res.data)

// Neue Bewerbung erstellen
await applicationApi.create({
  company_id: 1,
  job_posting_id: 2,
  status: 'open',
  application_date: '2026-01-15',
  notes: 'Interessantes Unternehmen'
})

// Bewerbung aktualisieren
await applicationApi.update(id, { status: 'invited' })

// Bewerbung löschen
await applicationApi.delete(id)
```

Alle API-Funktionen findest du in `src/api/client.js`.

---

## 🎨 Styling Tipps

### Button Styles
```jsx
<button className="btn btn-primary">Speichern</button>
<button className="btn btn-secondary">Abbrechen</button>
<button className="btn btn-danger">Löschen</button>
<button className="btn btn-success">Bestätigen</button>
```

### Form Elemente
```jsx
<input className="input" placeholder="Text eingeben..." />
<select className="input">
  <option>Wähle...</option>
</select>
<textarea className="input min-h-24"></textarea>
```

### Card/Box
```jsx
<div className="card p-6">Inhalt</div>
<div className="card-lg">Größere Box mit Padding</div>
```

### Badges
```jsx
<span className="badge badge-blue">Blau</span>
<span className="badge badge-green">Grün</span>
<span className="badge badge-red">Rot</span>
<span className="badge badge-yellow">Gelb</span>
```

Alle Styles in `src/index.css` definiert.

---

## 🐛 Häufige Fehler & Lösungen

### ❌ "Cannot GET /api/..."
**Problem**: Backend läuft nicht
**Lösung**:
```bash
docker compose up --build
```

### ❌ "Module not found"
**Problem**: Dependencies nicht aktuell/installiert
**Lösung** (lokal ohne Docker):
```bash
rm -rf node_modules package-lock.json
npm install
```
**Lösung** (mit Docker, z.B. nach neuen Dependencies in `package.json`):
```bash
docker compose build --no-cache frontend
docker compose up
```

### ❌ Port 5173 ist schon in Benutzung
**Problem**: Frontend läuft schon in anderem Terminal
**Lösung**: Das alte Terminal schließen oder anderen Port nutzen:
```bash
npm run dev -- --port 5174
```

### ❌ Seite lädt nicht, zeigt nur "Cannot resolve"
**Problem**: Abhängigkeitsproblem
**Lösung**:
1. Browser Cache clearen (Ctrl+Shift+Delete)
2. Terminal stoppen (Ctrl+C)
3. `npm install` nochmal laufen
4. `npm run dev` starten

---

## 🔧 Nützliche Kommandos

```bash
# Frontend starten (Entwicklung)
npm run dev

# Für Production bauen
npm run build

# Gebäude Preview (wie Production)
npm run preview

# Code Quality Check
npm run lint
```

---

## 📝 Git Workflow für Zusammenarbeit

1. **Euer Feature Branch**:
```bash
git checkout -b feature/mein-feature
```

2. **Änderungen machen** + testen lokal

3. **Committen & pushen**:
```bash
git add .
git commit -m "Beschreibung der Änderungen"
git push origin feature/mein-feature
```

4. **Pull Request** im GitHub erstellen

5. **Code Review** von Partner
6. **Merge** nach Approval

---

## 🎯 Was solltest du wissen?

### Hot Module Reload (HMR)
- Wenn du Code änderst, lädt die Seite automatisch neu
- Du musst nicht manuell F5 drücken
- State kann verloren gehen (normal!)

### React DevTools
- Browser Extension: "React Developer Tools"
- Hilft beim Debuggen von Components & Props
- F12 → Components Tab

### Network Inspector
- F12 → Network Tab
- Zeigt alle API-Calls zum Backend
- Sehr hilfreich für Debugging

### Console Logs
- `console.log(daten)` schreibt in Browser Console (F12)
- Hilft beim Debuggen

---

## 💡 Tipps für neue Features

### Neue Tabelle/Liste bauen?
1. Schau dir `src/pages/ApplicationsPage.jsx` an
2. Das ist das Vorlage-Pattern für Listen
3. Copy-paste + anpassen

### Neues Formular bauen?
1. Nutze `FormInput` & `FormSelect` Komponenten
2. Schau auf `ApplicationsPage.jsx` für Beispiele
3. Validierung im `handleSubmit`

### Styling braucht?
1. Erst in `src/index.css` schauen ob es schon gibt
2. Wenn nicht: Custom CSS dort hinzufügen
3. Oder einfach Tailwind Classes direkt im JSX

---

## 📞 Support

Fragen? Fehler?

1. **Fehlertext googeln** - oft schon gelöst
2. **Browser Console checken** (F12) - oft aussagekräftige Fehler
3. **API Calls debuggen** (Network Tab in F12)
4. **Mit Entwickler absprechen** - vielleicht kennt er die Lösung

---

## ✅ Checkliste: Setup abgeschlossen?

- [ ] Repository geklont
- [ ] `npm install` ausgeführt
- [ ] Backend läuft auf `localhost:8000`
- [ ] Frontend läuft auf `localhost:5173`
- [ ] Dashboard wird angezeigt
- [ ] Buttons & Navigation funktionieren

**Wenn alles ✅ ist: Welcome to the team!** 🎉

---

## 📚 Weitere Ressourcen

- **React Basics**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Vite Guide**: https://vitejs.dev
- **Axios Docs**: https://axios-http.com

---

Viel Spaß beim Entwickeln! 🚀
