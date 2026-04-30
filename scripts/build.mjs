// Aggregates all place JSON files into dist/places.json and copies the static site.
// Normalizes text fields into i18n bundles so the frontend can pick a language.
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PLACES_DIR = join(ROOT, "data", "places");
const SITE_DIR = join(ROOT, "site");
const DIST_DIR = join(ROOT, "dist");

const TEXT_FIELDS = ["name", "country", "city", "address", "description"];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (entry.endsWith(".json")) yield p;
  }
}

function slugify(s) {
  return String(s).toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Merge raw + raw_i18n into a single { lang: text } bundle.
function bundle(raw, i18n, sourceLang) {
  const out = {};
  if (typeof raw === "string" && raw.trim()) out[sourceLang] = raw;
  if (i18n && typeof i18n === "object") {
    for (const [k, v] of Object.entries(i18n)) {
      if (typeof v === "string" && v.trim()) out[k] = v;
    }
  }
  return out;
}

const places = [];
const countryDisplay = {};   // slug -> { lang: text }
const cityDisplay = {};      // `${countrySlug}/${citySlug}` -> { lang: text }

for (const file of walk(PLACES_DIR)) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  const sourceLang = data.lang || "en";
  const relParts = relative(PLACES_DIR, file).split("/");
  const countrySlug = relParts[0];
  const citySlug = relParts[1];

  const place = {
    id: `${countrySlug}/${citySlug}/${slugify(data.name)}`,
    country_slug: countrySlug,
    city_slug: citySlug,
    source_lang: sourceLang,
    name: bundle(data.name, data.name_i18n, sourceLang),
    country: bundle(data.country, data.country_i18n, sourceLang),
    city: bundle(data.city, data.city_i18n, sourceLang),
    address: bundle(data.address, data.address_i18n, sourceLang),
    description: bundle(data.description, data.description_i18n, sourceLang),
    type: data.type,
    rating: data.rating,
    hours: data.hours,
    price: data.price,
    tags: data.tags ?? [],
    links: data.links ?? {},
    coords: data.coords,
    submitted_by: data.submitted_by,
  };

  // Aggregate display labels for country/city across all places.
  countryDisplay[countrySlug] = { ...(countryDisplay[countrySlug] ?? {}), ...place.country };
  const cityKey = `${countrySlug}/${citySlug}`;
  cityDisplay[cityKey] = { ...(cityDisplay[cityKey] ?? {}), ...place.city };

  places.push(place);
}

places.sort((a, b) => a.id.localeCompare(b.id));

// Build country/city index using slugs as identity, with merged i18n labels.
const countryMap = {};
for (const p of places) {
  countryMap[p.country_slug] ??= { slug: p.country_slug, label: countryDisplay[p.country_slug], cities: {} };
  countryMap[p.country_slug].cities[p.city_slug] ??= {
    slug: p.city_slug,
    label: cityDisplay[`${p.country_slug}/${p.city_slug}`],
  };
}
const countries = Object.values(countryMap)
  .map(c => ({ ...c, cities: Object.values(c.cities) }))
  .sort((a, b) => a.slug.localeCompare(b.slug));

if (existsSync(DIST_DIR)) rmSync(DIST_DIR, { recursive: true, force: true });
mkdirSync(DIST_DIR, { recursive: true });
cpSync(SITE_DIR, DIST_DIR, { recursive: true });

writeFileSync(
  join(DIST_DIR, "places.json"),
  JSON.stringify({
    generated_at: new Date().toISOString(),
    count: places.length,
    countries,
    places,
  }, null, 2)
);

console.log(`Built ${places.length} places across ${countries.length} countries → dist/places.json`);
