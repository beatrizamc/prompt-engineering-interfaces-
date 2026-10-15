"use strict";

/* ---------- Dados (títulos fictícios) ---------- */
// h = [matiz inicial, matiz final] do degradê da capa; popularidade = ordem na lista
const COMICS = [
  { id: 1,  title: "A Herdeira do Farol Silencioso", type: "Manhwa", genres: ["Fantasia", "Romance"], chapter: 56, ago: "1h",  complete: false, h: [335, 270] },
  { id: 2,  title: "Receitas do Último Dragão",       type: "Mangá",  genres: ["Culinária", "Aventura"], chapter: 43, ago: "2h",  complete: false, h: [25, 350] },
  { id: 3,  title: "O Jardim Entre Marés",            type: "Manhua", genres: ["Drama", "Slice of life"], chapter: 51, ago: "5h",  complete: false, h: [175, 215] },
  { id: 4,  title: "Cartas para a Lua Nova",          type: "Mangá",  genres: ["Romance", "Fantasia"], chapter: 12, ago: "7h",  complete: true,  h: [255, 300] },
  { id: 5,  title: "Guardiã da Biblioteca Errante",   type: "Manhwa", genres: ["Mistério", "Fantasia"], chapter: 20, ago: "9h",  complete: false, h: [45, 20] },
  { id: 6,  title: "Quarto 404, Mundo Paralelo",      type: "Mangá",  genres: ["Comédia", "Isekai"], chapter: 88, ago: "12h", complete: false, h: [195, 240] },
  { id: 7,  title: "Rainha do Café das Três",         type: "Manhua", genres: ["Comédia", "Romance"], chapter: 30, ago: "1d",  complete: true,  h: [15, 330] },
  { id: 8,  title: "Samurai de Papel",                type: "Mangá",  genres: ["Ação", "Histórico"], chapter: 64, ago: "1d",  complete: false, h: [350, 20] },
  { id: 9,  title: "Estrelas no Bolso",               type: "Manhwa", genres: ["Ficção científica"], chapter: 9,  ago: "2d",  complete: true,  h: [220, 280] },
  { id: 10, title: "O Aprendiz do Vento Sul",         type: "Manhua", genres: ["Aventura", "Ação"], chapter: 101, ago: "2d", complete: false, h: [140, 190] },
  { id: 11, title: "Doce Vingança de Domingo",        type: "Mangá",  genres: ["Drama", "Culinária"], chapter: 27, ago: "3d",  complete: false, h: [310, 350] },
  { id: 12, title: "Nuvens para Alugar",              type: "Manhwa", genres: ["Slice of life"], chapter: 15, ago: "3d",  complete: true,  h: [200, 160] },
];

const THEMES = ["ameixa", "oceano", "matcha"];
const TYPES = ["Todos", "Mangá", "Manhwa", "Manhua"];

/* ---------- Estado ---------- */
const state = {
  query: "",
  type: "Todos",
  tab: "recent",
  onlyFollowing: false,
  follows: new Set(load("mangara:follows", [])),
};

const $ = (sel) => document.querySelector(sel);
const els = {
  search: $("#search"),
  filters: $("#type-filters"),
  popular: $("#popular-row"),
  grid: $("#all-grid"),
  empty: $("#empty"),
  side: $("#side-list"),
  followChip: $("#follow-chip"),
  followCount: $("#follow-count"),
};

/* ---------- Armazenamento ---------- */
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento */ }
}

/* ---------- Filtragem ---------- */
function visibleComics() {
  const q = state.query.trim().toLowerCase();
  return COMICS.filter((c) =>
    (state.type === "Todos" || c.type === state.type) &&
    (!state.onlyFollowing || state.follows.has(c.id)) &&
    (!q || c.title.toLowerCase().includes(q) || c.genres.some((g) => g.toLowerCase().includes(q)))
  );
}

/* ---------- Templates ---------- */
const coverStyle = (c) => `--h1:${c.h[0]};--h2:${c.h[1]}`;

