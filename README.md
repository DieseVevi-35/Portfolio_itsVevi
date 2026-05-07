# Portfolio Vevi 🎨

Das persönliche Portfolio von **Verena Ostermeier** – UX-Design Studentin, Fotografin & Head of Design.

🌐 **Live:** [itsvevi.de](https://www.itsvevi.de)

---

## Struktur

```
portfolio-vevi/
├── index.html     ← Hauptseite mit allen Sektionen
├── style.css      ← Styling (dark editorial, responsiv)
├── script.js      ← Animationen, Lightbox, Tabs, Navigation
└── README.md
```

## Features

- **Responsiv** – Mobile-first mit Hamburger-Menü
- **Scroll-Animationen** – Intersection Observer für weiche Reveal-Effekte
- **Lightbox** – Klickbare Bilder mit Keyboard & Touch-Swipe-Navigation
- **Galerie-Filter** – Tab-Filter für Fußball / Natur / Alle Fotos
- **Sticky Nav** – Wird beim Scrollen transparent → opak
- **Smooth Scroll** – Alle Anker-Links mit sanftem Offset-Scroll
- **Dark Editorial** – Cormorant Garamond + Outfit, Gold-Akzent

## Deployment

### GitHub Pages (empfohlen)

1. Repo auf GitHub pushen
2. Einstellungen → **Pages** → Branch `main` / `root` auswählen
3. Fertig! Die Seite ist unter `https://deinusername.github.io/portfolio-vevi` erreichbar.

### Lokal testen

```bash
# Mit Python (kein Install nötig)
python3 -m http.server 8000
# → http://localhost:8000

# Oder mit Node.js
npx serve .
```

> **Hinweis:** `index.html` muss über einen Server geöffnet werden (nicht als Datei), damit die Instagram-Embeds und YouTube-Iframes korrekt laden.

## Anpassungen

| Was ändern? | Wo? |
|---|---|
| Farben / Akzentfarbe | `style.css` → `:root { --accent: ... }` |
| Fonts | `index.html` → Google Fonts Link + `style.css` `--ff-display` / `--ff-body` |
| Bilder | `index.html` → `src="..."` bei den jeweiligen `<img>`-Tags |
| Texte | `index.html` → direkt im Markup |
| Neue Foto-Kategorie | `index.html` → Tab-Button + `data-category` auf `<figure>` |

## Tech Stack

- Vanilla HTML / CSS / JavaScript (kein Build-Tool nötig)
- Google Fonts: Cormorant Garamond + Outfit
- Framer-Bilder werden direkt von `framerusercontent.com` geladen

---

© Verena Ostermeier | 2025
