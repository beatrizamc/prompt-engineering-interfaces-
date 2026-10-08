'use strict';

/* ---------- utilidades ---------- */
const $ = (s, e = document) => e.querySelector(s);
const $$ = (s, e = document) => [...e.querySelectorAll(s)];
const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v);
  }
  n.append(...kids.flat().filter(Boolean));
  return n;
};
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

/* ---------- dados fixos ---------- */
const GENRES = [['Ficção', 'fiction'], ['Fantasia', 'fantasy'], ['Romance', 'romance'], ['Mistério', 'mystery'],
  ['Ficção científica', 'science fiction'], ['Terror', 'horror'], ['Biografia', 'biography'],
  ['História', 'history'], ['Poesia', 'poetry'], ['Quadrinhos', 'comics']];
const ROWS = [
  { id: 'hot', title: 'Em alta agora', q: 'subject:fiction', ranked: true },
  { id: 'new', title: 'Novidades nas estantes', q: 'subject:fiction', order: 'newest' },
  { id: 'fan', title: 'Para quem ama fantasia', q: 'subject:fantasy' },
  { id: 'mys', title: 'Mistérios para a noite', q: 'subject:mystery' }
];
const TABS = { new: { q: 'subject:biography', order: 'newest' }, classics: { q: 'subject:classics' } };

const books = new Map();
let shelf = store.get('folheia:shelf', []);
shelf.forEach(b => books.set(b.id, b));

/* ---------- API do Google Livros ---------- */
const cache = new Map();

function plain(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html.replace(/<br\s*\/?>|<\/p>/gi, '\n'), 'text/html');
  return doc.body.textContent.trim();
}

function norm(item) {
  const v = item.volumeInfo || {}, img = v.imageLinks || {};
  const thumb = (img.thumbnail || img.smallThumbnail || '').replace(/^http:/, 'https:').replace('&edge=curl', '');
  const date = v.publishedDate || '';
  return {
    id: item.id, title: v.title || '', subtitle: v.subtitle || '', authors: v.authors || [],
    description: plain(v.description), thumb, year: date.slice(0, 4), pages: v.pageCount || 0,
    categories: v.categories || [], rating: v.averageRating || 0, preview: v.previewLink || '', info: v.infoLink || ''
  };
}

async function api(q, { order = 'relevance', max = 20, start = 0 } = {}) {
  const params = new URLSearchParams({ q, orderBy: order, maxResults: max, startIndex: start, printType: 'books', langRestrict: 'pt' });
  const url = `https://www.googleapis.com/books/v1/volumes?${params}`;
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then(r => { if (!r.ok) throw Error(r.status); return r.json(); })
      .catch(e => { cache.delete(url); throw e; }));
  }
  const data = await cache.get(url), seen = new Set();
  const items = (data.items || []).map(norm).filter(b => {
    const key = b.title + b.authors;
    if (!b.title || seen.has(key)) return false;
    seen.add(key); books.set(b.id, b);
    return true;
  });
  return { items, raw: (data.items || []).length };
}

/* ---------- componentes ---------- */
const saved = id => shelf.some(b => b.id === id);
const skel = n => Array.from({ length: n }, () => el('div', { class: 'card sk' }));
const authors = b => b.authors.join(', ') || 'Autoria não informada';

function cover(b) {
  const fb = () => el('div', { class: 'fb', 'data-t': b.title.length % 3 }, el('span', { text: b.title }));
  if (!b.thumb) return fb();
  const img = el('img', { src: b.thumb, alt: `Capa de ${b.title}`, loading: 'lazy' });
  img.onerror = () => img.replaceWith(fb());
  return img;
}

function saveBtn(b) {
  return el('button', {
    class: 'save', type: 'button', 'data-id': b.id, 'aria-pressed': saved(b.id),
    'aria-label': `Guardar ${b.title} na estante`, onclick: () => toggle(b), text: '♥'
  });
}

function card(b, rank) {
  return el('article', { class: 'card' },
    el('button', { class: 'open', type: 'button', onclick: () => openBook(b.id) },
      el('span', { class: 'cw' }, cover(b), rank && el('b', { class: 'rank', 'aria-hidden': 'true', text: rank })),
      el('span', { class: 'meta' }, el('span', { text: b.pages ? `${b.pages} págs.` : '' }), el('span', { text: b.year })),
      el('strong', { class: 't', text: b.title }),
      el('span', { class: 'a', text: authors(b) })),
    saveBtn(b));
}

