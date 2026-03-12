const slides = Array.from({ length: 27 }, (_, index) => `./assets/fotos/${index}.jpeg`);

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const photoStage = document.querySelector(".photo-stage");
const currentLayer = document.querySelector(".photo-layer--current");
const nextLayer = document.querySelector(".photo-layer--next");
const prevArrow = document.querySelector(".gallery-arrow--prev");
const nextArrow = document.querySelector(".gallery-arrow--next");

const THEME_KEY = "gabriel-silva-theme";
const AUTOPLAY_DELAY = 5000;
const TRANSITION_DURATION = 950;

let currentIndex = 0;
let autoplayId = null;
let transitionFallbackId = null;
let isTransitioning = false;
let pendingSteps = 0;

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

function updateStage(index) {
  currentLayer.src = slides[index];
  currentLayer.alt = `Fotografia ${index + 1} de Gabriel Silva`;
}

function preloadImage(index) {
  const img = new Image();
  img.src = slides[(index + slides.length) % slides.length];
}

function finalizeTransition(nextIndex) {
  window.clearTimeout(transitionFallbackId);
  photoStage.classList.remove("is-transitioning");
  photoStage.classList.remove("is-flashing");
  updateStage(nextIndex);
  currentIndex = nextIndex;
  isTransitioning = false;

  preloadImage(currentIndex + 1);

  if (pendingSteps !== 0) {
    const step = pendingSteps > 0 ? 1 : -1;
    pendingSteps -= step;
    runSlide(step);
  }
}

function runSlide(step) {
  if (isTransitioning) {
    pendingSteps += step;
    return;
  }

  const nextIndex = (currentIndex + step + slides.length) % slides.length;
  const nextSrc = slides[nextIndex];

  isTransitioning = true;
  nextLayer.src = nextSrc;
  nextLayer.alt = `Fotografia ${nextIndex + 1} de Gabriel Silva`;

  photoStage.classList.remove("is-transitioning");
  photoStage.classList.remove("is-flashing");
  void photoStage.offsetWidth;

  window.requestAnimationFrame(() => {
    photoStage.classList.add("is-flashing");
    photoStage.classList.add("is-transitioning");
  });

  transitionFallbackId = window.setTimeout(() => {
    finalizeTransition(nextIndex);
  }, TRANSITION_DURATION);
}

function nextSlide() {
  runSlide(1);
}

function previousSlide() {
  runSlide(-1);
}

function restartAutoplay() {
  window.clearInterval(autoplayId);
  autoplayId = window.setInterval(nextSlide, AUTOPLAY_DELAY);
}

function bindThemeToggle() {
  themeToggle.addEventListener("click", () => {
    const currentTheme = root.getAttribute("data-theme");
    applyTheme(currentTheme === "dark" ? "light" : "dark");
  });
}

function bindStageInteraction() {
  photoStage.addEventListener("click", () => {
    nextSlide();
    restartAutoplay();
  });

  photoStage.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    nextSlide();
    restartAutoplay();
  });

  prevArrow.addEventListener("click", (event) => {
    event.stopPropagation();
    previousSlide();
    restartAutoplay();
  });

  nextArrow.addEventListener("click", (event) => {
    event.stopPropagation();
    nextSlide();
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
updateStage(currentIndex);
nextLayer.src = slides[1];
preloadImage(1);
bindThemeToggle();
bindStageInteraction();
restartAutoplay();
