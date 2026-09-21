export {};

// 0. Previne restauração automática de scroll do navegador (especialmente no mobile)
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function forceHeroTop() {
  if (window.location.hash) {
    try {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (_) {}
  }
  window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;
}

// Executa em todas as etapas de carregamento e montagem
forceHeroTop();
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", forceHeroTop);
}
window.addEventListener("pageshow", forceHeroTop);
window.addEventListener("load", () => {
  forceHeroTop();
  setTimeout(forceHeroTop, 50);
  setTimeout(forceHeroTop, 150);
  setTimeout(() => {
    forceHeroTop();
    document.documentElement.classList.add("smooth-scroll");
  }, 450);
});

// Intercepta cliques de links internos para rolar suavemente sem sujar a URL com hash
document.querySelectorAll<HTMLElement>("[data-scroll-to], a[href^='#']").forEach((el) => {
  el.addEventListener("click", (e) => {
    const rawTarget = el.getAttribute("data-scroll-to") || el.getAttribute("href") || "";
    const cleanId = rawTarget.replace("#", "").trim();
    if (!cleanId) return;

    e.preventDefault();
    if (cleanId === "inicio") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      try { history.replaceState(null, "", window.location.pathname); } catch (_) {}
      return;
    }

    const target = document.querySelector(`[data-section-id="${cleanId}"]`) || document.getElementById(cleanId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
      try { history.replaceState(null, "", window.location.pathname); } catch (_) {}
    }
  });
});

const dialog = document.querySelector<HTMLDialogElement>("#install-dialog");

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

const APP_IOS_INSTALL_URL = "https://manaus-live-transit.vercel.app/?install=ios";

// Apenas links do iOS: redireciona diretamente para o aplicativo oficial com o modal nativo
document
  .querySelectorAll<HTMLElement>("[data-install='ios'], #appleInstallIphoneBtn")
  .forEach((link) => {
    link.addEventListener("click", (event) => {
      const mouseEvent = event as MouseEvent;
      if (mouseEvent.metaKey || mouseEvent.ctrlKey) return;
      event.preventDefault();
      window.location.href = APP_IOS_INSTALL_URL;
    });
  });

if (dialog) {
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
}

// 2. SHOWCASE CENTRAL — ALTERNÂNCIA DE TELAS DO IPHONE 16 PRO (JOURNEY / HOME)
(() => {
  const tabCards = document.querySelectorAll<HTMLButtonElement>("[data-stage-tab], [data-phone-screen]");
  const phoneDisplay = document.querySelector<HTMLImageElement>("#showcasePhoneDisplay");
  if (!tabCards.length || !phoneDisplay) return;

  tabCards.forEach((btn) => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.stageTab || btn.dataset.phoneScreen;
      if (!screen) return;
      tabCards.forEach((b) => {
        const isCurrent = b === btn;
        b.classList.toggle("active", isCurrent);
        b.setAttribute("aria-selected", String(isCurrent));
      });
      phoneDisplay.src = `/screens/${screen}.webp`;
    });
  });
})();

