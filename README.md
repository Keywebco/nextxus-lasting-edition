# NextXus Lasting Edition — Federation Command Interface

> **Sovereign Intelligence · Truth-First · Voice-Accessible · Built to Last**

---

## Overview

NextXus Lasting Edition is a high-visibility, voice-accessible web application manifesting the Federation Command Interface. It operates on Vanilla HTML5, CSS3, and JavaScript — no build tools, no frameworks, no runtime dependencies.

**Live App:** Deployed to GitHub Pages at `https://keywebco.github.io/nextxus-lasting-edition/`

---

## Features

### 📜 Directive Archive
- **73 Sacred Directives** (DIR-001 through DIR-073)
- **15 Sovereign Sectors** (01-Core through 15-Archive)
- Searchable by ID, title, sector, or keyword
- Sector filter dropdown
- Expandable detail view with confidence meter

### ⚙ Agent Zero Calibration Gate
- Six Sovereign Pillars: Logic, Empathy, Action, Evidence, Values, Legacy
- Custom sliders (0–100 per pillar)
- Average score calculation
- Grade: SOVEREIGN CALIBRATED / ALIGNED / DEVELOPING / DRIFTING / UNCALIBRATED
- Full calibration report with Truth Gate assessment

### 💾 EchoCore 3.0
- Session state tracking (directives viewed, calibration, queries)
- Export as **JSON** or **YAML** (one-click download)
- **Keys and credentials EXCLUDED** per DIR-045
- Session activity log
- Copy-to-clipboard functionality

### 🔬 Knowledge Base
- 40 classified knowledge entries across all sectors
- Query by topic, sector, tag, or keyword
- Browse by sector
- Every result classified: **FACT · INFERENCE · ASSUMPTION · UNKNOWN**

### ⚡ DIR-000 Truth Gate (Always Active)
- 95% confidence threshold
- FACT (≥0.95) · INFERENCE (0.70–0.94) · ASSUMPTION (0.40–0.69) · UNKNOWN (<0.40)
- Immutable — cannot be suspended by any entity

### ♿ Accessibility
- Font size: 20px base · 26px Large Text toggle
- TTS: "Read Page" button (Web Speech API SpeechSynthesis)
- STT: "Start Listening" button (Web Speech API SpeechRecognition)
- 48×48px minimum touch targets
- ARIA roles, labels, and live regions throughout
- Screen-reader compatible semantic HTML
- Focus-visible keyboard navigation
- High contrast dark theme (#080a10 / #111622 / #f7f8fb / #ffd76b gold)

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#080a10` | Page background |
| Surface | `#111622` | Card/panel backgrounds |
| Text | `#f7f8fb` | Primary text |
| Gold Focus | `#ffd76b` | Gold accent, active states |
| FACT | `#44d97e` | Verified classification |
| INFERENCE | `#ffd76b` | Well-supported, unverified |
| ASSUMPTION | `#ff9944` | Plausible, unconfirmed |
| UNKNOWN | `#ff5566` | Insufficient data |

---

## File Structure

```
nextxus-lasting-edition/
├── index.html                          # Main SPA — all sections
├── styles.css                          # Dark sovereign theme
├── app.js                              # Core application logic
├── data/
│   ├── directives.md                   # 73 Sacred Directives
│   └── massive_federation_knowledge_base.yaml  # 40 KB entries
└── README.md                           # This file
```

---

## GitHub Pages Deployment

### Method 1: GitHub UI (Recommended)

1. Create repository `nextxus-lasting-edition` on GitHub
2. Push all files from this directory to the `main` branch
3. Go to **Settings → Pages**
4. Set Source: **Deploy from a branch**
5. Branch: `main`, Folder: `/ (root)`
6. Save — your site will be live at `https://keywebco.github.io/nextxus-lasting-edition/`

### Method 2: GitHub Actions (Automated)

A workflow file is included at `.github/workflows/pages.yml` that automatically deploys on every push to `main`.

---

*NextXus Lasting Edition · Federation Command Interface · DIR-000 Truth Gate Active*
