import * as THREE from "three";

function roundShape(w: number, h: number, r: number) {
  const s = new THREE.Shape(),
    x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function surface(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundShape(w, h, r), 24);
  const position = g.attributes.position,
    uv = g.attributes.uv;
  for (let i = 0; i < position.count; i++)
    uv.setXY(i, (position.getX(i) + w / 2) / w, (position.getY(i) + h / 2) / h);
  return g;
}
function phone(texture: THREE.Texture, android: boolean) {
  const group = new THREE.Group();
  const w = 1.27,
    h = 2.75,
    r = android ? 0.12 : 0.2;
  const bodyGeometry = new THREE.ExtrudeGeometry(roundShape(w, h, r), {
    depth: 0.105,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.018,
    bevelThickness: 0.018,
    curveSegments: 20,
  });
  const body = new THREE.Mesh(
    bodyGeometry,
    new THREE.MeshStandardMaterial({
      color: android ? 0x767984 : 0x8d929d,
      metalness: 0.8,
      roughness: 0.32,
    }),
  );
  group.add(body);
  const bezel = new THREE.Mesh(
    surface(w - 0.025, h - 0.025, r),
    new THREE.MeshStandardMaterial({
      color: 0x030305,
      metalness: 0.15,
      roughness: 0.25,
    }),
  );
  bezel.position.z = 0.126;
  group.add(bezel);
  const display = new THREE.Mesh(
    surface(w - 0.09, h - 0.095, r - 0.045),
    new THREE.MeshBasicMaterial({ map: texture, toneMapped: false }),
  );
  display.position.z = 0.128;
  group.add(display);
  const button = new THREE.Mesh(
    new THREE.BoxGeometry(0.025, 0.32, 0.05),
    new THREE.MeshStandardMaterial({
      color: 0x888b93,
      metalness: 0.8,
      roughness: 0.3,
    }),
  );
  button.position.set(w / 2 + 0.015, 0.45, 0.04);
  group.add(button);
  return group;
}

export async function createHero(host: HTMLElement) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  if (reduced.matches) return;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x09090b, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.z = 5.8;
  scene.add(new THREE.HemisphereLight(0xf1f5ff, 0x0c0f18, 2.5));
  const key = new THREE.DirectionalLight(0xffffff, 5.5);
  key.position.set(-3, 4, 6);
  scene.add(key);
  // Dual-tone chromatic rim lighting: Manaus Blue + Vibrant Orange
  const blueRim = new THREE.DirectionalLight(0x3b82f6, 4.5);
  blueRim.position.set(5.5, 0, 3);
  scene.add(blueRim);
  const orangeRim = new THREE.DirectionalLight(0xf97316, 3.2);
  orangeRim.position.set(-5.5, -2, 2.5);
  scene.add(orangeRim);
  const loader = new THREE.TextureLoader();
  let textures: THREE.Texture[];
  try {
    textures = await Promise.all(
      ["/screens/home.webp", "/screens/android-route.webp"].map((url) =>
        loader.loadAsync(url),
      ),
    );
  } catch {
    renderer.dispose();
    return;
  }
  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
  });
  const front = phone(textures[0], false),
    back = phone(textures[1], true);
  front.position.set(-0.52, -0.06, 0.42);
  front.scale.setScalar(1.08);
  front.rotation.set(0.035, 0.22, 0.14);
  back.position.set(0.72, 0.26, -0.15);
  back.scale.setScalar(1.04);
  back.rotation.set(-0.025, -0.28, -0.16);
  // The Android texture is app-only: a narrow physical camera hole is added once.
  const hole = new THREE.Mesh(
    new THREE.CircleGeometry(0.022, 24),
    new THREE.MeshBasicMaterial({ color: 0x020203 }),
  );
  hole.position.set(0, 1.31, 0.13);
  back.add(hole);
  scene.add(back, front);
  const container = document.getElementById("hero-canvas")!;
  container.append(renderer.domElement);
  let visible = true,
    frame = 0,
    disposed = false,
    targetX = 0,
    targetY = 0,
    currentX = 0,
    currentY = 0;
  const introStart = performance.now();
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.position.z = camera.aspect < 0.85 ? 6.9 : 5.7;
    camera.updateProjectionMatrix();
    request();
  };
  const render = () => {
    frame = 0;
    if (disposed || !visible || document.hidden) return;
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    const now = performance.now();
    const progress = Math.min(1, (now - introStart) / 4000);
    const remaining = Math.pow(1 - progress, 3);
    const time = (now - introStart) * 0.001;
    const floatFront = Math.sin(time * 0.7) * 0.025;
    const floatBack = Math.cos(time * 0.6) * 0.02;
    front.position.y = -0.06 + floatFront;
    back.position.y = 0.26 - floatBack;
    scene.rotation.y = currentX - remaining * 0.22;
    scene.rotation.x = currentY + remaining * 0.06;
    scene.scale.setScalar(1 - remaining * 0.09);
    renderer.render(scene, camera);
    host.classList.add("ready");
    request();
  };
  function request() {
    if (!frame && !disposed) frame = requestAnimationFrame(render);
  }
  const move = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    const r = host.getBoundingClientRect();
    targetX = ((e.clientX - r.left) / r.width - 0.5) * 0.09;
    targetY = ((e.clientY - r.top) / r.height - 0.5) * 0.05;
    request();
  };
  const leave = () => {
    targetX = 0;
    targetY = 0;
    request();
  };
  const visibility = () => request();
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) request();
  });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  document.addEventListener("visibilitychange", visibility);
  const cleanup = () => {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(frame);
    observer.disconnect();
    resizeObserver.disconnect();
    host.removeEventListener("pointermove", move);
    host.removeEventListener("pointerleave", leave);
    document.removeEventListener("visibilitychange", visibility);
    host.classList.remove("ready");
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose();
        const m = Array.isArray(o.material) ? o.material : [o.material];
        m.forEach((x) => x.dispose());
      }
    });
    textures.forEach((t) => t.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
  renderer.domElement.addEventListener(
    "webglcontextlost",
    (e) => {
      e.preventDefault();
      cleanup();
    },
    { once: true },
  );
  reduced.addEventListener(
    "change",
    (e) => {
      if (e.matches) cleanup();
    },
    { once: true },
  );
  window.addEventListener("pagehide", cleanup, { once: true });
  resize();
}
