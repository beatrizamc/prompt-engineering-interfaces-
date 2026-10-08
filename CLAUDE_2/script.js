(() => {
  "use strict";

  const API = "https://api.jikan.moe/v4";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  };

  const state = {
    type: "",
    tab: "recent",
    view: null, // "search" | "favs" | null
    searchId: 0,
    favs: store.get("tinteiro:favs", []),
  };
  const catalog = new Map(); // mal_id -> título, usado pela janela de detalhes

  const TYPES = { Manga: "Mangá", Manhwa: "Manhwa", Manhua: "Manhua", Novel: "Novel", "Light Novel": "Light novel", "One-shot": "One-shot", Doujinshi: "Doujinshi" };
  const STATUS = { Publishing: "Em publicação", Finished: "Completo", "On Hiatus": "Em hiato", Discontinued: "Descontinuado", "Not yet published": "Em breve" };

  // ---------- Utilidades ----------
  const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const titleOf = (m) => m.title_english || m.title;
  const coverOf = (m) => m.images?.webp?.large_image_url || m.images?.jpg?.large_image_url || "";
  const typeOf = (m) => TYPES[m.type] || "Quadrinho";
  const statusOf = (m) => STATUS[m.status] || m.status || "";
  const infoOf = (m) => `${typeOf(m)}, ${m.chapters ? m.chapters + " cap." : statusOf(m)}`;
  const isFav = (id) => state.favs.some((m) => m.mal_id === id);

  // ---------- API ----------
  // A Jikan limita ~3 requisições por segundo: as chamadas entram em fila.
  async function request(path, retries = 2) {
    const res = await fetch(API + path);
    if (res.status === 429 && retries > 0) {
      await wait(1200);
      return request(path, retries - 1);
    }
    if (!res.ok) throw new Error(res.status);
    return (await res.json()).data ?? [];
  }

  let queue = Promise.resolve();
  function api(path) {
    const job = queue.then(() => request(path));
    queue = job.catch(() => {}).then(() => wait(400));
    return job;
  }

  // ---------- Templates ----------
  const card = (m, rank) => `
    <article>
      <button class="card-btn" data-open="${m.mal_id}" aria-label="Abrir ${esc(titleOf(m))}">
        <div class="cover">
          <img src="${esc(coverOf(m))}" alt="" loading="lazy">
          ${rank ? `<span class="rank" aria-label="Posição ${rank}">${rank}</span>` : ""}
          ${m.score ? `<span class="score">★ ${m.score.toFixed(1)}</span>` : ""}
        </div>
        <h3 class="card-title">${esc(titleOf(m))}</h3>
        <p class="card-meta">${esc(infoOf(m))}</p>
      </button>
    </article>`;

  const miniRow = (m) => `
    <button class="mini" data-open="${m.mal_id}">
      <img src="${esc(coverOf(m))}" alt="" loading="lazy">
      <div class="min-w-0">
        <h3>${esc(titleOf(m))}</h3>
        <p>${esc(typeOf(m))}, ${esc(statusOf(m))}</p>
      </div>
    </button>`;

  const skeletonCards = (n) => Array.from({ length: n }, () =>
    `<div><div class="cover skeleton"></div><div class="line-skeleton"></div><div class="line-skeleton" style="width:60%"></div></div>`).join("");

  const skeletonRows = (n) => Array.from({ length: n }, () =>
    `<div class="mini"><div class="thumb-skeleton"></div><div class="flex-1"><div class="line-skeleton"></div><div class="line-skeleton" style="width:55%"></div></div></div>`).join("");

  const notice = (text, retry = false) =>
    `<div class="notice"><p>${text}</p>${retry ? `<button class="btn btn-ghost" data-retry>Tentar de novo</button>` : ""}</div>`;

  const ERROR_MSG = "Não foi possível carregar os títulos. Verifique sua conexão e tente de novo.";

  // ---------- Carregamento das seções ----------
  async function fill(target, path, render, placeholder) {
    target.innerHTML = placeholder;
    try {
      const list = await api(path);
      list.forEach((m) => catalog.set(m.mal_id, m));
      target.innerHTML = list.length ? render(list) : notice("Nenhum título encontrado neste filtro.");
    } catch {
      target.innerHTML = notice(ERROR_MSG, true);
    }
  }

  const typeParam = () => (state.type ? `&type=${state.type}` : "");

  const SIDE_PATHS = {
    recent: "/manga?status=publishing&order_by=start_date&sort=desc&limit=8&sfw=true",
    complete: "/manga?status=complete&order_by=favorites&sort=desc&limit=8&sfw=true",
  };

  const loadSide = () =>
    fill($("#side-list"), SIDE_PATHS[state.tab] + typeParam(), (l) => l.map(miniRow).join(""), skeletonRows(6));

  function loadAll() {
    const t = typeParam();
    fill($("#popular-track"), `/top/manga?filter=publishing&limit=15${t}`, (l) => l.map((m, i) => card(m, i + 1)).join(""), skeletonCards(6));
    fill($("#loved-track"), `/top/manga?filter=favorite&limit=15${t}`, (l) => l.map((m) => card(m)).join(""), skeletonCards(6));
    loadSide();
  }

  // ---------- Resultados: busca e estante ----------
  function showResults(title, html, scroll = false) {
    $("#results-title").textContent = title;
    $("#results-grid").innerHTML = html;
    $("#results").hidden = false;
    if (scroll) $("#results").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeResults() {
    state.view = null;
    state.searchId++;
    $("#results").hidden = true;
  }

  async function search(query, scroll = false) {
    const id = ++state.searchId;
    if (query.length < 2) {
      if (state.view === "search") closeResults();
      return;
    }
    state.view = "search";
    showResults(`Resultados para “${query}”`, skeletonCards(6), scroll);
    try {
      const list = await api(`/manga?q=${encodeURIComponent(query)}&limit=18&sfw=true${typeParam()}`);
      if (id !== state.searchId) return; // chegou uma busca mais recente
      list.forEach((m) => catalog.set(m.mal_id, m));
      $("#results-grid").innerHTML = list.length ? list.map((m) => card(m)).join("") : notice("Nada encontrado. Tente outro nome ou o título original.");
    } catch {
      if (id === state.searchId) $("#results-grid").innerHTML = notice(ERROR_MSG);
    }
  }

  function showFavs() {
    state.view = "favs";
    state.searchId++;
    showResults("Sua estante", state.favs.length
      ? state.favs.map((m) => card(m)).join("")
      : notice("Sua estante está vazia. Abra um título e escolha “Guardar na estante”."), true);
  }

  // ---------- Estante ----------
  function toggleFav(id) {
    const m = catalog.get(id);
    state.favs = isFav(id) ? state.favs.filter((f) => f.mal_id !== id) : [m, ...state.favs];
    store.set("tinteiro:favs", state.favs);
    updateFavCount();
    if (state.view === "favs") showFavs();
  }

  const updateFavCount = () => { $("#favs-count").textContent = state.favs.length; };

  // ---------- Janela de detalhes ----------
  const dialog = $("#detail");

  function openDetail(id) {
    const m = catalog.get(id);
    if (!m) return;
    const meta = [typeOf(m), statusOf(m), m.chapters && `${m.chapters} capítulos`, m.score && `nota ${m.score.toFixed(1)}`].filter(Boolean).join(", ");
    const genres = (m.genres || []).map((g) => `<span class="tag">${esc(g.name)}</span>`).join("");
    const authors = (m.authors || []).map((a) => a.name).join("; ");

    $("#detail-body").innerHTML = `
      <div class="detail">
        <img class="detail-cover" src="${esc(coverOf(m))}" alt="Capa de ${esc(titleOf(m))}">
        <div class="space-y-4">
          <h2 id="detail-title" class="font-display pr-10 text-2xl font-extrabold">${esc(titleOf(m))}</h2>
          <p class="muted">${esc(meta)}${authors ? `<br>${esc(authors)}` : ""}</p>
          <div class="flex flex-wrap gap-2">${genres}</div>
          <p class="synopsis" lang="en">${esc(m.synopsis || "Sem sinopse disponível.")}</p>
          <div class="flex flex-wrap gap-3 pt-2">
            <button class="btn btn-primary" data-fav="${m.mal_id}">${isFav(m.mal_id) ? "Na estante" : "Guardar na estante"}</button>
            <a class="btn btn-ghost" href="${esc(m.url)}" target="_blank" rel="noopener">Ver ficha completa</a>
          </div>
        </div>
        <button class="icon-btn detail-close" data-close aria-label="Fechar">×</button>
      </div>`;
    dialog.showModal();
  }

  // ---------- Tema ----------
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    store.set("tinteiro:theme", theme);
  }

  // ---------- Eventos ----------
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-open],[data-fav],[data-close],[data-retry],[data-scroll],[data-type],[data-tab]");
    if (e.target === dialog) return dialog.close();
    if (!el) return;

    if (el.dataset.open) openDetail(Number(el.dataset.open));
    else if (el.dataset.fav) {
      toggleFav(Number(el.dataset.fav));
      el.textContent = isFav(Number(el.dataset.fav)) ? "Na estante" : "Guardar na estante";
    } else if ("close" in el.dataset) dialog.close();
    else if ("retry" in el.dataset) loadAll();
    else if (el.dataset.scroll) {
      const track = $("#" + el.dataset.scroll);
      track.scrollBy({ left: track.clientWidth * 0.85 * Number(el.dataset.dir), behavior: "smooth" });
    } else if (el.dataset.type !== undefined) {
      state.type = el.dataset.type;
      $$("[data-type]").forEach((b) => b.setAttribute("aria-pressed", String(b === el)));
      loadAll();
    } else if (el.dataset.tab) {
      state.tab = el.dataset.tab;
      $$("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b === el)));
      loadSide();
    }
  });

  let debounce;
  $("#search-input").addEventListener("input", (e) => {
    clearTimeout(debounce);
    debounce = setTimeout(() => search(e.target.value.trim()), 500);
  });
  $("#search-form").addEventListener("submit", (e) => {
    e.preventDefault();
    clearTimeout(debounce);
    search($("#search-input").value.trim(), true);
  });

  $("#favs-btn").addEventListener("click", showFavs);
  $("#results-close").addEventListener("click", closeResults);
  $("#theme-btn").addEventListener("click", () =>
    setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));

  // ---------- Início ----------
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(store.get("tinteiro:theme", prefersLight ? "light" : "dark"));
  updateFavCount();
  loadAll();
})();