function cardHTML(c, rank) {
  const on = state.follows.has(c.id);
  return `
    <article class="card">
      <div class="relative">
        ${rank ? `<span class="rank">#${rank}</span>` : ""}
        <button class="heart ${on ? "is-on" : ""}" type="button" data-follow="${c.id}"
                aria-pressed="${on}" aria-label="Seguir ${c.title}">♥</button>
        <div class="cover" style="${coverStyle(c)}">
          <span class="cover-initial" aria-hidden="true">${c.title[0]}</span>
          <span class="cover-genre">${c.genres.join(", ")}</span>
        </div>
      </div>
      <div class="card-meta"><span>Cap. ${c.chapter}</span><span>${c.type}</span></div>
      <h3 class="card-title">${c.title}</h3>
    </article>`;
}

function sideItemHTML(c) {
  const sub = state.tab === "complete" ? `Completo, ${c.chapter} capítulos` : `Cap. ${c.chapter}, há ${c.ago}`;
  return `
    <li class="side-item">
      <div class="mini" style="${coverStyle(c)}" aria-hidden="true">${c.title[0]}</div>
      <div class="min-w-0">
        <div class="side-type">${c.type}</div>
        <div class="side-title">${c.title}</div>
        <div class="side-sub">${sub}</div>
      </div>
    </li>`;
}

/* ---------- Renderização ---------- */
function renderFilters() {
  els.filters.innerHTML = TYPES.map((t) =>
    `<button class="chip ${t === state.type ? "is-active" : ""}" type="button" data-type="${t}">${t}</button>`
  ).join("");
}

function renderLists() {
  const list = visibleComics();
  // O carrossel mostra os 8 primeiros da lista (que já está em ordem de popularidade)
  els.popular.innerHTML = list.slice(0, 8).map((c, i) => cardHTML(c, i + 1)).join("");
  els.grid.innerHTML = list.map((c) => cardHTML(c)).join("");
  els.empty.classList.toggle("hidden", list.length > 0);
  $("#popular-title").closest("section").classList.toggle("hidden", list.length === 0);
  renderSide();
}

function renderSide() {
  const list = COMICS.filter((c) => (state.tab === "complete" ? c.complete : true)).slice(0, 7);
  els.side.innerHTML = list.map(sideItemHTML).join("");
}

function updateFollowUI() {
  els.followCount.textContent = state.follows.size;
  els.followChip.classList.toggle("is-on", state.onlyFollowing);
  document.querySelectorAll("[data-follow]").forEach((btn) => {
    const on = state.follows.has(Number(btn.dataset.follow));
    btn.classList.toggle("is-on", on);
    btn.setAttribute("aria-pressed", on);
  });
}

/* ---------- Eventos ---------- */
els.search.addEventListener("input", (e) => {
  state.query = e.target.value;
  renderLists();
  updateFollowUI();
});

els.filters.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-type]");
  if (!btn) return;
  state.type = btn.dataset.type;
  renderFilters();
  renderLists();
  updateFollowUI();
});

// Seguir/deixar de seguir: atualiza o botão no lugar, sem redesenhar (preserva o scroll do carrossel)
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-follow]");
  if (!btn) return;
  const id = Number(btn.dataset.follow);
  state.follows.has(id) ? state.follows.delete(id) : state.follows.add(id);
  save("mangara:follows", [...state.follows]);
  updateFollowUI();
});

els.followChip.addEventListener("click", () => {
  state.onlyFollowing = !state.onlyFollowing;
  renderLists();
  updateFollowUI();
});

document.querySelectorAll("[data-scroll]").forEach((btn) =>
  btn.addEventListener("click", () => {
    els.popular.scrollBy({ left: Number(btn.dataset.scroll) * els.popular.clientWidth * 0.8, behavior: "smooth" });
  })
);

document.querySelectorAll("[data-tab]").forEach((btn) =>
  btn.addEventListener("click", () => {
    state.tab = btn.dataset.tab;
    document.querySelectorAll("[data-tab]").forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active);
    });
    renderSide();
  })
);

/* ---------- Tema ---------- */
function applyTheme(name) {
  document.documentElement.dataset.theme = name;
  save("mangara:theme", name);
}
$("#theme-btn").addEventListener("click", () => {
  const next = THEMES[(THEMES.indexOf(document.documentElement.dataset.theme) + 1) % THEMES.length];
  applyTheme(next);
});

/* ---------- Início ---------- */
applyTheme(load("mangara:theme", THEMES[0]));
renderFilters();
renderLists();
updateFollowUI();
