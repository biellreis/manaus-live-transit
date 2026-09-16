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
  .querySelectorAll<HTMLAnchorElement>(".install-android, #android-direct-btn")
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
    .querySelectorAll<HTMLAnchorElement>("[data-install='ios']")
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

function screenControl(
  attribute: string,
  imageId: string,
  callback?: (value: string) => void,
) {
  let request = 0;
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    `[${attribute}]`,
  );
  const image = document.getElementById(imageId) as HTMLImageElement;
  buttons.forEach((button) =>
    button.addEventListener("click", async () => {
      const id = ++request;
      const value = button.getAttribute(attribute)!;
      const next = new Image();
      next.src = `/screens/${value}.webp`;
      try {
        await next.decode();
      } catch {
        return;
      }
      if (id !== request) return;
      image.src = next.src;
      buttons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      callback?.(value);
    }),
  );
}
screenControl("data-planner", "planner-screen");
screenControl("data-connection", "connection-screen");
screenControl("data-route", "route-screen", (value) => {
  document.querySelector("#route-title")!.textContent =
    value === "ida" ? "Seu trajeto de ida." : "Seu trajeto de volta.";
  const color = value === "ida" ? "#3b82f6" : "#f97316";
  (document.querySelector(".route-decoration") as HTMLElement).style.color =
    color;
  document
    .querySelectorAll<HTMLButtonElement>("[data-route]")
    .forEach(
      (b) =>
        (b.style.background = b.classList.contains("active")
          ? color
          : "transparent"),
    );
});

const reduced = matchMedia("(prefers-reduced-motion: reduce)");
if (!reduced.matches) {
  const start = async () => {
    const { gsap } = await import("gsap");
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.matchMedia();
    context.add("(prefers-reduced-motion: no-preference)", () => {
      document
        .querySelectorAll(
          ".chapter-art,.line-stack,.map-window,.connection-gallery",
        )
        .forEach((element) => {
          gsap.fromTo(
            element,
            { y: 35 },
            {
              y: -15,
              ease: "none",
              scrollTrigger: {
                trigger: element,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            },
          );
        });
    });
  };
  start().catch(() => {});

}

const mapVideo = document.querySelector<HTMLVideoElement>(".map-video");
if (mapVideo) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mapVideo.play().catch(() => {});
        } else {
          mapVideo.pause();
        }
      });
    },
    { threshold: 0.15 },
  );
  videoObserver.observe(mapVideo);
}
