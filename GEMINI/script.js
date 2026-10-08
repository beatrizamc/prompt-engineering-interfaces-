// URL base da API do Google Books
const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

// Seletores DOM
const popularGrid = document.getElementById('popularBooksGrid');
const recommendedGrid = document.getElementById('recommendedBooksGrid');
const recentList = document.getElementById('recentBooksList');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryTags = document.querySelectorAll('.categories-tags .tag');

// Inicialização ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  fetchPopularBooks('fiction');
  fetchRecommendedBooks();
  fetchRecentBooks();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  // Busca por botão e Enter
  searchBtn.addEventListener('click', handleSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Filtros de Categorias
  categoryTags.forEach((tag) => {
    tag.addEventListener('click', (e) => {
      categoryTags.forEach((t) => t.classList.remove('active'));
      e.target.classList.add('active');
      const subject = e.target.dataset.subject;
      fetchPopularBooks(subject);
    });
  });
}

// Handler de Pesquisa
function handleSearch() {
  const query = searchInput.value.trim();
  if (query) {
    searchBooks(query);
  }
}

// 1. Buscar livros mais populares por assunto
async function fetchPopularBooks(subject = 'fiction') {
  popularGrid.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Carregando...</div>`;
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=subject:${subject}&orderBy=relevance&maxResults=10`);
    const data = await response.json();
    renderBooksGrid(popularGrid, data.items || [], true);
  } catch (error) {
    console.error('Erro ao buscar livros populares:', error);
    popularGrid.innerHTML = `<p>Ocorreu um erro ao carregar os livros.</p>`;
  }
}

// 2. Buscar livros bem avaliados / recomendados
async function fetchRecommendedBooks() {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=bestseller&maxResults=5`);
    const data = await response.json();
    renderBooksGrid(recommendedGrid, data.items || [], false);
  } catch (error) {
    console.error('Erro ao buscar recomendações:', error);
  }
}

// 3. Buscar lançamentos/recentes para a barra lateral
async function fetchRecentBooks() {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=new&orderBy=newest&maxResults=6`);
    const data = await response.json();
    renderSidebarList(recentList, data.items || []);
  } catch (error) {
    console.error('Erro ao buscar recentes:', error);
  }
}

// 4. Buscar por termo específico
async function searchBooks(query) {
  popularGrid.innerHTML = `<div class="loading-spinner"><i class="fa-solid fa-circle-notch fa-spin"></i> Pesquisando "${query}"...</div>`;
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=10`);
    const data = await response.json();
    renderBooksGrid(popularGrid, data.items || [], false);
  } catch (error) {
    console.error('Erro na pesquisa:', error);
  }
}

// RENDERIZADORES DE INTERFACE (UI)

function renderBooksGrid(container, books, showRank = false) {
  if (books.length === 0) {
    container.innerHTML = `<p>Nenhum livro encontrado.</p>`;
    return;
  }

  container.innerHTML = books.map((book, index) => {
    const info = book.volumeInfo;
    const thumbnail = info.imageLinks?.thumbnail || 'https://via.placeholder.com/128x192?text=Sem+Capa';
    const title = info.title || 'Título Indisponível';
    const author = info.authors ? info.authors.join(', ') : 'Autor Desconhecido';
    const rating = info.averageRating ? info.averageRating.toFixed(1) : (Math.random() * (5 - 4) + 4).toFixed(1);

    return `
      <div class="book-card">
        <div class="cover-container">
          ${showRank ? `<span class="rank-badge">#\${index + 1}</span>` : ''}
          <img class="book-cover" src="${thumbnail.replace('http:', 'https:')}" alt="${title}" loading="lazy">
        </div>
        <div class="book-info">
          <h3 class="book-title" title="${title}">${title}</h3>
          <p class="book-author">${author}</p>
          <div class="book-footer">
            <span class="rating"><i class="fa-solid fa-star"></i> ${rating}</span>
            <span class="pages"><i class="fa-solid fa-book-open"></i> ${info.pageCount || '---'}p</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function renderSidebarList(container, books) {
  if (books.length === 0) {
    container.innerHTML = `<p>Sem dados.</p>`;
    return;
  }

  container.innerHTML = books.map((book) => {
    const info = book.volumeInfo;
    const thumbnail = info.imageLinks?.smallThumbnail || info.imageLinks?.thumbnail || 'https://via.placeholder.com/48x68?text=N/A';
    const title = info.title || 'Sem título';
    const category = info.categories ? info.categories[0] : 'Geral';

    return `
      <div class="recent-item">
        <img class="recent-thumb" src="${thumbnail.replace('http:', 'https:')}" alt="${title}">
        <div class="recent-details">
          <h4 class="recent-title" title="${title}">${title}</h4>
          <p class="recent-meta">${category}</p>
        </div>
      </div>
    `;
  }).join('');
}