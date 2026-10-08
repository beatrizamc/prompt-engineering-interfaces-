/* =====================================================
   LUNARIA BOOKS
   SCRIPT.JS
===================================================== */


/* ================= API ================= */

const API_URL = "https://www.googleapis.com/books/v1/volumes";


/* ================= ELEMENTS ================= */

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

const featuredBooks = document.getElementById("featuredBooks");
const popularBooks = document.getElementById("popularBooks");

const searchResults = document.getElementById("searchResults");
const searchResultsSection =
    document.getElementById("searchResultsSection");

const resultsTitle =
    document.getElementById("resultsTitle");

const favoritesSection =
    document.getElementById("favoritesSection");

const favoriteBooks =
    document.getElementById("favoriteBooks");

const bookModal =
    document.getElementById("bookModal");

const modalContent =
    document.getElementById("modalContent");

const closeModal =
    document.getElementById("closeModal");

const toast =
    document.getElementById("toast");

const toastMessage =
    document.getElementById("toastMessage");

const themeButton =
    document.getElementById("themeButton");

const menuButton =
    document.getElementById("menuButton");

const mobileMenu =
    document.getElementById("mobileMenu");

const exploreButton =
    document.getElementById("exploreButton");

const newsletterForm =
    document.getElementById("newsletterForm");


/* ================= FAVORITES ================= */

let favorites =
    JSON.parse(localStorage.getItem("lunariaFavorites")) || [];


/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

    loadFeaturedBooks();
    loadPopularBooks();

    setupCategories();
    setupEvents();

    updateTheme();

});


/* ================= EVENTS ================= */

function setupEvents() {

    searchButton.addEventListener(
        "click",
        performSearch
    );

    searchInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                performSearch();
            }

        }
    );


    exploreButton.addEventListener(
        "click",
        () => {

            document
                .getElementById("featuredSection")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );


    themeButton.addEventListener(
        "click",
        toggleTheme
    );


    menuButton.addEventListener(
        "click",
        () => {

            mobileMenu.classList.toggle("active");

        }
    );


    document
        .getElementById("favoritesButton")
        .addEventListener(
            "click",
            showFavorites
        );


    closeModal.addEventListener(
        "click",
        closeBookModal
    );


    bookModal.addEventListener(
        "click",
        event => {

            if (event.target === bookModal) {
                closeBookModal();
            }

        }
    );


    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeBookModal();
            }

        }
    );


    newsletterForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            showToast(
                "Você entrou para o Clube Lunaria ✦"
            );

            newsletterForm.reset();

        }
    );


    document
        .querySelectorAll(".mobile-menu button")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const section =
                        button.dataset.section;

                    mobileMenu.classList.remove("active");

                    if (section === "favorites") {
                        showFavorites();
                    }

                    if (section === "home") {

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }

                }
            );

        });

}


/* ================= GOOGLE BOOKS API ================= */

