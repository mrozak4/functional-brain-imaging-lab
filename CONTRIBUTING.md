# 🧠 Functional Brain Imaging Lab — Website Maintenance Guide

This guide explains how to perform routine updates to the lab website. All content is driven by JSON data files, so **no HTML/CSS knowledge is required** for everyday updates.

---

## 📁 Architecture Overview

```
data/
├── people.json        ← Lab member profiles
├── publications.json  ← Publication list (auto-scraped from PubMed)
├── news.json          ← News/events entries
└── i18n/
    ├── en.json        ← English UI translations
    └── fr.json        ← French UI translations
```

All pages read from these JSON files at page load. **Edit JSON → push to GitHub → site updates automatically.**

---

## 👤 Updating People (`data/people.json`)

### Adding a New Member

1. Have them fill out the **[Member Profile Form](https://mrozak4.github.io/functional-brain-imaging-lab/member-form.html)** — it generates JSON
2. Add their photo to `images/people/` (square crop, min 300×300px)
3. Paste the generated JSON into the `members` array in `data/people.json`
4. Commit and push

### Member JSON Schema

```json
{
  "name": "Full Name",
  "role": "PhD Student",
  "status": "current",
  "photo": "images/people/firstname.jpg",
  "yearJoined": 2024,
  "bio_en": "English bio...",
  "bio_fr": "French bio...",
  "research_en": "Research summary in English...",
  "research_fr": "Research summary in French...",
  "quote_en": "Favourite quote",
  "quote_fr": "Citation préférée",
  "quote_author": "Author Name",
  "links": {
    "email": "name@sri.utoronto.ca",
    "scholar": "https://scholar.google.com/...",
    "orcid": "https://orcid.org/0000-..."
  }
}
```

**Valid roles:** `Principal Investigator`, `Postdoctoral Fellows`, `PhD Student`, `Master's Student`, `Research Staff / Technicians`, `Administrative Assistant`, `Undergraduate Student`, `Research Assistant`

### Moving a Member to Alumni

Change their entry:
```diff
- "status": "current",
+ "status": "alumni",
+ "yearLeft": 2025,
+ "currentPosition": "Postdoc at MIT",
```

## 📰 Adding News / Events (`data/news.json`)

Add a new entry to the top of the `entries` array:

```json
{
  "date": "2026-06-15",
  "title_en": "Lab receives CIHR grant",
  "title_fr": "Le labo reçoit une subvention des IRSC",
  "body_en": "The lab has been awarded a CIHR Project Grant for...",
  "body_fr": "Le laboratoire a reçu une subvention de projet des IRSC pour...",
  "image": "images/news/cihr-grant.jpg",
  "link": "https://example.com/press-release"
}
```

**Tips:**
- `date` should be `YYYY-MM-DD` format
- `image` and `link` are optional
- Entries are displayed in reverse chronological order

---

## 📄 Updating Publications (`data/publications.json`)

### Automatic Method (Recommended)

Run the PubMed scraper to pull new publications:

```bash
python3 scripts/fetch_publications.py
```

This queries PubMed for "Stefanovic B" publications and merges new entries into `publications.json`.

### Manual Method

Add to the top of the `publications` array:

```json
{
  "title": "Paper title here",
  "authors": ["Author A", "Author B", "Stefanovic B"],
  "journal": "Nature Neuroscience",
  "year": 2026,
  "pmid": "12345678",
  "doi": "10.1234/example",
  "abstract": "Optional abstract text..."
}
```

---

## 🌐 Bilingual Content (i18n)

All UI text (buttons, headings, labels) is stored in:
- `data/i18n/en.json` — English
- `data/i18n/fr.json` — French

To add a new translatable string, add the key to **both** files.

---

## 🖼️ Images

| Type | Location | Format | Size |
|------|----------|--------|------|
| People photos | `images/people/` | JPG/GIF | 300×300px min, square |
| News images | `images/news/` | JPG/PNG | 800×400px recommended |
| Project images | `images/projects/` | JPG/PNG | Any |

---

## 🚀 Deployment Checklist

1. `python3 verify_site.py` — Validates all JSON and internal links
2. Review changes locally: `python3 -m http.server 8000`
3. `git add . && git commit -m "Update: [description]" && git push`
4. GitHub Pages auto-deploys within ~2 minutes

---

## 🛠️ Common Tasks Quick Reference

| Task | File to Edit | What to Change |
|------|-------------|----------------|
| Add new lab member | `data/people.json` | Add entry to `members` array |
| Member leaves | `data/people.json` | Change `status` to `alumni`, add `yearLeft` |
| Add news item | `data/news.json` | Add entry to `entries` array |
| Add publication | `data/publications.json` | Add entry or run `fetch_publications.py` |
| Update member photo | `images/people/` | Replace image file |
| Fix typo in bio | `data/people.json` | Edit the relevant `bio_en`/`bio_fr` field |
| Update French translation | `data/i18n/fr.json` | Edit the relevant key |
