const slides = Array.from({ length: 27 }, (_, index) => `./assets/fotos/${index}.jpeg`);

const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const photoStage = document.querySelector(".photo-stage");
const prevArrow = document.querySelector(".gallery-arrow--prev");
const nextArrow = document.querySelector(".gallery-arrow--next");
const coverflowTrack = document.querySelector(".coverflow-track");

const THEME_KEY = "gabriel-silva-theme";
const AUTOPLAY_DELAY = 5000;

let currentIndex = 0;
let autoplayId = null;
let cards = [];

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

function getRelativePosition(index) {
  const total = slides.length;
  let relative = index - currentIndex;

  if (relative > total / 2) {
    relative -= total;
  }

  if (relative < -total / 2) {
    relative += total;
  }

  return relative;
}

function getCardStyle(relative) {
  const abs = Math.abs(relative);

  if (abs > 2) {
    return {
      opacity: "0",
      filter: "blur(10px) brightness(0.45)",
      transform: `translateX(${relative * 18}%) translateZ(-320px) rotateY(${relative < 0 ? 74 : -74}deg) scale(0.62)`,
      zIndex: "0",
    };
  }

  if (relative === 0) {
    return {
      opacity: "1",
      filter: "blur(0) brightness(1)",
      transform: "translateX(0) translateZ(0) rotateY(0deg) scale(1)",
      zIndex: "30",
    };
  }

  if (abs === 1) {
    return {
      opacity: "0.78",
      filter: "blur(0.8px) brightness(0.78)",
      transform: `translateX(${relative * 42}%) translateZ(-120px) rotateY(${relative < 0 ? 56 : -56}deg) scale(0.84)`,
      zIndex: "20",
    };
  }

  return {
    opacity: "0.22",
    filter: "blur(2px) brightness(0.54)",
    transform: `translateX(${relative * 58}%) translateZ(-240px) rotateY(${relative < 0 ? 68 : -68}deg) scale(0.72)`,
    zIndex: "10",
  };
}

function renderCoverflow() {
  cards.forEach((card, index) => {
    const relative = getRelativePosition(index);
    const style = getCardStyle(relative);

    card.classList.toggle("is-current", relative === 0);
    card.style.opacity = style.opacity;
    card.style.filter = style.filter;
    card.style.transform = style.transform;
    card.style.zIndex = style.zIndex;
  });
}

function buildCoverflow() {
  const fragment = document.createDocumentFragment();

  cards = slides.map((src, index) => {
    const card = document.createElement("div");
    const img = document.createElement("img");

    card.className = "coverflow-card";
    img.src = src;
    img.alt = `Fotografia ${index + 1} de Gabriel Silva`;
    img.loading = index < 5 ? "eager" : "lazy";

    card.appendChild(img);
    fragment.appendChild(card);
    return card;
  });

  coverflowTrack.appendChild(fragment);
  renderCoverflow();
}

function goTo(step) {
  currentIndex = (currentIndex + step + slides.length) % slides.length;
  photoStage.classList.remove("is-flashing");
  void photoStage.offsetWidth;
  photoStage.classList.add("is-flashing");
  renderCoverflow();
}

function nextSlide() {
  goTo(1);
}

function previousSlide() {
  goTo(-1);
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

    photoStage.style.setProperty("--tilt-x", `${offsetY * -4}deg`);
    photoStage.style.setProperty("--tilt-y", `${offsetX * 6}deg`);
    photoStage.style.setProperty("--float-x", `${offsetX * 8}px`);
    photoStage.style.setProperty("--float-y", `${offsetY * -8}px`);
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
buildCoverflow();
bindThemeToggle();
bindStageInteraction();
restartAutoplay();
