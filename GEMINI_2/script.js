/**
 * Aetheria Reader - Frontend Logic
 */

// Mock Dataset para Mangás/Manhwas
const popularComics = [
    {
      id: 1,
      title: "The Sovereign Rogue Prince",
      tag: "Manhwa",
      chapter: "Cap. 56",
      timeAgo: "há 10 min",
      rank: "#1",
      bgGradient: "from-amber-500/80 via-slate-900 to-black",
      color: "amber-400"
    },
    {
      id: 2,
      title: "ECHOES: Path of the Saintess",
      tag: "Manhwa",
      chapter: "Cap. 43",
      timeAgo: "há 1 hora",
      rank: "#2",
      bgGradient: "from-pink-500/80 via-slate-900 to-black",
      color: "pink-400"
    },
    {
      id: 3,
      title: "The Eldest Daughter's Regret",
      tag: "Manhwa",
      chapter: "Cap. 81",
      timeAgo: "há 2 horas",
      rank: "#3",
      bgGradient: "from-cyan-500/80 via-slate-900 to-black",
      color: "cyan-400"
    },
    {
      id: 4,
      title: "Boundless Spatial Mage",
      tag: "Manga",
      chapter: "Cap. 29",
      timeAgo: "há 3 horas",
      rank: "#4",
      bgGradient: "from-emerald-500/80 via-slate-900 to-black",
      color: "emerald-400"
    },
    {
      id: 5,
      title: "Regressors Never Die",
      tag: "Manhwa",
      chapter: "Cap. 12",
      timeAgo: "há 4 horas",
      rank: "#5",
      bgGradient: "from-purple-500/80 via-slate-900 to-black",
      color: "purple-400"
    }
  ];
  
  const latestComics = [
    { title: "The Flower That Fell Into Ayakashi", tag: "Manga", chapter: "Cap. 14.2", time: "há 15 min" },
    { title: "Undefinedtale [Season 2]", tag: "Outros", chapter: "Cap. 888", time: "há 2 horas" },
    { title: "Hero Returns After Millionth Time", tag: "Manhwa", chapter: "Cap. 13", time: "há 3 horas" },
    { title: "Guilty Library & The Lost Archmage", tag: "Manga", chapter: "Cap. 01.1", time: "há 5 horas" }
  ];
  
  const sidebarComics = [
    { title: "Becoming Beloved From Age 0", tag: "Manhwa", chapter: "Cap. 12" },
    { title: "The Blind Saintess Arc", tag: "Manga", chapter: "Cap. 05" },
    { title: "Rogue Sorcerer in Academy", tag: "Manhwa", chapter: "Cap. 90" },
    { title: "Solo Leveling: Ragnarok", tag: "Manhwa", chapter: "Cap. 30" }
  ];
  
  // Renderizar Populares
  function renderPopular() {
    const container = document.getElementById("popularGrid");
    if (!container) return;
  
    container.innerHTML = popularComics.map(item => `
      <div class="manga-card group relative rounded-xl overflow-hidden bg-[#161824] border border-slate-800 shadow-md hover:border-purple-500/40 transition-all cursor-pointer">
        <div class="card-aspect w-full bg-gradient-to-b ${item.bgGradient} relative overflow-hidden flex items-end p-3">
          <!-- Rank Badge -->
          <span class="absolute top-2 left-2 text-[10px] font-black tracking-wider text-black bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm">
            ${item.rank}
          </span>
          <!-- Tag -->
          <span class="absolute top-2 right-2 text-[9px] font-semibold text-slate-300 bg-slate-950/70 backdrop-blur-sm px-1.5 py-0.5 rounded">
            ${item.tag}
          </span>
          
          <!-- Bottom Overlay Info inside cover -->
          <div class="relative z-10 w-full space-y-1">
            <div class="flex items-center justify-between text-[10px] text-slate-300 font-medium">
              <span class="text-purple-300 font-semibold">${item.chapter}</span>
              <span class="text-slate-400">${item.timeAgo}</span>
            </div>
          </div>
        </div>
        <div class="p-3">
          <h4 class="text-xs font-bold text-slate-200 group-hover:text-purple-300 transition-colors line-clamp-2">
            ${item.title}
          </h4>
        </div>
      </div>
    `).join('');
  }
  
  // Renderizar Lançamentos Recentes
  function renderLatest() {
    const container = document.getElementById("latestGrid");
    if (!container) return;
  
    container.innerHTML = latestComics.map(item => `
      <div class="flex items-center gap-3 p-3 rounded-xl bg-[#161824] border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group">
        <div class="w-12 h-16 rounded-lg bg-gradient-to-br from-indigo-900 to-slate-900 shrink-0 border border-slate-700/50 flex items-center justify-center text-slate-500 text-xs">
          <i class="fa-solid fa-book-open"></i>
        </div>
        <div class="flex-1 min-w-0">
          <span class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">${item.tag}</span>
          <h4 class="text-xs font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors truncate">
            ${item.title}
          </h4>
          <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
            <span class="text-slate-300 font-medium">${item.chapter}</span>
            <span class="text-slate-500">&bull;</span>
            <span>${item.time}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
  
  // Renderizar Sidebar
  function renderSidebar() {
    const container = document.getElementById("sidebarList");
    if (!container) return;
  
    container.innerHTML = sidebarComics.map(item => `
      <div class="flex items-center justify-between gap-2 p-2 rounded-lg hover:bg-slate-800/50 transition-colors cursor-pointer group">
        <div class="min-w-0 flex-1">
          <h5 class="text-xs font-medium text-slate-300 group-hover:text-purple-300 truncate">${item.title}</h5>
          <span class="text-[10px] text-slate-500">${item.tag}</span>
        </div>
        <span class="text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded shrink-0">
          ${item.chapter}
        </span>
      </div>
    `).join('');
  }
  
  // Interatividade Intermediária
  function setupEventListeners() {
    const copyBtn = document.getElementById("copyLinkBtn");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      });
    }
  
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        console.log("Buscando por:", query);
      });
    }
  }
  
  // Inicialização da aplicação
  document.addEventListener("DOMContentLoaded", () => {
    renderPopular();
    renderLatest();
    renderSidebar();
    setupEventListeners();
  });