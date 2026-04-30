# Contributing to WorCoffee

Thanks for helping fellow remote workers find good spots! ☕

There are **three ways** to contribute a place — pick whichever you like.

## 1. The fast way (no GitHub account)

DM **[@furkansnhrptlu on Instagram](https://instagram.com/furkansnhrptlu)** with:
- Place name, city, country, address
- Google Maps link
- A few words on wifi / power / noise / comfort

We'll open the PR for you.

## 2. The easy way (GitHub, no code)

Open a [new "Add a place" issue](../../issues/new?template=add-place.yml) and fill in the form. A maintainer will turn it into a PR.

## 3. The proper way (open a PR)

1. Fork this repo.
2. Create a JSON file at:
   ```
   data/places/<country-slug>/<city-slug>/<place-slug>.json
   ```
   Slugs are lowercase, hyphen-separated. Example:
   `data/places/turkiye/istanbul/federal-coffee.json`
3. **Write in your own language.** Set `lang` to your language code (e.g. `"tr"`, `"de"`, `"en"`). The website will pick a translation when one is available, and otherwise fall back to your original text — so a Turkish-only entry is perfectly fine.
4. The minimum required fields are `name`, `country`, `city`, `address`, and `rating`.
5. Validate locally:
   ```bash
   node scripts/validate.mjs
   ```
6. Open a PR. CI will validate again. On merge, the website auto-deploys.

### Place schema

A minimal Turkish-only entry — perfectly valid:

```json
{
  "lang": "tr",
  "name": "Federal Coffee İstanbul",
  "country": "Türkiye",
  "city": "İstanbul",
  "address": "Tomtom Mah., Beyoğlu",
  "description": "Karaköy'de uzaktan çalışanların sevdiği geniş bir kafe.",
  "type": "cafe",
  "rating": { "wifi": 4, "power": 3, "noise": 3, "comfort": 4 }
}
```

A fuller entry with translations and links:

```json
{
  "lang": "tr",
  "name": "Federal Coffee İstanbul",
  "name_i18n": { "en": "Federal Coffee Istanbul" },
  "country": "Türkiye",
  "city": "İstanbul",
  "city_i18n": { "en": "Istanbul" },
  "address": "Tomtom Mah., Beyoğlu",
  "description": "Karaköy'de uzaktan çalışanların sevdiği geniş bir kafe.",
  "description_i18n": { "en": "Spacious cafe popular with remote workers." },
  "type": "cafe",
  "rating": { "wifi": 4, "power": 3, "noise": 3, "comfort": 4 },
  "hours": "Pzt-Paz 08:00-22:00",
  "price": "$$",
  "tags": ["specialty-coffee", "laptop-friendly"],
  "links": {
    "google_maps": "https://maps.google.com/?q=...",
    "instagram":   "https://instagram.com/...",
    "website":     "https://...",
    "menu":        "https://..."
  },
  "coords": { "lat": 41.0322, "lng": 28.9774 },
  "submitted_by": "your-github-handle"
}
```

#### Field rules
| field | required | notes |
| --- | --- | --- |
| `lang` | – | source language code (default `"en"`). Used as fallback when a translation is missing. |
| `name` | ✅ | Public name of the place, in your `lang` |
| `country` / `city` | ✅ | In your `lang` — folder path (`turkiye/istanbul`) is what actually groups places. |
| `address` | ✅ | Street-level enough to find it |
| `type` | – | one of `cafe`, `coworking`, `library`, `hotel-lobby`, `restaurant`, `other` |
| `rating.*` | ✅ | integer 1–5. **`noise`: 1=loud, 5=quiet** |
| `price` | – | one of `$`, `$$`, `$$$`, `$$$$` |
| `links.*` | – | must be valid URLs |
| `coords` | – | decimal degrees, helps the future map view |
| `*_i18n` | – | optional translations keyed by language code (e.g. `"en"`, `"tr"`). Supported on `name`, `country`, `city`, `address`, `description`. |

### Folder paths

Folder names are stable English-friendly slugs, **independent** of how you write the country/city in your text fields. So whether you write `"Türkiye"` or `"Turkey"`, both belong under `data/places/turkiye/`. This keeps a country grouped as one even when contributors use different languages.

### Reviewing

We aim to merge any well-formed PR within a few days. We may push small tweaks (typos, slug normalization, adding the most common translation) before merging.

### What gets rejected

- Places you haven't actually visited, with no clear source.
- Promotional spam from owners (it's fine to add your own café — just be honest about ratings).
- Anywhere that doesn't actually work for remote work (no wifi at all, etc.).
