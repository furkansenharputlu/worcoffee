// Walks data/places/**/*.json, validates each file, and prints a report.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PLACES_DIR = join(ROOT, "data", "places");

const REQUIRED = ["name", "country", "city", "address", "rating"];
const RATING_KEYS = ["wifi", "power", "noise", "comfort"];
const VALID_TYPES = ["cafe", "coworking", "library", "hotel-lobby", "restaurant", "other"];
const VALID_PRICE = ["$", "$$", "$$$", "$$$$"];
const VALID_LINK_KEYS = ["google_maps", "instagram", "website", "menu"];
const I18N_FIELDS = ["name_i18n", "country_i18n", "city_i18n", "address_i18n", "description_i18n"];
const LANG_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (entry.endsWith(".json")) yield p;
  }
}

function isUrl(v) { try { new URL(v); return true; } catch { return false; } }

function validate(place, file) {
  const errors = [];
  for (const key of REQUIRED) {
    if (place[key] === undefined) errors.push(`missing required field: ${key}`);
  }
  if (place.lang !== undefined && !LANG_RE.test(place.lang)) {
    errors.push(`lang '${place.lang}' is not a valid language code (e.g. 'en', 'tr')`);
  }
  if (place.type !== undefined && !VALID_TYPES.includes(place.type)) {
    errors.push(`type must be one of ${VALID_TYPES.join(", ")}`);
  }
  if (place.price !== undefined && !VALID_PRICE.includes(place.price)) {
    errors.push(`price must be one of ${VALID_PRICE.join(", ")}`);
  }
  if (place.rating && typeof place.rating === "object") {
    for (const k of RATING_KEYS) {
      const v = place.rating[k];
      if (!Number.isInteger(v) || v < 1 || v > 5) {
        errors.push(`rating.${k} must be an integer 1-5 (got ${JSON.stringify(v)})`);
      }
    }
  }
  if (place.links && typeof place.links === "object") {
    for (const [k, v] of Object.entries(place.links)) {
      if (!VALID_LINK_KEYS.includes(k)) errors.push(`unknown link key: ${k}`);
      else if (typeof v !== "string" || !isUrl(v)) errors.push(`links.${k} must be a valid URL`);
    }
  }
  if (place.coords) {
    const { lat, lng } = place.coords;
    if (typeof lat !== "number" || lat < -90 || lat > 90) errors.push("coords.lat invalid");
    if (typeof lng !== "number" || lng < -180 || lng > 180) errors.push("coords.lng invalid");
  }
  if (place.tags !== undefined && !Array.isArray(place.tags)) {
    errors.push("tags must be an array of strings");
  }
  for (const f of I18N_FIELDS) {
    if (place[f] === undefined) continue;
    if (typeof place[f] !== "object" || Array.isArray(place[f])) {
      errors.push(`${f} must be an object keyed by language code`);
      continue;
    }
    for (const [lang, val] of Object.entries(place[f])) {
      if (!LANG_RE.test(lang)) errors.push(`${f}.${lang} is not a valid language code`);
      if (typeof val !== "string" || !val.trim()) errors.push(`${f}.${lang} must be a non-empty string`);
    }
  }

  // Folder path sanity: data/places/<country>/<city>/<file>.json
  const rel = relative(PLACES_DIR, file).split("/");
  if (rel.length !== 3) {
    errors.push(`file must be at data/places/<country>/<city>/<slug>.json (got depth ${rel.length})`);
  }
  return errors;
}

let total = 0, failed = 0;
for (const file of walk(PLACES_DIR)) {
  total++;
  const rel = relative(ROOT, file);
  let data;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (e) {
    failed++;
    console.error(`✗ ${rel}\n   invalid JSON: ${e.message}`);
    continue;
  }
  const errs = validate(data, file);
  if (errs.length) {
    failed++;
    console.error(`✗ ${rel}`);
    for (const err of errs) console.error(`   - ${err}`);
  } else {
    console.log(`✓ ${rel}`);
  }
}

console.log(`\n${total - failed}/${total} valid`);
process.exit(failed === 0 ? 0 : 1);
