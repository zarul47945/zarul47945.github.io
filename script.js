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
  mascot.setAttribute("aria-label", "Portfolio mascot guide");
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
      <img class="mascot-sprite" src="assets/mascot/sprites/front-idle.png" alt="" loading="eager" decoding="async">
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
    "Drag me around the page while you explore the portfolio."
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

  initMascotSprites(mascot);
}

function initMascotSprites(mascot) {
  const sprite = mascot.querySelector(".mascot-sprite");
  if (!sprite) return;

  const frames = {
    front: "assets/mascot/sprites/front-idle.png",
    stand: "assets/mascot/sprites/right-stand.png",
    walkA: "assets/mascot/sprites/right-walk-a.png",
    walkB: "assets/mascot/sprites/right-walk-b.png"
  };
  const walkSequence = ["walkA", "stand", "walkB", "stand"];
  const frameDuration = 380;
  const standingLeadIn = 260;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let currentFrame = "front";
  let sequenceIndex = 0;
  let nextFrameAt = 0;
  let wasWalking = false;
  let lastFacingLeft = false;

  Object.values(frames).forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  function setFrame(frameKey) {
    if (frameKey === currentFrame) return;
    currentFrame = frameKey;
    sprite.src = frames[frameKey];
    sprite.dataset.frame = frameKey;
  }

  function renderFrame(time = 0) {
    const isWalking = !reducedMotion.matches &&
      (mascot.classList.contains("is-settling") || mascot.classList.contains("is-dragging"));
    const isFacingLeft = mascot.classList.contains("is-facing-left");
    mascot.classList.toggle("is-walk-sprite", isWalking);

    if (!isWalking) {
      sequenceIndex = 0;
      nextFrameAt = 0;
      setFrame("front");
      wasWalking = false;
      lastFacingLeft = isFacingLeft;
      requestAnimationFrame(renderFrame);
      return;
    }

    if (!wasWalking || isFacingLeft !== lastFacingLeft) {
      sequenceIndex = 0;
      nextFrameAt = time + standingLeadIn;
      setFrame("stand");
      wasWalking = true;
      lastFacingLeft = isFacingLeft;
      requestAnimationFrame(renderFrame);
      return;
    }

    if (time >= nextFrameAt) {
      setFrame(walkSequence[sequenceIndex]);
      sequenceIndex = (sequenceIndex + 1) % walkSequence.length;
      nextFrameAt = time + frameDuration;
    }

    requestAnimationFrame(renderFrame);
  }

  renderFrame();
}

function initMascotMovement(mascot, stage) {
  if (!stage) return null;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const laptopMascotQuery = window.matchMedia("(min-width: 1024px) and (hover: hover) and (pointer: fine)");
  const roamMoveDuration = 5400;
  const roamRestDuration = 10000;
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
    settleTimer: 0,
    resizeTimer: 0,
    pointIndex: 0,
    roaming: false
  };

  function bounds() {
    const rect = stage.getBoundingClientRect();
    const width = rect.width || 142;
    const height = rect.height || 196;
    const margin = window.innerWidth <= 820 ? 14 : 24;
    const topSafe = margin;

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
  }

  function movementPoints() {
    const area = bounds();
    const midY = clamp(window.innerHeight * 0.52 - area.height / 2, area.minY, area.maxY);
    const lowerY = clamp(window.innerHeight * 0.74 - area.height / 2, area.minY, area.maxY);
    const centerX = clamp(window.innerWidth * 0.56 - area.width / 2, area.minX, area.maxX);
    const centerY = clamp(window.innerHeight * 0.5 - area.height / 2, area.minY, area.maxY);

    return [
      [area.maxX, area.maxY],
      [area.minX, lowerY],
      [area.minX, area.minY],
      [area.maxX, area.minY],
      [centerX, centerY],
      [centerX, area.maxY],
      [area.minX, midY]
    ];
  }

  function canRoam() {
    return !reducedMotion.matches &&
      laptopMascotQuery.matches &&
      !state.dragging &&
      !state.roaming &&
      !mascot.matches(":hover") &&
      !mascot.classList.contains("is-open") &&
      !mascot.classList.contains("is-hidden") &&
      Date.now() > state.pauseUntil;
  }

  function finishRoam() {
    window.clearTimeout(state.settleTimer);
    state.roaming = false;
    mascot.classList.remove("is-settling");
    mascot.classList.remove("is-roaming");
    scheduleRoam(roamRestDuration);
  }

  function startRoam() {
    if (!canRoam()) {
      scheduleRoam(2500);
      return;
    }

    const points = movementPoints();
    state.pointIndex = (state.pointIndex + 1) % points.length;
    const [nextX, nextY] = points[state.pointIndex];
    state.roaming = true;
    mascot.classList.add("is-roaming");
    setPosition(nextX, nextY);
    window.clearTimeout(state.settleTimer);
    state.settleTimer = window.setTimeout(finishRoam, roamMoveDuration);
  }

  function scheduleRoam(delay = roamRestDuration) {
    window.clearTimeout(state.roamTimer);
    if (reducedMotion.matches || !laptopMascotQuery.matches) return;
    if (state.roaming) return;

    state.roamTimer = window.setTimeout(startRoam, delay);
  }

  function pause(duration = 8000) {
    window.clearTimeout(state.roamTimer);
    window.clearTimeout(state.settleTimer);
    state.roaming = false;
    state.pauseUntil = Date.now() + duration;
    mascot.classList.remove("is-roaming");
    mascot.classList.remove("is-settling");
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
    if (state.roaming) return;
    scheduleRoam(roamRestDuration);
  });

  requestAnimationFrame(() => {
    const [x, y] = movementPoints()[0];
    setPosition(x, y, true);
    scheduleRoam(roamRestDuration);
  });

  return { consumeDragClick, pause };
}

initPortfolioMascot();
