# ☕ WorCoffee

> **Great places to work, study, and focus — anywhere in the world.**
> A community-curated, open-source list of cafés, coworking spots, libraries, study spots and hotel lobbies that are actually good for getting things done. For remote workers, freelancers, students, writers, designers — anyone who works outside an office.

[![Deploy site](https://github.com/furkansenharputlu/worcoffee/actions/workflows/deploy.yml/badge.svg)](https://github.com/furkansenharputlu/worcoffee/actions/workflows/deploy.yml)
[![Validate PR](https://github.com/furkansenharputlu/worcoffee/actions/workflows/validate.yml/badge.svg)](https://github.com/furkansenharputlu/worcoffee/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

🌐 **Live site:** https://furkansenharputlu.github.io/worcoffee
📷 **Not on GitHub?** DM [@furkansnhrptlu](https://instagram.com/furkansnhrptlu) on Instagram and we'll add your spot.

---

## Why?

Every remote worker, student, or freelancer has the same recurring problem in a new city:
*"Where can I sit for 4 hours, with fast wifi, an outlet, and decent coffee?"*

Google reviews don't answer this. Nomad lists are paywalled or stale.
**WorCoffee** is a tiny, free, open data set you can extend with a single PR — useful for anyone who works or studies outside an office.

## What's in a place

Each place is one JSON file with the things that actually matter when you work remotely:

- 📶 **Wi-Fi**, 🔌 **power outlets**, 🤫 **noise**, 🪑 **comfort** — rated 1–5
- 📍 Google Maps link, 📷 Instagram, 🌐 website, 📜 menu
- Hours, price band, tags, coordinates, type (cafe / coworking / library / hotel-lobby / …)

### Multi-language by default

- Contributors **write in their own language** (`"lang": "tr"`, `"de"`, `"en"`, …).
- Visitors switch the site language with one click.
- The site picks: viewer's language → source language → first available. So a Turkish-only entry still shows up cleanly for English visitors.
- Country/city grouping uses the **folder path** (`turkiye/istanbul/`) so the same place appears under one country no matter which language a contributor writes in.

See [`data/place.schema.json`](data/place.schema.json) for the full schema.

## How it works

```
data/places/<country>/<city>/<place>.json   ← you edit this
        │
        ▼
scripts/build.mjs   →   dist/places.json + static site
        │
        ▼
GitHub Actions on merge to main → GitHub Pages (live in ~1 minute)
```

- ✅ **Pure data** — JSON files reviewed in PRs, no database.
- ✅ **Zero dependencies** — Node 20 only, no `npm install` needed.
- ✅ **Auto-deploy** — every merge to `main` rebuilds and ships the site.
- ✅ **PR validation** — schema-checked before review.

## Contributing

There are three paths, ranked by effort:

| You are… | Do this |
| --- | --- |
| Not on GitHub | DM [@furkansnhrptlu](https://instagram.com/furkansnhrptlu) on Instagram |
| On GitHub but allergic to JSON | Open an [Add a place](../../issues/new?template=add-place.yml) issue |
| Comfortable with PRs | Drop a JSON file under `data/places/<country>/<city>/` and open a PR |

Full guide: [CONTRIBUTING.md](CONTRIBUTING.md).

## Run locally

```bash
git clone https://github.com/furkansenharputlu/worcoffee.git
cd worcoffee
node scripts/validate.mjs   # check data
node scripts/build.mjs      # generate dist/
npx serve dist              # open http://localhost:3000
```

## Project layout

```
data/
  place.schema.json
  places/
    turkiye/istanbul/federal-coffee.json
    united-kingdom/london/hoxton-holborn.json
site/                       static frontend (HTML/CSS/JS, no framework, i18n)
scripts/
  build.mjs                 aggregates data + copies site → dist/
  validate.mjs              schema check used by CI
.github/
  workflows/                deploy + PR validation
  ISSUE_TEMPLATE/           low-friction "add a place" form
```

## Roadmap

- [ ] Map view (Leaflet + OpenStreetMap)
- [ ] Per-place permalink page
- [ ] Photo gallery (CDN-hosted)
- [ ] City pages with summaries
- [ ] "Working here right now" check-ins

PRs for any of the above are very welcome.

## License

MIT — see [LICENSE](LICENSE). Be kind to café owners.

## Disclaimer & takedown

All information on this site is **community-contributed and not verified**. The maintainers and contributors make **no warranties** about accuracy, completeness, or fitness for any purpose — use at your own risk.

If you are the owner of a place listed here and would like the entry removed, corrected, or updated, please reach out via [Instagram DM](https://instagram.com/furkansnhrptlu) or [open an issue](https://github.com/furkansenharputlu/worcoffee/issues/new). We act quickly and in good faith.

Full text: [DISCLAIMER.md](DISCLAIMER.md).
