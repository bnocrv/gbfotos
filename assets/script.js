const landscapeIndexes = new Set([0, 2, 4, 13, 19, 26]);

const slides = Array.from({ length: 27 }, (_, index) => {
  const prefix = landscapeIndexes.has(index) ? "p" : "r";
  return `./assets/fotos/${prefix}foto-${index}.jpeg`;
});

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const photoStage = document.querySelector(".photo-stage");
const currentLayer = document.querySelector(".photo-layer--current");
const nextLayer = document.querySelector(".photo-layer--next");

const THEME_KEY = "gabriel-silva-theme";
const AUTOPLAY_DELAY = 5000;
const TRANSITION_DURATION = 2100;

let currentIndex = 0;
let autoplayId = null;
let isTransitioning = false;

function waitForNextFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(resolve);
    });
  });
}

async function prepareImage(img, src, alt) {
  img.src = src;
  img.alt = alt;

  if (img.complete) {
    return;
  }

  try {
    await img.decode();
  } catch (_) {
    await new Promise((resolve) => {
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  }
}

function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
}

function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);

  if (savedTheme === "dark" || savedTheme === "light") {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

function primeStage() {
  currentLayer.src = slides[currentIndex];
  currentLayer.alt = `Fotografia ${currentIndex + 1} de Gabriel Silva`;
  nextLayer.src = slides[(currentIndex + 1) % slides.length];
}

async function showSlide(targetIndex) {
  if (isTransitioning) {
    return;
  }

  const nextIndex = (targetIndex + slides.length) % slides.length;
  isTransitioning = true;

  await prepareImage(
    nextLayer,
    slides[nextIndex],
    `Fotografia ${nextIndex + 1} de Gabriel Silva`
  );

  photoStage.classList.remove("is-transitioning");
  photoStage.classList.remove("is-flashing");
  void photoStage.offsetWidth;
  await waitForNextFrame();

  photoStage.classList.add("is-flashing");
  photoStage.classList.add("is-transitioning");

  window.setTimeout(() => {
    currentLayer.src = slides[nextIndex];
    currentLayer.alt = nextLayer.alt;
    currentIndex = nextIndex;
    photoStage.classList.remove("is-transitioning");
    photoStage.classList.remove("is-flashing");
    isTransitioning = false;
  }, TRANSITION_DURATION);
}

function showNextSlide() {
  showSlide(currentIndex + 1);
}

function restartAutoplay() {
  window.clearInterval(autoplayId);
  autoplayId = window.setInterval(showNextSlide, AUTOPLAY_DELAY);
}

function bindThemeToggle() {
  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

function bindStageInteraction() {
  photoStage.addEventListener("click", () => {
    showNextSlide();
    restartAutoplay();
  });

  photoStage.addEventListener("pointermove", (event) => {
    const bounds = photoStage.getBoundingClientRect();
    const offsetX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const offsetY = (event.clientY - bounds.top) / bounds.height - 0.5;

    photoStage.style.setProperty("--tilt-x", `${offsetY * -6}deg`);
    photoStage.style.setProperty("--tilt-y", `${offsetX * 8}deg`);
    photoStage.style.setProperty("--float-x", `${offsetX * 12}px`);
    photoStage.style.setProperty("--float-y", `${offsetY * -12}px`);
  });

  photoStage.addEventListener("mouseenter", () => {
    window.clearInterval(autoplayId);
  });

  photoStage.addEventListener("mouseleave", () => {
    photoStage.style.setProperty("--tilt-x", "0deg");
    photoStage.style.setProperty("--tilt-y", "0deg");
    photoStage.style.setProperty("--float-x", "0px");
    photoStage.style.setProperty("--float-y", "0px");
    restartAutoplay();
  });

  photoStage.addEventListener("touchstart", () => {
    window.clearInterval(autoplayId);
  });

  photoStage.addEventListener("touchend", () => {
    restartAutoplay();
  });
}

loadTheme();
primeStage();
bindThemeToggle();
bindStageInteraction();
restartAutoplay();
