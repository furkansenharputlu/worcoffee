(async () => {
  const I18N = window.WORCOFFEE_I18N;
  const SUPPORTED = Object.keys(I18N);
  const DEFAULT_LANG = "en";

  function detectLang() {
    const stored = localStorage.getItem("worcoffee.lang");
    if (stored && SUPPORTED.includes(stored)) return stored;
    const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
    return SUPPORTED.includes(browser) ? browser : DEFAULT_LANG;
  }

  let lang = detectLang();
  let t = I18N[lang];

  // Resolve a bundle { lang: text } → string. Falls back: viewer → source → first.
  function pick(bundle, sourceLang) {
    if (!bundle) return "";
    if (bundle[lang]) return bundle[lang];
    if (sourceLang && bundle[sourceLang]) return bundle[sourceLang];
    const first = Object.values(bundle)[0];
    return first ?? "";
  }

  function applyStaticTranslations() {
    document.documentElement.lang = lang;
    for (const el of document.querySelectorAll("[data-i18n]")) {
      const key = el.dataset.i18n;
      if (t[key] !== undefined) el.textContent = t[key];
    }
    for (const el of document.querySelectorAll("[data-i18n-attr]")) {
      const [attr, key] = el.dataset.i18nAttr.split(":");
      if (t[key] !== undefined) el.setAttribute(attr, t[key]);
    }
    document.getElementById("footer-text").innerHTML = t.footer;
  }

  const res = await fetch("places.json", { cache: "no-cache" });
  const data = await res.json();

  const $q = document.getElementById("q");
  const $country = document.getElementById("country");
  const $city = document.getElementById("city");
  const $type = document.getElementById("type");
  const $lang = document.getElementById("lang");
  const $results = document.getElementById("results");
  const $stats = document.getElementById("stats");
  const tpl = document.getElementById("card-tpl");

  $lang.value = lang;
  $lang.addEventListener("change", () => {
    lang = $lang.value;
    t = I18N[lang];
    localStorage.setItem("worcoffee.lang", lang);
    applyStaticTranslations();
    rebuildCountrySelect();
    refreshCities();
    apply();
  });

  function rebuildCountrySelect() {
    const current = $country.value;
    $country.innerHTML = `<option value="">${t.all_countries}</option>`;
    const items = data.countries
      .map(c => ({ slug: c.slug, label: pick(c.label) }))
      .sort((a, b) => a.label.localeCompare(b.label, lang));
    for (const c of items) {
      const opt = document.createElement("option");
      opt.value = c.slug; opt.textContent = c.label;
      $country.appendChild(opt);
    }
    $country.value = current;
  }

  function refreshCities() {
    const sel = $country.value;
    const current = $city.value;
    $city.innerHTML = `<option value="">${t.all_cities}</option>`;
    const all = sel
      ? data.countries.find(c => c.slug === sel)?.cities ?? []
      : data.countries.flatMap(c => c.cities);
    const items = all
      .map(c => ({ slug: c.slug, label: pick(c.label) }))
      .sort((a, b) => a.label.localeCompare(b.label, lang));
    for (const c of items) {
      const opt = document.createElement("option");
      opt.value = c.slug; opt.textContent = c.label;
      $city.appendChild(opt);
    }
    $city.value = current;
  }

  function ratingLine(r) {
    if (!r) return "";
    return `
      <li>📶 ${t.rating_wifi} <span>${r.wifi}/5</span></li>
      <li>🔌 ${t.rating_power} <span>${r.power}/5</span></li>
      <li>🤫 ${t.rating_quiet} <span>${r.noise}/5</span></li>
      <li>🪑 ${t.rating_comfort} <span>${r.comfort}/5</span></li>`;
  }

  const LINK_LABELS = () => ({
    google_maps: t.link_maps, instagram: t.link_instagram,
    website: t.link_website, menu: t.link_menu,
  });
  function typeLabel(p) {
    if (!p.type) return t.place_unit;
    return t[`type_${p.type.replace(/-/g, "_")}`] ?? p.type;
  }

  function render(list) {
    $results.innerHTML = "";
    $stats.textContent = t.stats(list.length, data.count);
    if (!list.length) {
      const d = document.createElement("p");
      d.className = "empty";
      d.textContent = t.empty;
      $results.appendChild(d);
      return;
    }
    const labels = LINK_LABELS();
    for (const p of list) {
      const node = tpl.content.cloneNode(true);
      node.querySelector(".name").textContent = pick(p.name, p.source_lang);
      node.querySelector(".type").textContent = typeLabel(p);
      const addr = pick(p.address, p.source_lang);
      const city = pick(p.city, p.source_lang);
      const country = pick(p.country, p.source_lang);
      node.querySelector(".loc").textContent = `${addr} · ${city}, ${country}${p.price ? " · " + p.price : ""}`;
      const desc = pick(p.description, p.source_lang);
      node.querySelector(".desc").textContent = desc;
      node.querySelector(".ratings").innerHTML = ratingLine(p.rating);
      const tags = node.querySelector(".tags");
      tags.innerHTML = (p.tags ?? []).map(x => `<span>#${x}</span>`).join(" ");
      const links = node.querySelector(".links");
      for (const [k, label] of Object.entries(labels)) {
        const url = p.links?.[k];
        if (!url) continue;
        const a = document.createElement("a");
        a.href = url; a.target = "_blank"; a.rel = "noopener";
        a.textContent = label;
        links.appendChild(a);
      }
      $results.appendChild(node);
    }
  }

  function apply() {
    const q = $q.value.trim().toLowerCase();
    const countrySlug = $country.value;
    const citySlug = $city.value;
    const type = $type.value;
    const filtered = data.places.filter(p => {
      if (countrySlug && p.country_slug !== countrySlug) return false;
      if (citySlug && p.city_slug !== citySlug) return false;
      if (type && p.type !== type) return false;
      if (!q) return true;
      // Search across ALL languages so people can find places by either name.
      const hay = [
        ...Object.values(p.name ?? {}),
        ...Object.values(p.address ?? {}),
        ...Object.values(p.description ?? {}),
        ...Object.values(p.city ?? {}),
        ...Object.values(p.country ?? {}),
        ...(p.tags ?? []),
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
    render(filtered);
  }

  applyStaticTranslations();
  rebuildCountrySelect();
  refreshCities();

  $q.addEventListener("input", apply);
  $country.addEventListener("change", () => { refreshCities(); apply(); });
  $city.addEventListener("change", apply);
  $type.addEventListener("change", apply);

  apply();
})();
