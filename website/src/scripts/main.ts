export {};

const dialog = document.querySelector<HTMLDialogElement>("#install-dialog");
let activeOpener: HTMLElement | null = null;

function showDownloadToast() {
  let toast = document.querySelector<HTMLElement>("#download-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "download-toast";
    toast.className = "download-toast";
    toast.innerHTML = `
      <div class="toast-content">
        <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <div class="toast-text">
          <strong>Baixando Mano.apk...</strong>
          <span>Verifique a barra de notificações para instalar.</span>
        </div>
      </div>
    `;
    document.body.appendChild(toast);
  }
  toast.classList.add("show");
  setTimeout(() => {
    toast?.classList.remove("show");
  }, 4500);
}

// Manipulador dedicado para todos os botões Android (Download único sem duplicidade)
let isDownloading = false;
document
  .querySelectorAll<HTMLAnchorElement>(".install-android, #android-direct-btn, [data-install='android']")
  .forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (isDownloading) return;
      isDownloading = true;
      showDownloadToast();
      window.location.assign("/downloads/Mano.apk");
      setTimeout(() => {
        isDownloading = false;
      }, 4000);
    });
  });

if (dialog) {
  // Apenas links do iOS abrem o modal
  document
    .querySelectorAll<HTMLElement>("[data-install='ios'], #appleInstallIphoneBtn")
    .forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        activeOpener = link;

        const titleEl = document.querySelector("#install-sheet-title");
        const subTitleEl = document.querySelector("#install-sheet-subtitle");
        const iosLink = document.querySelector<HTMLAnchorElement>("#sheet-app-link");
        const androidFlow = document.querySelector<HTMLElement>("#modal-android-flow");

        if (titleEl) titleEl.textContent = "Instalar no iPhone";
        if (subTitleEl) subTitleEl.textContent = "4 passos simples no seu navegador:";
        if (iosLink) {
          iosLink.style.display = "block";
          iosLink.href = "https://manaus-live-transit.vercel.app/";
        }
        if (androidFlow) androidFlow.style.display = "none";

        dialog.showModal();
      });
    });

  const closeBtn = dialog.querySelector(".dialog-close");
  closeBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    dialog.close();
  });
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      const r = dialog.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => activeOpener?.focus());
}

// 2. HIGHLIGHTS RIBBON CAROUSEL CONTROLS (MOUSE DRAG + TOUCH SWIPE FLUIDO)
(() => {
  const scroller = document.querySelector<HTMLElement>(".apple-highlights-track-wrapper");
  const track = document.getElementById("highlightsTrack");
  const prevBtn = document.getElementById("highlightsPrevBtn") as HTMLButtonElement | null;
  const nextBtn = document.getElementById("highlightsNextBtn") as HTMLButtonElement | null;
  const paginationDots = document.querySelectorAll<HTMLButtonElement>(".pagination-dot");
  if (!scroller || !track) return;

  const getStepWidth = () => {
    const firstCard = track.firstElementChild as HTMLElement | null;
    return (firstCard?.clientWidth || 380) + 24;
  };

  const updateButtons = () => {
    const maxScroll = scroller.scrollWidth - scroller.clientWidth;
    if (prevBtn) prevBtn.disabled = scroller.scrollLeft <= 10;
    if (nextBtn) nextBtn.disabled = scroller.scrollLeft >= maxScroll - 10;

    const stepWidth = getStepWidth();
    const activeIndex = Math.min(
      paginationDots.length - 1,
      Math.max(0, Math.round(scroller.scrollLeft / stepWidth))
    );
    paginationDots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === activeIndex);
    });
  };

  scroller.addEventListener("scroll", updateButtons, { passive: true });

  prevBtn?.addEventListener("click", () => {
    scroller.scrollBy({ left: -getStepWidth(), behavior: "smooth" });
  });

  nextBtn?.addEventListener("click", () => {
    scroller.scrollBy({ left: getStepWidth(), behavior: "smooth" });
  });

  paginationDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.index || 0);
      scroller.scrollTo({ left: idx * getStepWidth(), behavior: "smooth" });
    });
  });

  // Mouse Drag Support
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  scroller.addEventListener("mousedown", (e) => {
    isDown = true;
    scroller.style.cursor = "grabbing";
    scroller.style.userSelect = "none";
    startX = e.pageX - scroller.offsetLeft;
    scrollStart = scroller.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    if (isDown) {
      isDown = false;
      if (scroller) {
        scroller.style.cursor = "grab";
        scroller.style.removeProperty("user-select");
      }
    }
  });

  scroller.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - scroller.offsetLeft;
    const walk = (x - startX) * 1.5;
    scroller.scrollLeft = scrollStart - walk;
  });

  // Touch Swipe Support
  scroller.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    scrollStart = scroller.scrollLeft;
  }, { passive: true });

  scroller.addEventListener("touchmove", (e) => {
    const currentX = e.touches[0].clientX;
    const walk = (currentX - startX) * 1.3;
    scroller.scrollLeft = scrollStart - walk;
  }, { passive: true });

  updateButtons();
})();

// 3. SISTEMA (SESSÃO 3) - CONTROLE DE ABAS DO APLICATIVO
(() => {
  const tabBtns = document.querySelectorAll<HTMLButtonElement>("[data-app-tab], [data-sys-tab]");
  const screens = document.querySelectorAll<HTMLElement>(".app-screen-view, .system-screen-view");
  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.appTab || btn.dataset.sysTab;
      tabBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      screens.forEach((sc) => {
        const isTarget = sc.id === `appScreen-${targetId}` || sc.id === `sysView-${targetId}`;
        sc.classList.toggle("active", isTarget);
      });
    });
  });
})();

// 4. ALERTAS (SESSÃO 7) - FILTRO DE CATEGORIAS
(() => {
  const filterBtns = document.querySelectorAll<HTMLButtonElement>(".alert-filter-pill");
  const alertCards = document.querySelectorAll<HTMLElement>(".native-alert-card");
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const label = btn.textContent?.trim().toLowerCase();
      alertCards.forEach((card) => {
        if (!label || label === "todos") {
          card.style.display = "block";
        } else if (label === "acidentes" || label === "lentidão") {
          card.style.display = card.classList.contains("card-orange") ? "block" : "none";
        } else if (label === "fiscalização") {
          card.style.display = card.classList.contains("card-blue") ? "block" : "none";
        } else {
          card.style.display = "block";
        }
      });
    });
  });
})();

// Suporte a scroll instantâneo para inspeção e testes visuais de seções
(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.has("y")) {
    const y = Number(params.get("y"));
    window.scrollTo({ top: y, behavior: "instant" });
  }
})();
