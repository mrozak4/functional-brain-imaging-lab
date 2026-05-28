# 🧠 Functional Brain Imaging Lab

**[🌐 Visit the live site → mrozak4.github.io/functional-brain-imaging-lab](https://mrozak4.github.io/functional-brain-imaging-lab/)**

The website for the Functional Brain Imaging Lab (fBIL) at Sunnybrook Research Institute, University of Toronto, led by Dr. Bojana Stefanovic.

---

## Quick Start

```bash
# Serve locally
python3 -m http.server 8000
# Then open http://localhost:8000
```

## Architecture

Static site — no build step, no frameworks. Pages load data from JSON files at runtime.

```
├── data/
│   ├── people.json          # Lab member profiles
│   ├── publications.json    # Publication list
│   ├── news.json            # News & events
│   └── i18n/                # English & French translations
├── css/style.css            # Design system
├── js/
│   ├── neural-bg.js         # Animated neural network background
│   ├── people.js            # People page renderer
│   ├── publications.js      # Publications search & filter
│   └── i18n.js              # Bilingual toggle (EN/FR)
├── images/                  # All site images
└── *.html                   # Page templates
```

## Updating Content

All routine updates are done by editing JSON files — **no HTML/CSS knowledge required**.

| Task | File | Guide |
|------|------|-------|
| Add/edit lab member | `data/people.json` | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Add news or event | `data/news.json` | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Add publication | `data/publications.json` | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Member self-service | [member-form.html](https://mrozak4.github.io/functional-brain-imaging-lab/member-form.html) | — |

See **[CONTRIBUTING.md](CONTRIBUTING.md)** for full details, JSON schemas, and image specs.

## Features

- 🌊 Interactive neural network particle animation
- 🌐 Bilingual (English / French)
- 🔍 Publication search & year filtering
- 📱 Responsive mobile layout with hamburger menu
- 🎨 Dark neuroscience aesthetic with glassmorphism
- 📋 Self-service member profile form

## License

© 2026 Functional Brain Imaging Lab, Sunnybrook Research Institute.
