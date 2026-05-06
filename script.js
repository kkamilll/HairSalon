/**
 * Atelier Julia - Kompletny skrypt witryny[cite: 2]
 */

// --- KONFIGURACJA I SELEKTORY ---
const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
const heroBg = document.querySelector(".hero-bg");
const track = document.querySelector("#servicesTrack");
const dotsContainer = document.querySelector("#servicesDots");
const revealItems = document.querySelectorAll(".reveal");

// --- 1. MENU MOBILNE ---
if (menuToggle && mainNav) {
  // Otwieranie/Zamykanie menu[cite: 2]
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Zamykanie menu po wyborze sekcji[cite: 2]
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// --- 2. ANIMACJE POJAWIANIA SIĘ (REVEAL) ---
if (revealItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

// --- 3. EFEKT RUCHOMEGO TŁA W HERO ---
if (heroBg) {
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 8;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    // Poniższa linia została poprawiona - usunięto
    heroBg.style.transform = `scale(1.02) translate(${x}px, ${y}px)`;
  });
}
// --- 4. SLIDER USŁUG (POPRAWIONY SWIPE) ---
if (track) {
  let currentIndex = 0;
  let isDragging = false;
  let startPos = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  const cards = track.children;
  const gap = 20;

  const getVisibleCards = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 950) return 2;
    return 3;
  };

  const createDots = () => {
    if (!dotsContainer) return;
    const dotsCount = Math.max(0, cards.length - getVisibleCards() + 1);
    dotsContainer.innerHTML = "";
    for (let i = 0; i < dotsCount; i++) {
      const dot = document.createElement("div");
      dot.classList.add("dot");
      if (i === currentIndex) dot.classList.add("is-active");
      dot.addEventListener("click", () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  };

  const setSliderPosition = () => {
    track.style.transform = `translateX(${currentTranslate}px)`;
  };

  const animation = () => {
    setSliderPosition();
    if (isDragging) requestAnimationFrame(animation);
  };

  const goToSlide = (index) => {
    const visibleCards = getVisibleCards();
    const maxIndex = Math.max(0, cards.length - visibleCards);
    currentIndex = Math.min(Math.max(index, 0), maxIndex);

    const cardWidth = cards[0].offsetWidth;
    const paddingOffset = window.innerWidth * 0.04; // 4vw z CSS

    // PODSTAWOWE OBLICZENIE (zachowuje odstęp 4vw od lewej)
    currentTranslate = currentIndex * -(cardWidth + gap) + paddingOffset;

    // CENTROWANIE NA MOBILKACH (poniżej 600px karta na środku)
    if (window.innerWidth <= 600) {
      const margin = (window.innerWidth - cardWidth) / 2;
      currentTranslate = currentIndex * -(cardWidth + gap) + margin;
    }

    prevTranslate = currentTranslate;
    track.style.transition = "transform 0.3s ease-out";
    setSliderPosition();

    // Aktualizacja kropek
    const dots = document.querySelectorAll(".dot");
    dots.forEach((dot, i) =>
      dot.classList.toggle("is-active", i === currentIndex),
    );
  };

  // Obsługa Dotyku
  track.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      startPos = e.touches[0].clientX;
      track.style.transition = "none"; // Wyłączamy animację podczas przeciągania
      animationID = requestAnimationFrame(animation);
    },
    { passive: true },
  );

  track.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const currentPosition = e.touches[0].clientX;
      const diff = currentPosition - startPos;
      currentTranslate = prevTranslate + diff;
    },
    { passive: true },
  );

  track.addEventListener("touchend", () => {
    isDragging = false;
    cancelAnimationFrame(animationID);

    const movedBy = currentTranslate - prevTranslate;

    // Jeśli przesunięto o więcej niż 50px, zmień slajd
    if (movedBy < -50) goToSlide(currentIndex + 1);
    else if (movedBy > 50) goToSlide(currentIndex - 1);
    else goToSlide(currentIndex); // wróć do obecnego
  });

  window.addEventListener("resize", () => {
    createDots();
    goToSlide(currentIndex);
  });

  createDots();
  goToSlide(0);
}