const fail = retry => el('p', { class: 'note' }, 'Não deu para carregar agora. ',
  el('button', { class: 'link', type: 'button', text: 'Tentar de novo', onclick: retry }));

/* ---------- carrosséis ---------- */
function row(c) {
  const track = el('div', { class: 'track', tabindex: '0', 'aria-label': c.title });
  const go = d => track.scrollBy({
    left: d * track.clientWidth * .85,
    behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth'
  });
  const sec = el('section', { class: 'row' },
    el('div', { class: 'row-h' }, el('h2', { text: c.title }),
      el('div', { class: 'ctl' },
        el('a', { class: 'more', href: `#/lista/${c.id}`, text: 'Ver tudo' }),
        el('button', { type: 'button', 'aria-label': 'Anteriores', text: '‹', onclick: () => go(-1) }),
        el('button', { type: 'button', 'aria-label': 'Próximos', text: '›', onclick: () => go(1) }))),
    track);
  const load = async () => {
    track.replaceChildren(...skel(6));
    try {
      const { items } = await api(c.q, { order: c.order });
      const list = items.filter(b => b.thumb).slice(0, 10);
      track.replaceChildren(...(list.length ? list.map((b, i) => card(b, c.ranked && i + 1))
        : [el('p', { class: 'note', text: 'Nenhum livro por aqui ainda.' })]));
    } catch { track.replaceChildren(fail(load)); }
  };
  new IntersectionObserver((e, o) => { if (e[0].isIntersecting) { o.disconnect(); load(); } }, { rootMargin: '300px' }).observe(sec);
  return sec;
}

/* ---------- barra lateral ---------- */
async function side(tab) {
  const list = $('#side-list');
  list.replaceChildren(...skel(4).map(s => el('li', {}, s)));
  try {
    const { items } = await api(TABS[tab].q, { order: TABS[tab].order });
    list.replaceChildren(...items.filter(b => b.thumb).slice(0, 7).map(b =>
      el('li', {}, miniItem(b))));
  } catch { list.replaceChildren(el('li', {}, fail(() => side(tab)))); }
}

function miniItem(b, extra) {
  return el('button', { class: 'mini', type: 'button', onclick: () => { $('#shelf').close(); openBook(b.id); } },
    el('span', { class: 'mc' }, cover(b)),
    el('span', {}, el('small', { text: b.categories[0] || 'Livro' }), el('strong', { text: b.title }),
      el('em', { text: [b.authors[0], b.year].filter(Boolean).join(', ') })));
}

/* ---------- resultados ---------- */
let R = {};
function results(title, q, order = 'relevance') {
  $('#home').hidden = true; $('#results').hidden = false;
  $('#r-title').textContent = title; $('#r-order').value = order;
  $('#r-grid').replaceChildren(); $('#r-note').textContent = '';
  R = { q, order, start: 0 };
  more();
}

async function more() {
  const btn = $('#r-more'), grid = $('#r-grid'), s = skel(6);
  btn.hidden = true; $('#r-note').textContent = ''; grid.append(...s);
  try {
    const { items, raw } = await api(R.q, { order: R.order, max: 24, start: R.start });
    s.forEach(x => x.remove()); R.start += 24;
    grid.append(...items.map(b => card(b)));
    btn.hidden = raw < 24;
    if (!grid.children.length) $('#r-note').textContent = 'Nenhum livro encontrado. Tente outro título, autor ou assunto.';
  } catch {
    s.forEach(x => x.remove());
    $('#r-note').textContent = 'Não foi possível carregar os livros. Tente de novo em instantes.';
    btn.hidden = false;
  }
}

/* ---------- rotas ---------- */
function route() {
  const [k, ...r] = location.hash.slice(2).split('/'), v = decodeURIComponent(r.join('/'));
  $$('.chip').forEach(c => c.setAttribute('aria-current', k === 'genero' && c.dataset.g === v));
  const g = GENRES.find(x => x[1] === v), c = ROWS.find(x => x.id === v);
  if (k === 'busca' && v) { $('#q').value = v; results(`Resultados para “${v}”`, v); }
  else if (k === 'genero' && g) results(g[0], `subject:${v}`);
  else if (k === 'lista' && c) results(c.title, c.q, c.order);
  else { $('#home').hidden = false; $('#results').hidden = true; }
  scrollTo(0, 0);
}

