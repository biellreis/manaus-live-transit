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
        <span class="toast-icon">⬇</span>
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
  const track = document.getElementById("highlightsTrack");
  const prevBtn = document.getElementById("highlightsPrevBtn") as HTMLButtonElement | null;
  const nextBtn = document.getElementById("highlightsNextBtn") as HTMLButtonElement | null;
  const paginationDots = document.querySelectorAll<HTMLButtonElement>(".pagination-dot");
  if (!track) return;

  const updateButtons = () => {
    if (prevBtn) prevBtn.disabled = track.scrollLeft <= 10;
    if (nextBtn)
      nextBtn.disabled =
        track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;

    const firstCard = track.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth || 400;
    const activeIndex = Math.round(track.scrollLeft / (cardWidth + 24));
    paginationDots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === activeIndex);
    });
  };

  prevBtn?.addEventListener("click", () => {
    const firstCard = track.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth || 400;
    track.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" });
  });

  nextBtn?.addEventListener("click", () => {
    const firstCard = track.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth || 400;
    track.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
  });

  paginationDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.index || 0);
      const firstCard = track.firstElementChild as HTMLElement | null;
      const cardWidth = firstCard?.clientWidth || 400;
      track.scrollTo({ left: idx * (cardWidth + 24), behavior: "smooth" });
    });
  });

  // Mouse Drag Support
  let isDown = false;
  let startX = 0;
  let scrollStart = 0;

  track.addEventListener("mousedown", (e) => {
    isDown = true;
    track.style.cursor = "grabbing";
    startX = e.pageX - track.offsetLeft;
    scrollStart = track.scrollLeft;
  });

  window.addEventListener("mouseup", () => {
    if (isDown) {
      isDown = false;
      if (track) track.style.cursor = "grab";
    }
  });

  track.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - track.offsetLeft;
    const walk = (x - startX) * 1.5;
    track.scrollLeft = scrollStart - walk;
  });

  // Touch Swipe Support
  track.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    scrollStart = track.scrollLeft;
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    track.scrollLeft = scrollStart + diff;
  }, { passive: true });

  track.addEventListener("scroll", updateButtons, { passive: true });
  updateButtons();
})();

// 3. SISTEMA (SESSÃO 3) - CONTROLE DE ABAS MINIMALISTA
(() => {
  const tabBtns = document.querySelectorAll<HTMLButtonElement>("[data-sys-tab]");
  const screens = document.querySelectorAll<HTMLElement>(".system-screen-view");
  if (!tabBtns.length) return;

  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.sysTab;
      tabBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      screens.forEach((sc) => {
        const isTarget = sc.id === `sysView-${targetId}`;
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
