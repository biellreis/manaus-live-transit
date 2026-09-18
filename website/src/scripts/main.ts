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

/* ==========================================================================
   APPLE IPHONE 18 PRO INTERACTIVE MOTION & 3D PHYSICS
   ========================================================================== */

// 1. HERO 3D IPHONE EMERGENCE & POINTER TILT (LERP 60FPS)
(() => {
  const stage = document.getElementById("heroStage");
  const rig = document.getElementById("heroPhoneRig");
  const shadow = document.getElementById("heroFloorShadow");
  const glare = document.getElementById("heroGlassGlare");
  if (!stage || !rig) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const baseRotX = 8;
  const baseRotY = -14;
  const baseRotZ = -1.5;

  let targetRotX = baseRotX;
  let targetRotY = baseRotY;
  let targetRotZ = baseRotZ;
  let targetTranslateY = 0;
  let targetGlareX = 0;
  let targetGlareY = 0;
  let targetShadowX = 0;

  let currentRotX = baseRotX;
  let currentRotY = baseRotY;
  let currentRotZ = baseRotZ;
  let currentTranslateY = 0;
  let currentGlareX = 0;
  let currentGlareY = 0;
  let currentShadowX = 0;

  let animFrameId: number | null = null;
  let isHovered = false;

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const updateRig = () => {
    currentRotX = lerp(currentRotX, targetRotX, 0.08);
    currentRotY = lerp(currentRotY, targetRotY, 0.08);
    currentRotZ = lerp(currentRotZ, targetRotZ, 0.08);
    currentTranslateY = lerp(currentTranslateY, targetTranslateY, 0.08);
    currentGlareX = lerp(currentGlareX, targetGlareX, 0.08);
    currentGlareY = lerp(currentGlareY, targetGlareY, 0.08);
    currentShadowX = lerp(currentShadowX, targetShadowX, 0.08);

    rig.style.transform = `translateY(${currentTranslateY.toFixed(2)}px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) rotateZ(${currentRotZ.toFixed(2)}deg)`;
    if (shadow) {
      shadow.style.transform = `translateX(calc(-50% + ${currentShadowX.toFixed(1)}px)) scale(${1 - Math.abs(currentRotY) * 0.005})`;
    }
    if (glare) {
      glare.style.transform = `rotate(-25deg) translate(${currentGlareX.toFixed(1)}px, ${currentGlareY.toFixed(1)}px)`;
    }

    animFrameId = requestAnimationFrame(updateRig);
  };

  stage.addEventListener("mouseenter", () => {
    isHovered = true;
    if (!animFrameId) animFrameId = requestAnimationFrame(updateRig);
  });

  stage.addEventListener("mousemove", (e) => {
    const rect = stage.getBoundingClientRect();
    const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    targetRotY = baseRotY + normX * 16;
    targetRotX = baseRotX - normY * 12;
    targetRotZ = baseRotZ + normX * 3;
    targetTranslateY = -normY * 15;
    targetGlareX = -normX * 80;
    targetGlareY = -normY * 80;
    targetShadowX = normX * 30;

    if (!animFrameId) animFrameId = requestAnimationFrame(updateRig);
  });

  stage.addEventListener("mouseleave", () => {
    isHovered = false;
    targetRotX = baseRotX;
    targetRotY = baseRotY;
    targetRotZ = baseRotZ;
    targetTranslateY = 0;
    targetGlareX = 0;
    targetGlareY = 0;
    targetShadowX = 0;
  });

  window.addEventListener(
    "scroll",
    () => {
      if (isHovered) return;
      const scrollProgress = Math.min(1, window.scrollY / 600);
      targetRotX = baseRotX + scrollProgress * 5;
      targetRotY = baseRotY - scrollProgress * 7;
      targetTranslateY = scrollProgress * 35;
      if (!animFrameId) animFrameId = requestAnimationFrame(updateRig);
    },
    { passive: true },
  );

  animFrameId = requestAnimationFrame(updateRig);
})();

// 2. HIGHLIGHTS RIBBON HORIZONTAL CAROUSEL CONTROLS
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
    const cardWidth = firstCard?.clientWidth || 500;
    const activeIndex = Math.round(track.scrollLeft / (cardWidth + 24));
    paginationDots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === activeIndex);
    });
  };

  prevBtn?.addEventListener("click", () => {
    const firstCard = track.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth || 500;
    track.scrollBy({ left: -(cardWidth + 24), behavior: "smooth" });
  });

  nextBtn?.addEventListener("click", () => {
    const firstCard = track.firstElementChild as HTMLElement | null;
    const cardWidth = firstCard?.clientWidth || 500;
    track.scrollBy({ left: cardWidth + 24, behavior: "smooth" });
  });

  paginationDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const idx = Number(dot.dataset.index || 0);
      const firstCard = track.firstElementChild as HTMLElement | null;
      const cardWidth = firstCard?.clientWidth || 500;
      track.scrollTo({ left: idx * (cardWidth + 24), behavior: "smooth" });
    });
  });

  track.addEventListener("scroll", updateButtons, { passive: true });
  updateButtons();
})();