async function fetchBooks(query, maxResults = 10) {

    try {

        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&printType=books&orderBy=relevance`
        );

        if (!response.ok) {
            throw new Error(
                "Erro ao consultar a API."
            );
        }

        const data = await response.json();

        return data.items || [];

    } catch (error) {

        console.error(error);

        return [];

    }

}


/* ================= FEATURED ================= */

async function loadFeaturedBooks() {

    featuredBooks.innerHTML = loadingHTML();

    const books = await fetchBooks(
        "fiction",
        10
    );

    if (!books.length) {

        featuredBooks.innerHTML =
            errorHTML(
                "Não conseguimos encontrar livros agora."
            );

        return;
    }

    renderBooks(
        books.slice(0, 5),
        featuredBooks
    );

}


/* ================= POPULAR ================= */

async function loadPopularBooks() {

    popularBooks.innerHTML = loadingHTML();

    const books = await fetchBooks(
        "bestseller fiction",
        10
    );

    if (!books.length) {

        popularBooks.innerHTML =
            errorHTML(
                "Não conseguimos carregar os livros."
            );

        return;
    }

    renderBooks(
        books.slice(0, 5),
        popularBooks
    );

}


/* ================= SEARCH ================= */

async function performSearch() {

    const query =
        searchInput.value.trim();

    if (!query) {

        searchInput.focus();

        return;
    }


    searchResultsSection.hidden = false;

    resultsTitle.textContent =
        `Resultados para "${query}"`;

    searchResults.innerHTML =
        loadingHTML();


    searchResultsSection.scrollIntoView({
        behavior: "smooth"
    });


    const books =
        await fetchBooks(
            query,
            20
        );


    if (!books.length) {

        searchResults.innerHTML =
            errorHTML(
                "Nenhum livro encontrado. Tente outro termo."
            );

        return;
    }


    renderBooks(
        books,
        searchResults
    );

}


/* ================= CATEGORIES ================= */

function setupCategories() {

    document
        .querySelectorAll(".category")
        .forEach(category => {

            category.addEventListener(
                "click",
                async () => {

                    document
                        .querySelectorAll(".category")
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });


                    category.classList.add(
                        "active"
                    );


                    const query =
                        category.dataset.query;


                    featuredBooks.innerHTML =
                        loadingHTML();


                    const books =
                        await fetchBooks(
                            query,
                            10
                        );


                    renderBooks(
                        books,
                        featuredBooks
                    );


                    document
                        .getElementById("featuredSection")
                        .scrollIntoView({
                            behavior: "smooth"
                        });

                }
            );

        });

}


/* ================= RENDER BOOKS ================= */

function renderBooks(
    books,
    container
) {

    if (!books.length) {

        container.innerHTML =
            errorHTML(
                "Nenhum livro encontrado."
            );

        return;
    }


    container.innerHTML =
        books.map(
            book => createBookCard(book)
        ).join("");


    container
        .querySelectorAll(".book-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                event => {

                    if (
                        event.target.closest(
                            ".favorite-button"
                        )
                    ) {
                        return;
                    }

                    const id =
                        card.dataset.id;

                    const book =
                        books.find(
                            item =>
                                item.id === id
                        );

                    if (book) {
                        openBookModal(book);
                    }

                }
            );

        });


    container
        .querySelectorAll(".favorite-button")
        .forEach(button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const id =
                        button.dataset.id;

                    toggleFavorite(id);

                    button.classList.toggle(
                        "active"
                    );

                    button.innerHTML =
                        isFavorite(id)
                            ? '<i class="fa-solid fa-heart"></i>'
                            : '<i class="fa-regular fa-heart"></i>';

                }
            );

        });

}


/* ================= BOOK CARD ================= */

function createBookCard(book) {

    const info =
        book.volumeInfo || {};


    const title =
        info.title || "Título desconhecido";


    const authors =
        info.authors
            ? info.authors.join(", ")
            : "Autor desconhecido";


    const image =
        getBookImage(info);


    const rating =
        info.averageRating
            ? info.averageRating.toFixed(1)
            : "—";


    const favorite =
        isFavorite(book.id);


    return `

        <article
            class="book-card"
            data-id="${book.id}"
        >

            <div class="book-cover-container">

                <img
                    class="book-cover"
                    src="${image}"
                    alt="Capa de ${escapeHTML(title)}"
                    loading="lazy"
                >

                <button
                    class="favorite-button ${favorite ? "active" : ""}"
                    data-id="${book.id}"
                    aria-label="Favoritar livro"
                >
                    <i class="${favorite
                        ? "fa-solid"
                        : "fa-regular"
                    } fa-heart"></i>
                </button>

            </div>

            <div class="book-info">

                <h3 class="book-title">
                    ${escapeHTML(title)}
                </h3>

                <p class="book-author">
                    ${escapeHTML(authors)}
                </p>

                <div class="book-rating">

                    <i class="fa-solid fa-star"></i>

                    <span>
                        ${rating}
                    </span>

                </div>

            </div>

        </article>

    `;

}


/* ================= BOOK IMAGE ================= */

function getBookImage(info) {

    if (
        info.imageLinks &&
        info.imageLinks.thumbnail
    ) {

        return info.imageLinks.thumbnail
            .replace(
                "http://",
                "https://"
            );

    }


    return "https://via.placeholder.com/300x450?text=Sem+Capa";

}


/* ================= MODAL ================= */

function openBookModal(book) {

    const info =
        book.volumeInfo || {};


    const title =
        info.title || "Título desconhecido";


    const authors =
        info.authors
            ? info.authors.join(", ")
            : "Autor desconhecido";


    const description =
        info.description ||
        "Este livro não possui uma descrição disponível.";


    const image =
        getBookImage(info);


    const published =
        info.publishedDate ||
        "Data desconhecida";


    const categories =
        info.categories || [];


    const pageCount =
        info.pageCount
            ? `${info.pageCount} páginas`
            : "Páginas não informadas";


    const preview =
        info.previewLink || "#";


    modalContent.innerHTML = `

        <div class="modal-book">

            <img
                src="${image}"
                alt="Capa de ${escapeHTML(title)}"
            >

            <div class="modal-details">

                <span class="small-label">
                    DETALHES DO LIVRO
                </span>

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <p class="modal-author">
                    ${escapeHTML(authors)}
                </p>

                <div class="modal-meta">

                    <span class="meta-tag">
                        ${published}
                    </span>

                    <span class="meta-tag">
                        ${pageCount}
                    </span>

                    ${
                        categories
                            .slice(0, 2)
                            .map(
                                category =>
                                    `<span class="meta-tag">
                                        ${escapeHTML(category)}
                                    </span>`
                            )
                            .join("")
                    }

                </div>

                <p class="modal-description">
                    ${escapeHTML(
                        cleanDescription(description)
                    )}
                </p>

                ${
                    preview !== "#"
                        ? `
                            <a
                                href="${preview}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="google-button"
                            >
                                Ver no Google Books
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        `
                        : ""
                }

            </div>

        </div>

    `;


    bookModal.classList.add("active");

    bookModal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";

}


/* ================= CLOSE MODAL ================= */

function closeBookModal() {

    bookModal.classList.remove(
        "active"
    );

    bookModal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.style.overflow =
        "";

}


/* ================= FAVORITES ================= */

function isFavorite(id) {

    return favorites.includes(id);

}


function toggleFavorite(id) {

    if (isFavorite(id)) {

        favorites =
            favorites.filter(
                favoriteId =>
                    favoriteId !== id
            );

        showToast(
            "Livro removido dos favoritos."
        );

    } else {

        favorites.push(id);

        showToast(
            "Livro adicionado aos favoritos."
        );

    }


    localStorage.setItem(
        "lunariaFavorites",
        JSON.stringify(favorites)
    );

}


/* ================= SHOW FAVORITES ================= */

async function showFavorites() {

    favoritesSection.hidden = false;

    favoriteBooks.innerHTML =
        loadingHTML();


    if (!favorites.length) {

        favoriteBooks.innerHTML = `

            <div class="error-message">

                <i
                    class="fa-regular fa-heart"
                    style="font-size: 30px; margin-bottom: 15px;"
                ></i>

                <p>
                    Você ainda não possui livros favoritos.
                </p>

            </div>

        `;

        favoritesSection.scrollIntoView({
            behavior: "smooth"
        });

        return;
    }


    const books = [];


    for (const id of favorites) {

        try {

            const response =
                await fetch(
                    `${API_URL}/${id}`
                );

            if (response.ok) {

                const book =
                    await response.json();

                books.push(book);

            }

        } catch (error) {

            console.error(error);

        }

    }


    renderBooks(
        books,
        favoriteBooks
    );


    favoritesSection.scrollIntoView({
        behavior: "smooth"
    });

}


/* ================= THEME ================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const darkMode =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        "lunariaTheme",
        darkMode
            ? "dark"
            : "light"
    );


    updateTheme();

}


function updateTheme() {

    const darkMode =
        localStorage.getItem(
            "lunariaTheme"
        ) === "dark";


    if (darkMode) {

        document.body.classList.add(
            "dark-mode"
        );

        themeButton.innerHTML =
            '<i class="fa-solid fa-sun"></i>';

    } else {

        document.body.classList.remove(
            "dark-mode"
        );

        themeButton.innerHTML =
            '<i class="fa-regular fa-moon"></i>';

    }

}


/* ================= TOAST ================= */

function showToast(message) {

    toastMessage.textContent =
        message;

    toast.classList.add(
        "show"
    );


    setTimeout(() => {

        toast.classList.remove(
            "show"
        );

    }, 2500);

}


/* ================= HELPERS ================= */

function loadingHTML() {

    return `

        <div class="loading">

            <div class="loader"></div>

            <p>
                Buscando histórias...
            </p>

        </div>

    `;

}


function errorHTML(message) {

    return `

        <div class="error-message">

            <i
                class="fa-regular fa-face-frown"
                style="font-size: 28px; margin-bottom: 10px;"
            ></i>

            <p>
                ${message}
            </p>

        </div>

    `;

}


function cleanDescription(text) {

    return text
        .replace(/<[^>]*>/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 600);

}


function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}