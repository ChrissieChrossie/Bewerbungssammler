# Bewerbungssammler Frontend

Ein modernes React + Tailwind CSS Frontend für die Verwaltung von Bewerbungen, Unternehmen und Stellenausschreibungen.

## 🚀 Features

- **Dashboard**: Übersicht über alle Bewerbungen und Statistiken
- **Bewerbungen**: CRUD-Operationen für Bewerbungen mit Status-Tracking
- **Unternehmen**: Verwaltung von Unternehmen und Kontaktdaten
- **Stellenausschreibungen**: Verwaltung von Job-Postings
- **Responsive Design**: Funktioniert auf allen Geräten
- **Benutzerfreundlich**: Intuitive UI mit Modalen und Formularen

## 🛠️ Tech Stack

- **React 18**: UI Framework
- **Vite**: Blazing fast build tool und dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP Client für API-Calls
- **ESLint**: Code Quality

## 🎯 Quick Start

Frontend, Backend und Datenbank laufen zusammen über Docker Compose – ein Befehl im Projekt-Root reicht:

```bash
docker compose up --build
```

### Browser öffnen
```
http://localhost:5173
```

Änderungen an Dateien in `frontend/src` werden dank Volume-Mount + Hot Module Reload sofort im Container übernommen, ein Neubau ist dafür nicht nötig.

## 📦 Alternative: Frontend ohne Docker

Falls du nur am Frontend arbeitest und das Backend separat (z.B. via Docker) läuft:

```bash
cd frontend
npm install
npm run dev
```

Läuft dann ebenfalls auf `http://localhost:5173`, der Dev-Server proxyt `/api`-Requests standardmäßig an `http://localhost:8000`.

## 📁 Projektstruktur

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx          # Hauptseite mit Statistiken
│   │   ├── ApplicationsPage.jsx   # Bewerbungsverwaltung
│   │   ├── CompaniesPage.jsx      # Unternehmenverwaltung
│   │   └── JobPostingsPage.jsx    # Job-Verwaltung
│   ├── components/
│   │   ├── Header.jsx             # Navigation Header
│   │   ├── Navigation.jsx         # Navigation Tabs
│   │   ├── Modal.jsx              # Modal Dialog
│   │   ├── FormInput.jsx          # Text Input Komponente
│   │   ├── FormSelect.jsx         # Select Komponente
│   │   ├── StatusBadge.jsx        # Status Badge
│   │   ├── LoadingSpinner.jsx     # Loading State
│   │   ├── ErrorMessage.jsx       # Error Message
│   │   └── SuccessMessage.jsx     # Success Message
│   ├── api/
│   │   └── client.js              # Axios HTTP Client
│   ├── App.jsx                    # Root Component
│   ├── main.jsx                   # Entry Point
│   └── index.css                  # Global Tailwind CSS
├── index.html                     # HTML Entry Point
├── package.json                   # Dependencies
├── vite.config.js                 # Vite Config
├── tailwind.config.js             # Tailwind Config
└── postcss.config.js              # PostCSS Config
```

## 🎨 API Endpoints

Das Frontend erwartet folgende Backend-Endpoints:

```
GET    /api/applications           # Alle Bewerbungen
GET    /api/applications/{id}      # Einzelne Bewerbung
POST   /api/applications           # Neue Bewerbung
PUT    /api/applications/{id}      # Bewerbung aktualisieren
DELETE /api/applications/{id}      # Bewerbung löschen

GET    /api/companies              # Alle Unternehmen
GET    /api/companies/{id}         # Einzelnes Unternehmen
POST   /api/companies              # Neues Unternehmen
PUT    /api/companies/{id}         # Unternehmen aktualisieren
DELETE /api/companies/{id}         # Unternehmen löschen

GET    /api/job-postings           # Alle Job-Postings
GET    /api/job-postings/{id}      # Einzelnes Job-Posting
POST   /api/job-postings           # Neues Job-Posting
PUT    /api/job-postings/{id}      # Job-Posting aktualisieren
DELETE /api/job-postings/{id}      # Job-Posting löschen
```

## 💻 Entwicklung

### Hot Reload
Änderungen an Dateien werden sofort aktualisiert (kein Refresh nötig).

### ESLint
```bash
npm run lint
```

### Build für Produktion
```bash
npm run build
npm run preview
```

## 🎯 Nächste Schritte

- [ ] Login & User Management
- [ ] Search & Filter Verbesserungen
- [ ] Pagination für große Datenmengen
- [ ] Toast Notifications
- [ ] Dark Mode
- [ ] Export zu CSV/PDF
- [ ] Änderungsverlauf

## 🐛 Debugging

### Browser DevTools
- **F12**: Öffne Developer Tools
- **Console**: Schau auf Fehler
- **Network**: Inspiziere API Calls
- **React DevTools**: Browser Extension für React Debugging

### Vite DevTools
- Hot Module Reload Fehler sind normalerweise harmlos
- Browser Auto-Reload wenn das nicht funktioniert

## 📚 Ressourcen

- [React Dokumentation](https://react.dev)
- [Vite Dokumentation](https://vitejs.dev)
- [Tailwind CSS Dokumentation](https://tailwindcss.com)
- [Axios Dokumentation](https://axios-http.com)

## 📝 Lizenz

Dieses Projekt ist Teil des Bewerbungssammler-Projekts.