// 3. CLOSER LOOK STUDIO FRONT-FACING 3D SHOWCASE & FEATURE RAIL
(() => {
  const section = document.getElementById("closer-look");
  const stageCol = document.getElementById("closerLookStageWrap");
  const singleStage = document.getElementById("closerSinglePhoneStage");
  const phoneFront = document.getElementById("closerPhoneFront");
  const glare = document.getElementById("closerLookGlareFront");
  const badge = document.getElementById("closerSpatialBadge");
  const screenImg = document.getElementById("closerLookScreenImg") as HTMLImageElement | null;
  const detailTitle = document.getElementById("closerLookDetailTitle");
  const detailDesc = document.getElementById("closerLookDetailDesc");
  const badgeNum = document.getElementById("closerBadgeNum");
  const badgeHeading = document.getElementById("closerBadgeHeading");
  const railItems = document.querySelectorAll<HTMLButtonElement>(".apple-rail-item");

  // Ensure hero video autoplays smoothly
  const heroVideo = document.getElementById("appleHeroVideo") as HTMLVideoElement | null;
  if (heroVideo) {
    heroVideo.play().catch(() => {});
  }

  if (!section) return;

  // Emergence on viewport entry (Scroll-triggered Apple reveal)
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add("is-in-view");
        }
      });
    },
    { threshold: 0.15 }
  );
  observer.observe(section);

  // 3D Parallax Mouse Tracking for Front Phone Stage
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced && stageCol && singleStage) {
    let targetX = 0;
    let targetY = 0;
    let currX = 0;
    let currY = 0;
    let animId: number | null = null;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      currX = lerp(currX, targetX, 0.08);
      currY = lerp(currY, targetY, 0.08);

      // Rotate single front phone stage
      singleStage.style.transform = `scale(1) rotateX(${(-currY * 14).toFixed(2)}deg) rotateY(${(currX * 18).toFixed(2)}deg)`;

      // Front phone dynamic foreground parallax
      if (phoneFront) {
        phoneFront.style.transform = `translate3d(${(currX * 16).toFixed(1)}px, ${(currY * 12).toFixed(1)}px, 30px)`;
      }

      // Interactive Glare on front phone
      if (glare) {
        glare.style.transform = `rotate(-25deg) translate(${(-currX * 22).toFixed(1)}px, ${(-currY * 22).toFixed(1)}px)`;
      }

      // Spatial floating badge parallax
      if (badge) {
        badge.style.transform = `translateZ(60px) translate3d(${(currX * 28).toFixed(1)}px, ${(currY * 22).toFixed(1)}px, 0)`;
      }

      animId = requestAnimationFrame(loop);
    };

    stageCol.addEventListener("mousemove", (e) => {
      const rect = stageCol.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetX = Math.max(-1, Math.min(1, x));
      targetY = Math.max(-1, Math.min(1, y));
      if (!animId) animId = requestAnimationFrame(loop);
    });

    stageCol.addEventListener("mouseleave", () => {
      targetX = 0;
      targetY = 0;
    });

    animId = requestAnimationFrame(loop);
  }

  // Feature Hotspot Rail Interactive Switching
  railItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const screen = btn.dataset.screen;
      const title = btn.dataset.title;
      const desc = btn.dataset.desc;
      const bNum = btn.dataset.badgeNum;
      const bText = btn.dataset.badgeText;
      if (!screen || !screenImg) return;

      railItems.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
        const icon = b.querySelector(".rail-hotspot-icon");
        if (icon) icon.textContent = active ? "•" : "+";
      });

      // Smooth cross-fade of active OLED screen
      screenImg.style.opacity = "0.2";
      if (detailTitle && title) detailTitle.style.opacity = "0.3";
      if (detailDesc && desc) detailDesc.style.opacity = "0.3";

      const img = new Image();
      img.src = `/screens/${screen}.webp`;
      img.onload = () => {
        screenImg.src = img.src;
        screenImg.style.opacity = "1";

        if (detailTitle && title) {
          detailTitle.textContent = title;
          detailTitle.style.opacity = "1";
        }
        if (detailDesc && desc) {
          detailDesc.textContent = desc;
          detailDesc.style.opacity = "1";
        }
        if (badgeNum && bNum) {
          badgeNum.textContent = bNum;
        }
        if (badgeHeading && bText) {
          badgeHeading.textContent = bText;
        }
      };
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


