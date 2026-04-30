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
   `data/places/turkey/istanbul/federal-coffee.json`
3. Use the schema below. The minimum required fields are `name`, `country`, `city`, `address`, and `rating`.
4. Validate locally:
   ```bash
   node scripts/validate.mjs
   ```
5. Open a PR. CI will validate again. On merge, the website auto-deploys.

### Place schema

```json
{
  "name": "Federal Coffee Istanbul",
  "country": "Turkey",
  "city": "Istanbul",
  "address": "Tomtom Mah., Beyoğlu",
  "description": "Spacious cafe popular with remote workers.",
  "type": "cafe",
  "rating": { "wifi": 4, "power": 3, "noise": 3, "comfort": 4 },
  "hours": "Mon-Sun 08:00-22:00",
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
| `name` | ✅ | Public name of the place |
| `country` / `city` | ✅ | Use the common English name |
| `address` | ✅ | Street-level enough to find it |
| `type` | – | one of `cafe`, `coworking`, `library`, `hotel-lobby`, `restaurant`, `other` |
| `rating.*` | ✅ | integer 1–5. **`noise`: 1=loud, 5=quiet** |
| `price` | – | one of `$`, `$$`, `$$$`, `$$$$` |
| `links.*` | – | must be valid URLs |
| `coords` | – | decimal degrees, helps the future map view |

### Reviewing

We aim to merge any well-formed PR within a few days. We may push small tweaks (typos, normalized country names) before merging.

### What gets rejected

- Places you haven't actually visited, with no clear source.
- Promotional spam from owners (it's fine to add your own café — just be honest about ratings).
- Anywhere that doesn't actually work for remote work (no wifi at all, etc.).
