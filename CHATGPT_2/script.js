const searchInput = document.getElementById("searchInput");
const comicCards = [...document.querySelectorAll(".comic-column")];
const filterButtons = [...document.querySelectorAll(".filter-btn")];
const emptyState = document.getElementById("emptyState");

const themeToggle = document.getElementById("themeToggle");
const exploreBtn = document.getElementById("exploreBtn");
const library = document.getElementById("library");

const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

let activeFilter = "all";


// ==============================
// BUSCA E FILTROS
// ==============================

function updateCards() {
    const query = searchInput.value.trim().toLowerCase();

    let visibleCards = 0;

    comicCards.forEach((card) => {

        const title = card.dataset.title.toLowerCase();
        const type = card.dataset.type;

        const matchesSearch = title.includes(query);

        const matchesFilter =
            activeFilter === "all" ||
            type === activeFilter;

        const shouldShow =
            matchesSearch && matchesFilter;

        if (shouldShow) {
            card.classList.remove("d-none");
            visibleCards++;
        } else {
            card.classList.add("d-none");
        }
    });

    // Mostra mensagem caso nenhum resultado seja encontrado
    if (visibleCards === 0) {
        emptyState.classList.remove("d-none");
    } else {
        emptyState.classList.add("d-none");
    }
}


// Pesquisa enquanto o usuário digita
if (searchInput) {
    searchInput.addEventListener("input", updateCards);
}


// ==============================
// FILTROS
// ==============================

filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

        activeFilter = button.dataset.filter;

        // Remove o estado ativo dos outros botões
        filterButtons.forEach((item) => {
            item.classList.remove("active");
        });

        // Ativa o botão selecionado
        button.classList.add("active");

        updateCards();
    });

});


// ==============================
// FAVORITOS
// ==============================

const bookmarkButtons =
    document.querySelectorAll(".bookmark");

bookmarkButtons.forEach((button) => {

    button.addEventListener("click", () => {

        button.classList.toggle("active");

        const icon = button.querySelector("i");

        if (button.classList.contains("active")) {

            icon.classList.remove("bi-bookmark");
            icon.classList.add("bi-bookmark-fill");

        } else {

            icon.classList.remove("bi-bookmark-fill");
            icon.classList.add("bi-bookmark");
        }

    });

});


// ==============================
// TEMA CLARO / ESCURO
// ==============================

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        document.body.classList.toggle("dark");

        const icon = themeToggle.querySelector("i");

        const isDark =
            document.body.classList.contains("dark");

        if (isDark) {

            icon.classList.remove("bi-moon-stars");
            icon.classList.add("bi-sun");

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light theme"
            );

        } else {

            icon.classList.remove("bi-sun");
            icon.classList.add("bi-moon-stars");

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark theme"
            );
        }

    });

}


// ==============================
// BOTÃO "EXPLORE LIBRARY"
// ==============================

if (exploreBtn && library) {

    exploreBtn.addEventListener("click", () => {

        library.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

}


// ==============================
// ATALHO "/" PARA PESQUISA
// ==============================

document.addEventListener("keydown", (event) => {

    // Pressionar "/" abre a pesquisa
    if (
        event.key === "/" &&
        document.activeElement !== searchInput
    ) {

        event.preventDefault();

        if (searchInput) {
            searchInput.focus();
        }
    }


    // Pressionar ESC limpa a pesquisa
    if (
        event.key === "Escape" &&
        document.activeElement === searchInput
    ) {

        searchInput.value = "";

        searchInput.blur();

        updateCards();
    }

});


// ==============================
// BOTÃO PRÓXIMO
// ==============================

if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        const visibleCards =
            comicCards.filter(
                card => !card.classList.contains("d-none")
            );

        if (visibleCards.length === 0) {
            return;
        }

        // Pequena animação
        visibleCards.forEach(card => {
            card.style.opacity = "0.4";
            card.style.transform = "translateY(5px)";
        });

        setTimeout(() => {

            visibleCards.forEach(card => {
                card.style.opacity = "";
                card.style.transform = "";
            });

        }, 200);

    });

}


// ==============================
// BOTÃO ANTERIOR
// ==============================

if (prevBtn) {

    prevBtn.addEventListener("click", () => {

        if (library) {

            library.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }

    });

}


// ==============================
// BOTÕES "CONTINUE"
// ==============================

const continueButtons =
    document.querySelectorAll(".continue-btn");

continueButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const originalContent = button.innerHTML;

        button.innerHTML =
            'Opening <i class="bi bi-arrow-right"></i>';

        button.disabled = true;

        setTimeout(() => {

            button.innerHTML = originalContent;
            button.disabled = false;

        }, 900);

    });

});


// ==============================
// INICIALIZAÇÃO
// ==============================

updateCards();