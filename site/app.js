(async () => {
  const res = await fetch("places.json", { cache: "no-cache" });
  const data = await res.json();

  const $q = document.getElementById("q");
  const $country = document.getElementById("country");
  const $city = document.getElementById("city");
  const $type = document.getElementById("type");
  const $results = document.getElementById("results");
  const $stats = document.getElementById("stats");
  const tpl = document.getElementById("card-tpl");

  for (const c of data.countries) {
    const opt = document.createElement("option");
    opt.value = c.country; opt.textContent = c.country;
    $country.appendChild(opt);
  }

  function refreshCities() {
    const sel = $country.value;
    $city.innerHTML = '<option value="">All cities</option>';
    const cities = sel
      ? (data.countries.find(c => c.country === sel)?.cities ?? [])
      : [...new Set(data.places.map(p => p.city))].sort();
    for (const city of cities) {
      const opt = document.createElement("option");
      opt.value = city; opt.textContent = city;
      $city.appendChild(opt);
    }
  }
  refreshCities();

  function ratingLine(r) {
    if (!r) return "";
    return `
      <li>📶 wifi <span>${r.wifi}/5</span></li>
      <li>🔌 power <span>${r.power}/5</span></li>
      <li>🤫 quiet <span>${r.noise}/5</span></li>
      <li>🪑 comfort <span>${r.comfort}/5</span></li>`;
  }

  const ICONS = {
    google_maps: "📍 Maps",
    instagram: "📷 Instagram",
    website: "🌐 Website",
    menu: "📜 Menu",
  };

  function render(list) {
    $results.innerHTML = "";
    $stats.textContent = `${list.length} of ${data.count} places`;
    if (!list.length) {
      const d = document.createElement("p");
      d.className = "empty";
      d.textContent = "No places match your filters yet — be the first to add one!";
      $results.appendChild(d);
      return;
    }
    for (const p of list) {
      const node = tpl.content.cloneNode(true);
      node.querySelector(".name").textContent = p.name;
      node.querySelector(".type").textContent = p.type ?? "place";
      node.querySelector(".loc").textContent = `${p.address} · ${p.city}, ${p.country}${p.price ? " · " + p.price : ""}`;
      node.querySelector(".desc").textContent = p.description ?? "";
      node.querySelector(".ratings").innerHTML = ratingLine(p.rating);
      const tags = node.querySelector(".tags");
      tags.innerHTML = (p.tags ?? []).map(t => `<span>#${t}</span>`).join(" ");
      const links = node.querySelector(".links");
      for (const [k, label] of Object.entries(ICONS)) {
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
    const country = $country.value;
    const city = $city.value;
    const type = $type.value;
    const filtered = data.places.filter(p => {
      if (country && p.country !== country) return false;
      if (city && p.city !== city) return false;
      if (type && p.type !== type) return false;
      if (!q) return true;
      const hay = [p.name, p.address, p.description, p.city, p.country, ...(p.tags ?? [])]
        .filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
    render(filtered);
  }

  $q.addEventListener("input", apply);
  $country.addEventListener("change", () => { refreshCities(); apply(); });
  $city.addEventListener("change", apply);
  $type.addEventListener("change", apply);

  apply();
})();
