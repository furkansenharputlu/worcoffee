// Aggregates all place JSON files into dist/places.json and copies the static site.
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PLACES_DIR = join(ROOT, "data", "places");
const SITE_DIR = join(ROOT, "site");
const DIST_DIR = join(ROOT, "dist");

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) yield* walk(p);
    else if (entry.endsWith(".json")) yield p;
  }
}

function slugify(s) {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const places = [];
for (const file of walk(PLACES_DIR)) {
  const data = JSON.parse(readFileSync(file, "utf8"));
  data.id = `${slugify(data.country)}/${slugify(data.city)}/${slugify(data.name)}`;
  data._source = relative(ROOT, file);
  places.push(data);
}

places.sort((a, b) => a.id.localeCompare(b.id));

const countries = {};
for (const p of places) {
  countries[p.country] ??= new Set();
  countries[p.country].add(p.city);
}
const index = Object.entries(countries)
  .map(([country, cities]) => ({ country, cities: [...cities].sort() }))
  .sort((a, b) => a.country.localeCompare(b.country));

if (existsSync(DIST_DIR)) rmSync(DIST_DIR, { recursive: true, force: true });
mkdirSync(DIST_DIR, { recursive: true });
cpSync(SITE_DIR, DIST_DIR, { recursive: true });

writeFileSync(
  join(DIST_DIR, "places.json"),
  JSON.stringify({
    generated_at: new Date().toISOString(),
    count: places.length,
    countries: index,
    places,
  }, null, 2)
);

console.log(`Built ${places.length} places across ${index.length} countries → dist/places.json`);