/* ---------- livro e estante ---------- */
function openBook(id) {
  const b = books.get(id);
  if (!b) return;
  const facts = [b.categories[0], b.year, b.pages && `${b.pages} páginas`, b.rating && `Nota ${b.rating}`].filter(Boolean);
  const link = b.preview || b.info;
  $('#book-body').replaceChildren(
    el('div', { class: 'bc' }, el('span', { class: 'mc' }, cover(b))),
    el('div', { class: 'bd' },
      el('h2', { text: b.title }),
      b.subtitle && el('p', { class: 'sub', text: b.subtitle }),
      el('p', { class: 'by', text: authors(b) }),
      el('ul', { class: 'facts' }, facts.map(f => el('li', { text: f }))),
      el('p', { class: 'desc', text: b.description || 'Este livro ainda não tem sinopse no Google Livros.' }),
      el('div', { class: 'acts' },
        el('button', { class: 'btn save-btn', type: 'button', 'data-id': b.id, onclick: () => toggle(b) }),
        link && el('a', { class: 'btn ghost', href: link, target: '_blank', rel: 'noopener', text: 'Ler amostra' }),
        b.authors[0] && el('button', {
          class: 'btn ghost', type: 'button', text: 'Mais deste autor',
          onclick: () => { $('#book').close(); location.hash = `#/busca/${encodeURIComponent(`inauthor:"${b.authors[0]}"`)}`; }
        }))));
  sync();
  $('#book').showModal();
}

function toggle(b) {
  const on = saved(b.id);
  shelf = on ? shelf.filter(x => x.id !== b.id) : [...shelf, { ...b, description: b.description.slice(0, 1200) }];
  store.set('folheia:shelf', shelf);
  sync();
  toast(on ? 'Removido da estante' : 'Guardado na estante');
}

function sync() {
  $$('.save').forEach(s => s.setAttribute('aria-pressed', saved(s.dataset.id)));
  $$('.save-btn').forEach(s => { s.textContent = saved(s.dataset.id) ? 'Na estante ✓' : 'Guardar na estante'; });
  $('#shelf-count').textContent = shelf.length;
  const list = $('#shelf-list');
  list.replaceChildren(...(shelf.length
    ? shelf.map(b => el('li', {}, miniItem(b), el('button', { class: 'link', type: 'button', text: 'Remover', onclick: () => toggle(b) })))
    : [el('li', { class: 'note', text: 'Sua estante está vazia. Toque no ♥ de uma capa para guardar um livro.' })]));
}

let tt;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(tt); tt = setTimeout(() => t.classList.remove('on'), 2200);
}

/* ---------- inicialização ---------- */
ROWS.forEach(c => $('#rows').append(row(c)));
$('#chips').append(...GENRES.map(([label, key]) => el('a', { class: 'chip', href: `#/genero/${key}`, 'data-g': key, text: label })));
side('new'); sync(); route();
addEventListener('hashchange', route);

$('#search').addEventListener('submit', e => {
  e.preventDefault();
  const v = $('#q').value.trim();
  if (v) location.hash = `#/busca/${encodeURIComponent(v)}`;
});
$('#genres-btn').onclick = e => {
  const open = $('#chips').hidden;
  $('#chips').hidden = !open;
  e.currentTarget.setAttribute('aria-expanded', open);
};
$$('.tabs button').forEach(t => t.onclick = () => {
  $$('.tabs button').forEach(x => x.setAttribute('aria-selected', x === t));
  side(t.dataset.tab);
});
$('#r-order').onchange = e => { R.order = e.target.value; R.start = 0; $('#r-grid').replaceChildren(); more(); };
$('#r-more').onclick = more;
$('#shelf-open').onclick = () => $('#shelf').showModal();

$$('dialog').forEach(d => {
  d.addEventListener('click', e => { if (e.target === d) d.close(); });
  $('.x', d).onclick = () => d.close();
});

const applyTheme = t => { document.documentElement.dataset.theme = t; store.set('folheia:theme', t); };
applyTheme(store.get('folheia:theme', matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark'));
$('#theme').onclick = () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

const url = encodeURIComponent(location.href.split('#')[0]);
$('#sh-wa').href = `https://wa.me/?text=${url}`;
$('#sh-tg').href = `https://t.me/share/url?url=${url}`;
$('#sh-copy').onclick = () => navigator.clipboard?.writeText(decodeURIComponent(url)).then(() => toast('Link copiado'));

addEventListener('keydown', e => {
  if (e.key === '/' && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) && !$('dialog[open]')) {
    e.preventDefault(); $('#q').focus();
  }
});
