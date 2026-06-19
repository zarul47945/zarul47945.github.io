const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mobileNavLinks = document.querySelectorAll(".mobile-nav a");
const progressBar = document.querySelector(".scroll-progress span");
const dialog = document.querySelector(".media-dialog");
const dialogPath = dialog?.querySelector(".dialog-path");
const dialogClose = dialog?.querySelector(".dialog-close");

if ("scrollRestoration" in history) history.scrollRestoration = "manual";

const yearElement = document.querySelector("#year");
if (yearElement) yearElement.textContent = new Date().getFullYear();

function scrollToHashTarget() {
  const targetId = decodeURIComponent(window.location.hash.slice(1));
  const target = targetId ? document.getElementById(targetId) : null;
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - 120;
  window.scrollTo(0, top);
}

window.addEventListener("load", () => {
  const fontsReady = document.fonts?.ready || Promise.resolve();
  fontsReady.then(() => requestAnimationFrame(scrollToHashTarget));
});

menuToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

mobileNavLinks.forEach((link) => {
  link.addEventListener("click", () => {
    body.classList.remove("menu-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open menu");
  });
});

function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${progress}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll("[data-nav-section]")];
const navLinks = [...document.querySelectorAll(".desktop-nav a")];

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const activeSection = entry.target.dataset.navSection;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${activeSection}`);
      });
    });
  },
  { rootMargin: "-38% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

document.querySelectorAll("[data-tilt]").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const frame = element.querySelector(".hero-frame");
    if (frame) {
      frame.style.transform = `rotate(2deg) rotateY(${x * 7}deg) rotateX(${y * -7}deg)`;
    }
  });

  element.addEventListener("pointerleave", () => {
    const frame = element.querySelector(".hero-frame");
    if (frame) frame.style.transform = "rotate(2deg)";
  });
});

document.querySelectorAll(".play-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const stage = button.closest(".media-slot");
    stage?.classList.toggle("previewing");
  });
});

function openMediaDialog(slot) {
  if (slot.classList.contains("media-loaded")) return;
  const key = slot.dataset.mediaKey;
  const source = window.PORTFOLIO_MEDIA?.[key]?.src || "See assets/MEDIA_UPLOAD_GUIDE.md";
  if (dialogPath) dialogPath.textContent = source;
  if (typeof dialog?.showModal === "function") dialog.showModal();
}

document.querySelectorAll(".media-slot").forEach((slot) => {
  slot.addEventListener("click", () => openMediaDialog(slot));
  slot.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openMediaDialog(slot);
    }
  });
});

dialogClose?.addEventListener("click", () => dialog.close());
dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

let imageLightbox;
let imageLightboxScrollY = 0;

function restoreImageLightboxScroll() {
  window.setTimeout(() => {
    window.scrollTo(0, imageLightboxScrollY);
  }, 0);

  window.setTimeout(() => {
    window.scrollTo(0, imageLightboxScrollY);
  }, 80);
}

function closeImageLightbox() {
  if (!imageLightbox) return;

  imageLightbox.hidden = true;
  imageLightbox.classList.remove("is-open");
  restoreImageLightboxScroll();
}

function ensureImageLightbox() {
  if (imageLightbox) return imageLightbox;

  imageLightbox = document.createElement("div");
  imageLightbox.className = "image-lightbox";
  imageLightbox.hidden = true;
  imageLightbox.setAttribute("role", "dialog");
  imageLightbox.setAttribute("aria-modal", "true");
  imageLightbox.setAttribute("aria-label", "Expanded gallery image");
  imageLightbox.innerHTML = `
    <button class="image-lightbox-close" type="button" aria-label="Close image">Close</button>
    <div class="image-lightbox-frame">
      <img alt="">
      <p></p>
    </div>
  `;
  document.body.appendChild(imageLightbox);

  imageLightbox.querySelector(".image-lightbox-close")?.addEventListener("click", () => {
    closeImageLightbox();
  });

  imageLightbox.addEventListener("click", (event) => {
    if (event.target === imageLightbox) closeImageLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && imageLightbox?.classList.contains("is-open")) {
      closeImageLightbox();
    }
  });

  return imageLightbox;
}

function openImageLightbox(link) {
  imageLightboxScrollY = window.scrollY;
  const lightbox = ensureImageLightbox();
  const image = link.querySelector("img");
  const expandedImage = lightbox.querySelector("img");
  const caption = lightbox.querySelector("p");
  const figureCaption = link.closest("figure")?.querySelector("figcaption")?.textContent || "";

  expandedImage.src = link.href;
  expandedImage.alt = image?.alt || figureCaption || "Expanded gallery image";
  caption.textContent = figureCaption;

  lightbox.hidden = false;
  lightbox.classList.add("is-open");
  lightbox.querySelector(".image-lightbox-close")?.focus({ preventScroll: true });
}

document.addEventListener("click", (event) => {
  const galleryLink = event.target.closest(".detail-gallery a");
  if (!galleryLink) return;

  event.preventDefault();
  event.stopPropagation();
  openImageLightbox(galleryLink);
}, true);

function initPortfolioMascot() {
  if (document.querySelector(".mascot")) return;

  const laptopMascotQuery = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  if (!laptopMascotQuery.matches) return;

  const onHomePage = Boolean(document.querySelector(".hero"));
  const homePrefix = onHomePage ? "" : "index.html";
  const mascot = document.createElement("aside");
  mascot.className = "mascot";
  mascot.setAttribute("aria-label", "3D portfolio guide");
  mascot.innerHTML = `
    <div class="mascot-bubble" aria-live="polite">
      <span class="mascot-kicker">Mini guide</span>
      <p class="mascot-message">Hi, I am Zarul's portfolio buddy. Projects and contact are one tap away.</p>
      <div class="mascot-actions">
        <a href="${homePrefix}#work">Projects</a>
        <a href="${homePrefix}#contact">Contact</a>
      </div>
    </div>
    <div class="mascot-stage">
      <canvas class="mascot-canvas" aria-hidden="true"></canvas>
      <img class="mascot-fallback" src="assets/mascot/zarul-mascot-front.png" alt="" loading="lazy">
      <button class="mascot-button" type="button" aria-label="Hear from the portfolio mascot"></button>
    </div>
    <button class="mascot-close" type="button" aria-label="Hide mascot">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
    </button>
  `;
  document.body.appendChild(mascot);

  const messages = [
    "Hi, I am Zarul's portfolio buddy. Projects and contact are one tap away.",
    "SchoolShield and Math Tutor show the strongest full-system builds.",
    "For internship details, the contact section has email, phone, LinkedIn and GitHub.",
    "Hover near me and I will turn a little in 3D."
  ];
  const sectionMessages = {
    about: messages[0],
    work: messages[1],
    experience: "The experience section covers teaching, tutoring, operations and safety-site work.",
    community: "Community work lives here too, with activity pages and evidence images.",
    contact: messages[2]
  };
  let messageIndex = 0;
  const message = mascot.querySelector(".mascot-message");
  const stage = mascot.querySelector(".mascot-stage");
  const talkButton = mascot.querySelector(".mascot-button");
  const closeButton = mascot.querySelector(".mascot-close");
  const mascotMotion = initMascotMovement(mascot, stage);
  let bubbleTimer = 0;

  function setMascotMessage(text) {
    if (message && text) message.textContent = text;
  }

  function openMascotBubble() {
    mascot.classList.add("is-open");
    window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => {
      if (!mascot.matches(":hover")) mascot.classList.remove("is-open");
    }, 6500);
  }

  talkButton?.addEventListener("click", (event) => {
    if (mascotMotion?.consumeDragClick()) {
      event.preventDefault();
      return;
    }

    messageIndex = (messageIndex + 1) % messages.length;
    openMascotBubble();
    mascotMotion?.pause(12000);
    setMascotMessage(messages[messageIndex]);
  });

  closeButton?.addEventListener("click", () => {
    mascot.classList.add("is-hidden");
  });

  const mascotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        setMascotMessage(sectionMessages[entry.target.dataset.navSection]);
      });
    },
    { rootMargin: "-42% 0px -50% 0px" }
  );

  document.querySelectorAll("[data-nav-section]").forEach((section) => {
    mascotObserver.observe(section);
  });

  initMascotThreeScene(mascot).catch(() => {
    mascot.classList.add("mascot-fallback-ready");
  });
}

function initMascotMovement(mascot, stage) {
  if (!stage) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const laptopMascotQuery = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  const state = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    pointerStartX: 0,
    pointerStartY: 0,
    dragging: false,
    moved: false,
    suppressClick: false,
    pauseUntil: 0,
    roamTimer: 0,
    resizeTimer: 0,
    pointIndex: 0
  };

  function bounds() {
    const rect = mascot.getBoundingClientRect();
    const width = rect.width || 310;
    const height = rect.height || 332;
    const topSafe = window.innerWidth <= 820 ? 92 : 112;
    const margin = window.innerWidth <= 820 ? 14 : 24;

    return {
      margin,
      minX: margin,
      minY: topSafe,
      maxX: Math.max(margin, window.innerWidth - width - margin),
      maxY: Math.max(topSafe, window.innerHeight - height - margin),
      width,
      height
    };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function setPosition(x, y, instant = false) {
    const area = bounds();
    const previousX = state.x || x;
    state.x = clamp(x, area.minX, area.maxX);
    state.y = clamp(y, area.minY, area.maxY);
    const directionDelta = state.x - previousX;
    if (Math.abs(directionDelta) > 8) {
      mascot.classList.toggle("is-facing-left", directionDelta < 0);
      mascot.classList.toggle("is-facing-right", directionDelta > 0);
    }
    mascot.style.setProperty("--mascot-x", `${Math.round(state.x)}px`);
    mascot.style.setProperty("--mascot-y", `${Math.round(state.y)}px`);
    mascot.classList.toggle("is-settling", !instant);
    mascot.classList.add("is-positioned");

    if (!instant) {
      window.setTimeout(() => mascot.classList.remove("is-settling"), 5400);
    }
  }

  function movementPoints() {
    const area = bounds();
    const midY = clamp(window.innerHeight * 0.52 - area.height / 2, area.minY, area.maxY);
    const upperY = clamp(window.innerHeight * 0.32 - area.height / 2, area.minY, area.maxY);
    const lowerY = clamp(window.innerHeight * 0.74 - area.height / 2, area.minY, area.maxY);
    const centerX = clamp(window.innerWidth * 0.56 - area.width / 2, area.minX, area.maxX);

    return [
      [area.maxX, area.maxY],
      [area.minX, lowerY],
      [area.maxX, upperY],
      [centerX, area.maxY],
      [area.minX, midY]
    ];
  }

  function canRoam() {
    return !reducedMotion.matches &&
      laptopMascotQuery.matches &&
      !state.dragging &&
      !mascot.matches(":hover") &&
      !mascot.classList.contains("is-open") &&
      !mascot.classList.contains("is-hidden") &&
      Date.now() > state.pauseUntil;
  }

  function scheduleRoam(delay = 8500) {
    window.clearTimeout(state.roamTimer);
    if (reducedMotion.matches || !laptopMascotQuery.matches) return;

    state.roamTimer = window.setTimeout(() => {
      if (!canRoam()) {
        scheduleRoam(2500);
        return;
      }

      const points = movementPoints();
      state.pointIndex = (state.pointIndex + 1) % points.length;
      const [nextX, nextY] = points[state.pointIndex];
      mascot.classList.add("is-roaming");
      setPosition(nextX, nextY);
      scheduleRoam(9000);
    }, delay);
  }

  function pause(duration = 8000) {
    state.pauseUntil = Date.now() + duration;
    mascot.classList.remove("is-roaming");
    scheduleRoam(duration + 1500);
  }

  function consumeDragClick() {
    if (!state.suppressClick) return false;
    state.suppressClick = false;
    return true;
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || !laptopMascotQuery.matches) return;
    const area = bounds();
    state.startX = state.x || area.maxX;
    state.startY = state.y || area.maxY;
    state.pointerStartX = event.clientX;
    state.pointerStartY = event.clientY;
    state.dragging = true;
    state.moved = false;
    mascot.classList.add("is-dragging");
    mascot.classList.remove("is-roaming");
    mascot.classList.remove("is-open");
    stage.setPointerCapture?.(event.pointerId);
    pause(12000);
  }

  function handlePointerMove(event) {
    if (!state.dragging) return;

    const deltaX = event.clientX - state.pointerStartX;
    const deltaY = event.clientY - state.pointerStartY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) state.moved = true;

    if (state.moved) {
      event.preventDefault();
      setPosition(state.startX + deltaX, state.startY + deltaY, true);
    }
  }

  function handlePointerUp(event) {
    if (!state.dragging) return;

    state.dragging = false;
    if (state.moved) {
      state.suppressClick = true;
      window.setTimeout(() => {
        state.suppressClick = false;
      }, 350);
    }
    mascot.classList.remove("is-dragging");
    mascot.classList.remove("is-settling");
    stage.releasePointerCapture?.(event.pointerId);
    pause(state.moved ? 18000 : 9000);
  }

  function resetIntoViewport() {
    window.clearTimeout(state.resizeTimer);
    state.resizeTimer = window.setTimeout(() => {
      if (!laptopMascotQuery.matches) return;
      const points = movementPoints();
      if (!mascot.classList.contains("is-positioned")) {
        const [x, y] = points[0];
        setPosition(x, y, true);
      } else {
        setPosition(state.x, state.y, true);
      }
    }, 120);
  }

  stage.addEventListener("pointerdown", handlePointerDown);
  window.addEventListener("pointermove", handlePointerMove, { passive: false });
  window.addEventListener("pointerup", handlePointerUp);
  window.addEventListener("resize", resetIntoViewport);
  mascot.addEventListener("pointerenter", () => pause(7000));
  mascot.addEventListener("pointerleave", () => {
    mascot.classList.remove("is-open");
    scheduleRoam(2500);
  });

  requestAnimationFrame(() => {
    const [x, y] = movementPoints()[0];
    setPosition(x, y, true);
    scheduleRoam(7000);
  });

  return { consumeDragClick, pause };
}

async function initMascotThreeScene(mascot) {
  const stage = mascot.querySelector(".mascot-stage");
  const canvas = mascot.querySelector(".mascot-canvas");
  if (!stage || !canvas) return;

  const THREE = await import("./assets/vendor/three.module.js");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.08, 5.2);

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas,
    preserveDrawingBuffer: true
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const ambient = new THREE.AmbientLight(0xffffff, 2.1);
  const keyLight = new THREE.DirectionalLight(0x9eeaff, 2.2);
  keyLight.position.set(2.6, 3.2, 4);
  scene.add(ambient, keyLight);

  const loader = new THREE.TextureLoader();
  const loadTexture = (src) => new Promise((resolve, reject) => {
    loader.load(src, resolve, undefined, reject);
  });
  const partDefinitions = [
    {
      key: "leftLeg",
      src: "assets/mascot/parts/left-leg.png",
      box: [172, 415, 262, 666],
      pivot: [218, 430],
      parent: "walker",
      order: 3
    },
    {
      key: "rightLeg",
      src: "assets/mascot/parts/right-leg.png",
      box: [256, 415, 360, 666],
      pivot: [302, 430],
      parent: "walker",
      order: 4
    },
    {
      key: "torso",
      src: "assets/mascot/parts/torso.png",
      box: [158, 238, 362, 488],
      pivot: [260, 360],
      parent: "body",
      order: 6
    },
    {
      key: "leftArm",
      src: "assets/mascot/parts/left-arm.png",
      box: [96, 260, 222, 520],
      pivot: [182, 286],
      parent: "body",
      order: 8
    },
    {
      key: "rightArm",
      src: "assets/mascot/parts/right-arm.png",
      box: [298, 260, 424, 520],
      pivot: [338, 286],
      parent: "body",
      order: 9
    },
    {
      key: "head",
      src: "assets/mascot/parts/head.png",
      box: [112, 54, 408, 332],
      pivot: [260, 272],
      parent: "body",
      order: 10
    }
  ];
  const [frontTexture, ...partTextures] = await Promise.all([
    loadTexture("assets/mascot/zarul-mascot-front.png"),
    ...partDefinitions.map((part) => loadTexture(part.src))
  ]);

  [frontTexture, ...partTextures].forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
  });

  const group = new THREE.Group();
  scene.add(group);

  const pixelScale = 0.004;
  const walker = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const rigParts = {};
  group.add(walker);
  walker.add(bodyGroup);

  function pointToWorld(point) {
    return {
      x: (point[0] - 260) * pixelScale,
      y: (360 - point[1]) * pixelScale
    };
  }

  function boxCenterToWorld(box) {
    return pointToWorld([(box[0] + box[2]) / 2, (box[1] + box[3]) / 2]);
  }

  function makeRigPart(definition, texture) {
    const box = definition.box;
    const width = (box[2] - box[0]) * pixelScale;
    const height = (box[3] - box[1]) * pixelScale;
    const center = boxCenterToWorld(box);
    const pivot = pointToWorld(definition.pivot);
    const pivotGroup = new THREE.Group();
    const material = new THREE.MeshBasicMaterial({
      depthTest: false,
      depthWrite: false,
      map: texture,
      transparent: true
    });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.position.set(center.x - pivot.x, center.y - pivot.y, 0);
    mesh.renderOrder = definition.order;
    pivotGroup.position.set(pivot.x, pivot.y, 0);
    pivotGroup.add(mesh);

    if (definition.parent === "body") {
      bodyGroup.add(pivotGroup);
    } else {
      walker.add(pivotGroup);
    }

    rigParts[definition.key] = pivotGroup;
    return pivotGroup;
  }

  partDefinitions.forEach((definition, index) => {
    makeRigPart(definition, partTextures[index]);
  });

  const softDepth = new THREE.Mesh(
    new THREE.PlaneGeometry(2.08, 2.88),
    new THREE.MeshBasicMaterial({
      color: 0x071b33,
      depthTest: false,
      depthWrite: false,
      map: frontTexture,
      opacity: 0.018,
      transparent: true
    })
  );
  softDepth.position.set(-0.035, -0.02, -0.08);
  softDepth.renderOrder = 1;
  walker.add(softDepth);

  const base = new THREE.Mesh(
    new THREE.CircleGeometry(0.92, 72),
    new THREE.MeshBasicMaterial({ color: 0x58d6ff, opacity: 0.18, transparent: true })
  );
  base.rotation.x = -Math.PI / 2;
  base.position.set(0, -1.34, -0.3);
  base.scale.y = 0.38;
  group.add(base);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.56, 0.86, 72),
    new THREE.MeshBasicMaterial({ color: 0x2563eb, opacity: 0.22, transparent: true })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(0, -1.33, -0.28);
  ring.scale.y = 0.38;
  group.add(ring);

  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  let walkStrength = 0;
  let currentFacing = 1;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resizeMascotScene() {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  const resizeObserver = new ResizeObserver(resizeMascotScene);
  resizeObserver.observe(stage);
  resizeMascotScene();

  stage.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  });

  stage.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  function render(time = 0) {
    pointerX += (targetX - pointerX) * 0.08;
    pointerY += (targetY - pointerY) * 0.08;

    const seconds = time * 0.001;
    const isWalking = !reducedMotion &&
      (mascot.classList.contains("is-settling") || mascot.classList.contains("is-dragging"));
    const targetWalkStrength = isWalking ? 1 : 0;
    const targetFacing = mascot.classList.contains("is-facing-left") ? -1 : 1;
    walkStrength += (targetWalkStrength - walkStrength) * 0.08;
    currentFacing += (targetFacing - currentFacing) * 0.12;

    const step = Math.sin(seconds * 4.15);
    const counterStep = Math.sin(seconds * 4.15 + Math.PI);
    const footLift = Math.max(0, step) * walkStrength;
    const counterFootLift = Math.max(0, counterStep) * walkStrength;
    const hipSway = Math.sin(seconds * 4.15 + Math.PI / 2) * walkStrength;
    const bodyBob = Math.abs(Math.sin(seconds * 4.15)) * 0.035 * walkStrength;
    const travelLean = currentFacing * 0.035 * walkStrength;
    const idleTurn = reducedMotion ? 0 : Math.sin(seconds * 1.25) * 0.07;
    const idleLift = reducedMotion ? 0 : Math.sin(seconds * 2.1) * 0.035;

    const rigScale = 1.1;
    walker.scale.x = (currentFacing || 1) * rigScale;
    walker.scale.y = rigScale;
    walker.position.y = idleLift + bodyBob;
    walker.position.x = hipSway * 0.012 * currentFacing;
    walker.rotation.z = travelLean + hipSway * 0.018;

    bodyGroup.position.x = hipSway * 0.022;
    bodyGroup.position.y = bodyBob * 0.45;
    bodyGroup.rotation.z = hipSway * 0.045 + travelLean * 0.45;

    rigParts.head.rotation.z = -bodyGroup.rotation.z * 0.55 + pointerX * 0.025;
    rigParts.head.position.y = bodyBob * 0.2;
    rigParts.leftArm.rotation.z = -step * 0.3 * walkStrength - 0.04 * walkStrength;
    rigParts.rightArm.rotation.z = step * 0.3 * walkStrength + 0.04 * walkStrength;
    rigParts.leftLeg.rotation.z = step * 0.34 * walkStrength;
    rigParts.rightLeg.rotation.z = counterStep * 0.34 * walkStrength;
    rigParts.leftLeg.position.y = footLift * 0.035;
    rigParts.rightLeg.position.y = counterFootLift * 0.035;
    rigParts.leftLeg.position.x = -Math.max(0, -step) * 0.026 * walkStrength;
    rigParts.rightLeg.position.x = Math.max(0, step) * 0.026 * walkStrength;

    group.rotation.y = pointerX * 0.18 + idleTurn - currentFacing * walkStrength * 0.08;
    group.rotation.x = pointerY * -0.075;
    base.rotation.z = reducedMotion ? 0 : seconds * 0.18;
    ring.rotation.z = reducedMotion ? 0 : seconds * -0.28;

    renderer.render(scene, camera);
    if (!reducedMotion) requestAnimationFrame(render);
  }

  mascot.classList.add("has-webgl");
  render();
}

initPortfolioMascot();
