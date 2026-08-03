# Bewerbungssammler – Präsentation (Praxisphase 2)

Interaktive HTML-Präsentation im Design des Produkt-Frontends, gebaut mit
[reveal.js](https://revealjs.com/) (lokal vendored, läuft komplett offline).

## Starten

Kein Build-Schritt nötig. Zwei Wege:

**A) Direkt öffnen**
Doppelklick auf `presentation/index.html` – läuft in jedem modernen Browser.
(Chrome/Edge blockieren lokale `file://`-Requests manchmal je nach Sicherheitseinstellung;
falls die Folien leer bleiben, Weg B nutzen.)

**B) Über einen kleinen lokalen Server** (empfohlen, funktioniert garantiert)
```bash
cd presentation
python -m http.server 8080
# dann im Browser: http://localhost:8080
```
Alternativ, falls Node vorhanden ist: `npx serve .` im `presentation/`-Ordner.

Beides funktioniert **ohne Internetverbindung** – reveal.js, alle Plugins und
Screenshots liegen lokal unter `vendor/` bzw. `assets/`.

## Steuerung

| Taste | Aktion |
|---|---|
| `→` / `Leertaste` | Nächste Folie / nächstes Fragment |
| `←` | Vorherige Folie |
| `↓` | In eine vertikale Unter-Folie (Demo-Fallback, Code-Highlights) |
| `Esc` | Übersichtsmodus (alle Folien als Raster) |
| `S` | Speaker-Notes-Ansicht in neuem Fenster (Zeitbudget + Sprechnotizen je Folie) |
| `Alt` + Klick | In eine Stelle der Folie hineinzoomen (z. B. Architektur-/DB-Diagramm) |
| Maus-Klick | Ebenfalls nächstes Fragment / nächste Folie |

Ein Fortschrittsbalken läuft unten durch die Präsentation.

## Speaker-Notes-Fenster (Taste `S`)

Öffnet ein zweites Fenster mit aktueller + nächster Folie, Timer und den
hinterlegten Sprechnotizen (inkl. Zeitbudget pro Folie und dem kompletten
Demo-Klickskript auf der Live-Demo-Folie). Für Dual-Screen-Setups: Fenster auf
den Referenten-Bildschirm ziehen, Hauptfenster auf den Beamer.

Browser-Pop-up-Blocker müssen für die lokale Seite erlaubt sein, sonst öffnet
sich das Notizen-Fenster nicht.

## PDF-Export (Fallback, falls die Live-Präsentation scheitert)

reveal.js kann sich selbst als Druckansicht rendern:

1. An die URL `?print-pdf` anhängen, z. B.:
   `http://localhost:8080/index.html?print-pdf`
   (bei direktem Öffnen per Doppelklick entsprechend `file:///.../index.html?print-pdf`)
2. Browser-Druckdialog öffnen (`Strg+P` / `Cmd+P`)
3. Ziel: **Als PDF speichern**
4. Layout: **Querformat**, Ränder: **Keine**, Hintergrundgrafiken: **aktiviert**
   (sonst fehlen die Gradient-Hintergründe)
5. Speichern

Am zuverlässigsten funktioniert das in **Chrome** oder **Edge** (Chromium).

## Ordnerstruktur

```
presentation/
├── index.html              # die komplette Präsentation (ein File)
├── README.md                # diese Datei
├── assets/
│   ├── css/theme.css        # Theme, 1:1 aus frontend/tailwind.config.js + index.css übernommen
│   └── screenshots/         # echte Screenshots der laufenden App (kein Mockup)
└── vendor/
    └── reveal.js/           # lokal vendored (dist + Plugins notes/zoom/highlight), keine CDN-Abhängigkeit
```

Die Präsentation ist bewusst **komplett getrennt vom App-Build** (kein Eintrag
in `frontend/package.json`, kein Einfluss auf `docker compose`) – sie lässt
sich löschen oder verschieben, ohne die Anwendung zu berühren.

## Design-Herkunft

Alle Farben, Radien und Schatten sind 1:1 aus dem Produkt übernommen:
- Farben/Radien/Schatten: `frontend/tailwind.config.js`, `frontend/src/index.css`
- Primärfarbe Lila: `#7c3aed` (violet-600), Akzent Fuchsia `#d946ef`
- Dunkler Gradient-Hintergrund: identisch zum Hero-Bereich von Login/Signup/Landing
  (`from-violet-950 via-purple-900 to-fuchsia-900`)
- Karten/Badges/Buttons: gleiche Klassen-Optik wie `.card`, `.badge`, `.btn-primary` im Frontend
- Screenshots: echte Aufnahmen der laufenden App (`docker compose up`), keine Mockups

## Bekannte Einschränkungen

- Die Zeitbudgets in den Speaker-Notes wurden gegenüber der ursprünglichen
  Vorgabe leicht gekürzt, da die Summe der einzeln vorgegebenen Zeiten
  rechnerisch ca. 16 Minuten ergab, nicht die geforderten ~13 Minuten. Die
  Kürzungen betreffen die kürzeren/flexibleren Folien (Agenda, Tech-Stack,
  Datenbank, Ausblick); Demo (3 Min.) und die inhaltlich vorgegebenen
  Kernabschnitte wurden nicht angetastet.
- Mehrere Textstellen sind als <span style="color:#f59e0b">BITTE ERGÄNZEN</span>
  markiert (im Übersichtsmodus, `Esc`, gut sichtbar) – siehe Liste im
  Gesprächsverlauf mit Claude bzw. direkt im Deck suchen.
