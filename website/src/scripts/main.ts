import { installUrl } from "../config";

const dialog = document.querySelector<HTMLDialogElement>("#install-dialog")!;
const continueLink =
  document.querySelector<HTMLAnchorElement>("#install-continue")!;
let opener: HTMLElement | null = null;
document
  .querySelectorAll<HTMLAnchorElement>("[data-install]")
  .forEach((link) => {
    link.addEventListener("click", async (event) => {
      // Native links remain functional without JavaScript. Desktop gets a QR handoff.
      if (matchMedia("(pointer:coarse)").matches) return;
      event.preventDefault();
      opener = link;
      const platform = link.dataset.install === "android" ? "android" : "ios";
      const target = installUrl(platform);
      continueLink.href = target;
      document.querySelector("#install-title")!.textContent =
        platform === "ios" ? "Manô no seu iPhone." : "Manô no seu Android.";
      document.querySelector("#install-description")!.textContent =
        "Aponte a câmera do celular para o QR code e continue por lá.";
      document.querySelector("#install-instructions")!.textContent =
        platform === "ios"
          ? "No Safari: Compartilhar → Adicionar à Tela de Início."
          : "No Chrome: siga a opção Instalar aplicativo ou Adicionar à tela inicial.";
      const qr = document.querySelector<HTMLCanvasElement>("#install-qr")!;
      qr.hidden = true;
      dialog.showModal();
      try {
        const { default: QRCode } = await import("qrcode");
        await QRCode.toCanvas(qr, target, {
          width: 176,
          margin: 2,
          color: { dark: "#09090b", light: "#ffffff" },
        });
        qr.hidden = false;
      } catch {
        document.querySelector("#install-description")!.textContent =
          "Abra o Manô no navegador do seu celular para continuar.";
      }
    });
  });
dialog
  .querySelector(".dialog-close")!
  .addEventListener("click", () => dialog.close());
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
dialog.addEventListener("close", () => opener?.focus());

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
  const connection = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (!connection?.saveData) {
    const art = document.getElementById("hero-art")!;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          import("../three/hero")
            .then((m) => m.createHero(art))
            .catch(() => {});
        }
      },
      { rootMargin: "100px" },
    );
    observer.observe(art);
  }
}
