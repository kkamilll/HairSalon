const menuToggle = document.querySelector("#menuToggle");
const mainNav = document.querySelector("#mainNav");
const heroBg = document.querySelector(".hero-bg");
const track = document.querySelector("#servicesTrack");
const dotsContainer = document.querySelector("#servicesDots");
const revealItems = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

if (menuToggle && mainNav) {
  const closeMenu = () => {
    mainNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = mainNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (
      mainNav.classList.contains("is-open") &&
      !mainNav.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainNav.classList.contains("is-open")) {
      closeMenu();
      menuToggle.focus();
    }
  });
}

if (revealItems.length > 0) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
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
}

if (
  heroBg &&
  !prefersReducedMotion &&
  window.matchMedia("(pointer: fine)").matches
) {
  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 8;
    const y = (event.clientY / window.innerHeight - 0.5) * 8;
    heroBg.style.transform = `scale(1.02) translate(${x}px, ${y}px)`;
  });
}

if (track) {
  let currentIndex = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let isHorizontalDrag = null;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let animationID = 0;

  const cards = track.children;
  const gap = 20;
  const prevBtn = document.querySelector("#prevService");
  const nextBtn = document.querySelector("#nextService");

  const getVisibleCards = () => {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 950) return 2;
    return 3;
  };

  const getMaxIndex = () => Math.max(0, cards.length - getVisibleCards());

  const createDots = () => {
    if (!dotsContainer) return;
    const maxIndex = getMaxIndex();
    currentIndex = Math.min(currentIndex, maxIndex);
    dotsContainer.innerHTML = "";
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.classList.add("dot");
      dot.setAttribute("aria-label", `Slajd ${i + 1}`);
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

  const updateControls = (maxIndex) => {
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;

    const dots = dotsContainer ? dotsContainer.querySelectorAll(".dot") : [];
    dots.forEach((dot, i) => {
      const isActive = i === currentIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-pressed", String(isActive));
    });
  };

  const goToSlide = (index) => {
    if (cards.length === 0) return;
    const maxIndex = getMaxIndex();
    currentIndex = Math.min(Math.max(index, 0), maxIndex);

    const cardWidth = cards[0].offsetWidth;
    currentTranslate = currentIndex * -(cardWidth + gap);
    prevTranslate = currentTranslate;
    track.style.transition = prefersReducedMotion
      ? "none"
      : "transform 0.3s ease-out";
    setSliderPosition();
    updateControls(maxIndex);
  };

  const dragStart = (e) => {
    if (e.type === "mousedown" && e.button !== 0) return;
    isDragging = true;
    isHorizontalDrag = e.type === "mousedown" ? true : null;
    startX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
    startY = e.type.includes("mouse") ? e.pageY : e.touches[0].clientY;
    track.style.transition = "none";
    animationID = requestAnimationFrame(animation);
  };

  const dragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.type.includes("mouse") ? e.pageX : e.touches[0].clientX;
    const currentY = e.type.includes("mouse") ? e.pageY : e.touches[0].clientY;
    const diffX = currentX - startX;
    const diffY = currentY - startY;

    if (isHorizontalDrag === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        isHorizontalDrag = Math.abs(diffX) > Math.abs(diffY);
      } else {
        return;
      }
    }

    if (!isHorizontalDrag) return;
    currentTranslate = prevTranslate + diffX;
  };

  const dragEnd = () => {
    if (!isDragging) return;
    isDragging = false;
    cancelAnimationFrame(animationID);

    if (isHorizontalDrag) {
      const movedBy = currentTranslate - prevTranslate;
      if (movedBy < -50) goToSlide(currentIndex + 1);
      else if (movedBy > 50) goToSlide(currentIndex - 1);
      else goToSlide(currentIndex);
    } else {
      goToSlide(currentIndex);
    }
    isHorizontalDrag = null;
  };

  track.addEventListener("touchstart", dragStart, { passive: true });
  track.addEventListener("touchmove", dragMove, { passive: true });
  track.addEventListener("touchend", dragEnd);
  track.addEventListener("touchcancel", dragEnd);

  track.addEventListener("mousedown", dragStart);
  track.addEventListener("mousemove", dragMove);
  track.addEventListener("mouseup", dragEnd);
  track.addEventListener("mouseleave", dragEnd);

  window.addEventListener("resize", () => {
    createDots();
    goToSlide(currentIndex);
  });

  createDots();
  goToSlide(0);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => goToSlide(currentIndex - 1));
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", () => goToSlide(currentIndex + 1));
  }
}

const translations = {
  pl: {
    page_title: "Atelier Nova | Salon Fryzjerski dla Kobiet",
    logo_sub: "Salon Fryzjerski",
    nav_about: "O mnie",
    nav_services: "Usługi",
    nav_gallery: "Galeria",
    nav_contact: "Kontakt",
    nav_map: "Mapa",
    hero_h1: "Salon Fryzjerski<br>dla Kobiet",
    hero_sub:
      "Atelier Nova - Twoje miejsce na profesjonalną koloryzację i strzyżenie damskie. Odkryj najwyższą jakość usług w centrum miasta.",
    hero_btn1: "Zarezerwuj termin",
    hero_btn2: "Kontakt",
    hours_title: "Godziny otwarcia",
    hours_mon: "Poniedziałek - Piątek",
    hours_sat: "Sobota",
    hours_sun: "Niedziela",
    hours_closed: "Zamknięte",
    about_label: "O mnie",
    about_title: "Poznajmy się",
    about_p1:
      "Cześć! Mam na imię Anna i jestem pasjonatką nowoczesnego fryzjerstwa. Od ponad 10 lat dbam o włosy moich klientek, wydobywając ich naturalne piękno.",
    about_p2:
      "W moim salonie stawiam na indywidualne podejście, najnowocześniejsze techniki koloryzacji oraz kosmetyki najwyższej jakości. Moim celem jest to, aby każda kobieta wychodziła z Atelier Nova z uśmiechem i pięknymi, zdrowymi włosami.",
    about_p3:
      "Zapraszam Cię do miejsca, gdzie profesjonalizm spotyka się z relaksem.",
    serv_title: "Usługi",
    prev_service_label: "Poprzednia usługa",
    next_service_label: "Następna usługa",
    s1_t: "Strzyżenie i modelowanie",
    s1_d: "Precyzyjne cięcie dopasowane do proporcji twarzy i codziennej stylizacji.",
    s2_t: "Koloryzacja premium",
    s2_d: "Refleksy, rozświetlenia i pełna zmiana koloru z ochroną kondycji włosa.",
    s3_t: "Stylizacje okazjonalne",
    s3_d: "Naturalne fale, gładkie upięcia i fryzury na eventy lub ważne uroczystości.",
    s4_t: "Pielęgnacja i regeneracja",
    s4_d: "Zabiegi odbudowujące i nawilżające przywracające miękkość oraz blask włosów.",
    s5_t: "Fryzury okolicznościowe",
    s5_d: "Upięcia i stylizacje dopracowane tak, by utrzymały formę przez cały dzień.",
    s6_t: "Korekta koloru",
    s6_d: "Bezpieczne wyrównanie odcienia i plan wyjścia do docelowego efektu.",
    s7_t: "Stylizacja ślubna",
    s7_d: "Próba fryzury i finalna stylizacja na dzień ślubu lub sesję zdjęciową, wykonana z najwyższą dbałością o trwałość.",
    s8_t: "Podcięcie końcówek",
    s8_d: "Szybka usługa odświeżająca kształt fryzury i zdrowy wygląd włosów.",
    gal_title: "Galeria",
    cont_label: "Kontakt",
    cont_title: "Umów wizytę",
    cont_desc:
      "Zadzwoń do nas lub zarezerwuj termin online w dowolnej chwili. Odpowiadamy na wszystkie zapytania tak szybko, jak to możliwe.",
    cont_addr: "Adres",
    cont_phone: "Telefon",
    cont_email: "E-mail",
    cont_btn: "Zarezerwuj przez Booksy",
    map_title: "Jak dojechać",
    foot_desc: "Salon fryzjerski dla kobiet",
  },
  en: {
    page_title: "Atelier Nova | Women's Hair Salon",
    logo_sub: "Hair Salon",
    nav_about: "About me",
    nav_services: "Services",
    nav_gallery: "Gallery",
    nav_contact: "Contact",
    nav_map: "Map",
    hero_h1: "Women's Hair Salon",
    hero_sub:
      "Atelier Nova - Your place for professional hair coloring and women's haircuts. Discover the highest quality services in the city center.",
    hero_btn1: "Book an appointment",
    hero_btn2: "Contact",
    hours_title: "Opening hours",
    hours_mon: "Monday - Friday",
    hours_sat: "Saturday",
    hours_sun: "Sunday",
    hours_closed: "Closed",
    about_label: "About me",
    about_title: "Let's get to know each other",
    about_p1:
      "Hi! My name is Anna and I am passionate about modern hairdressing. For over 10 years I have been taking care of my clients' hair, bringing out their natural beauty.",
    about_p2:
      "In my salon I focus on an individual approach, the latest coloring techniques and the highest quality cosmetics. My goal is for every woman to leave Atelier Nova with a smile and beautiful, healthy hair.",
    about_p3: "I invite you to a place where professionalism meets relaxation.",
    serv_title: "Services",
    prev_service_label: "Previous service",
    next_service_label: "Next service",
    s1_t: "Haircut and styling",
    s1_d: "Precise cut tailored to facial proportions and everyday styling.",
    s2_t: "Premium coloring",
    s2_d: "Highlights, illuminations and full color change with hair condition protection.",
    s3_t: "Occasional styling",
    s3_d: "Natural waves, smooth updos and hairstyles for events or important celebrations.",
    s4_t: "Care and regeneration",
    s4_d: "Rebuilding and moisturizing treatments restoring softness and shine to hair.",
    s5_t: "Special occasion hairstyles",
    s5_d: "Updos and styling refined to hold shape all day long.",
    s6_t: "Color correction",
    s6_d: "Safe shade evening and an exit plan to the target effect.",
    s7_t: "Bridal styling",
    s7_d: "Hairstyle trial and final styling for the wedding day or photo session, made with the utmost care for durability.",
    s8_t: "Trimming ends",
    s8_d: "Quick service refreshing the shape of the hairstyle and healthy look of the hair.",
    gal_title: "Gallery",
    cont_label: "Contact",
    cont_title: "Book an appointment",
    cont_desc:
      "Call us or book an appointment online anytime. We answer all inquiries as soon as possible.",
    cont_addr: "Address",
    cont_phone: "Phone",
    cont_email: "E-mail",
    cont_btn: "Book via Booksy",
    map_title: "How to get there",
    foot_desc: "Women's hair salon",
  },
  ua: {
    page_title: "Atelier Nova | Жіноча Перукарня",
    logo_sub: "Перукарня",
    nav_about: "Про мене",
    nav_services: "Послуги",
    nav_gallery: "Галерея",
    nav_contact: "Контакти",
    nav_map: "Карта",
    hero_h1: "Жіноча Перукарня",
    hero_sub:
      "Atelier Nova - Ваше місце для професійного фарбування та жіночих стрижок. Відкрийте для себе найвищу якість послуг у центрі міста.",
    hero_btn1: "Забронювати термін",
    hero_btn2: "Контакти",
    hours_title: "Години роботи",
    hours_mon: "Понеділок - П'ятниця",
    hours_sat: "Субота",
    hours_sun: "Неділя",
    hours_closed: "Зачинено",
    about_label: "Про мене",
    about_title: "Давайте познайомимось",
    about_p1:
      "Привіт! Мене звати Анна, і я захоплююся сучасним перукарським мистецтвом. Понад 10 років я дбаю про волосся своїх клієнток, підкреслюючи їхню природну красу.",
    about_p2:
      "У своєму салоні я роблю ставку на індивідуальний підхід, найсучасніші техніки фарбування та косметику найвищої якості. Моя мета - щоб кожна жінка виходила з Atelier Nova з усмішкою і красивим, здоровим волоссям.",
    about_p3:
      "Запрошую вас до місця, де професіоналізм зустрічається з релаксом.",
    serv_title: "Послуги",
    prev_service_label: "Попередня послуга",
    next_service_label: "Наступна послуга",
    s1_t: "Стрижка та моделювання",
    s1_d: "Точна стрижка з урахуванням пропорцій обличчя та повсякденного укладання.",
    s2_t: "Преміум фарбування",
    s2_d: "Відблиски, освітлення та повна зміна кольору із захистом стану волосся.",
    s3_t: "Святкові укладки",
    s3_d: "Природні хвилі, гладкі зачіски та укладки на події чи важливі свята.",
    s4_t: "Догляд та регенерація",
    s4_d: "Відновлювальні та зволожуючі процедури, що повертають волоссю м'якість та блиск.",
    s5_t: "Зачіски для особливих випадків",
    s5_d: "Зачіски та укладки, допрацьовані так, щоб тримати форму весь день.",
    s6_t: "Корекція кольору",
    s6_d: "Безпечне вирівнювання відтінку та план переходу до бажаного ефекту.",
    s7_t: "Весільна укладка",
    s7_d: "Пробна зачіска та фінальна укладка на день весілля чи фотосесію, виконана з максимальною увагою до стійкості.",
    s8_t: "Підрізання кінчиків",
    s8_d: "Швидка послуга, що освіжає форму зачіски та здоровий вигляд волосся.",
    gal_title: "Галерея",
    cont_label: "Контакти",
    cont_title: "Записатися на прийом",
    cont_desc:
      "Зателефонуйте нам або забронюйте термін онлайн у будь-який час. Ми відповідаємо на всі запити якомога швидше.",
    cont_addr: "Адреса",
    cont_phone: "Телефон",
    cont_email: "Електронна пошта",
    cont_btn: "Забронювати через Booksy",
    map_title: "Як доїхати",
    foot_desc: "Жіноча перукарня",
  },
};

const serviceCards = document.querySelectorAll("#uslugi .service");
const aboutParagraphs = document.querySelectorAll("#o-mnie p");
const contactLabels = document.querySelectorAll("#kontakt .contact-list strong");

const domElements = {
  logo_sub: () => document.querySelector(".logo-copy small"),
  nav_about: () => document.querySelector('.main-nav a[href="#o-mnie"]'),
  nav_services: () => document.querySelector('.main-nav a[href="#uslugi"]'),
  nav_gallery: () => document.querySelector('.main-nav a[href="#galeria"]'),
  nav_contact: () => document.querySelector('.main-nav a[href="#kontakt"]'),
  nav_map: () => document.querySelector('.main-nav a[href="#mapa"]'),
  hero_h1: () => document.querySelector(".hero-panel h1"),
  hero_sub: () => document.querySelector(".hero-subtitle"),
  hero_btn1: () => document.querySelector(".hero-actions .btn-dark"),
  hero_btn2: () => document.querySelector(".hero-actions .btn-light"),
  hours_title: () => document.querySelector(".hero-card-title"),
  hours_mon: () => document.querySelector(".hours-row:nth-child(1) span"),
  hours_sat: () => document.querySelector(".hours-row:nth-child(2) span"),
  hours_sun: () => document.querySelector(".hours-row:nth-child(3) span"),
  hours_closed: () => document.querySelector(".hours-row:nth-child(3) strong"),
  about_label: () => document.querySelector("#o-mnie .section-label"),
  about_title: () => document.querySelector("#o-mnie .section-title"),
  about_p1: () => document.querySelector("#o-mnie .about-lead"),
  about_p2: () => aboutParagraphs[2],
  about_p3: () => aboutParagraphs[3],
  serv_title: () => document.querySelector("#uslugi .section-title"),
  s1_t: () => serviceCards[0]?.querySelector("h3"),
  s1_d: () => serviceCards[0]?.querySelector("p"),
  s2_t: () => serviceCards[1]?.querySelector("h3"),
  s2_d: () => serviceCards[1]?.querySelector("p"),
  s3_t: () => serviceCards[2]?.querySelector("h3"),
  s3_d: () => serviceCards[2]?.querySelector("p"),
  s4_t: () => serviceCards[3]?.querySelector("h3"),
  s4_d: () => serviceCards[3]?.querySelector("p"),
  s5_t: () => serviceCards[4]?.querySelector("h3"),
  s5_d: () => serviceCards[4]?.querySelector("p"),
  s6_t: () => serviceCards[5]?.querySelector("h3"),
  s6_d: () => serviceCards[5]?.querySelector("p"),
  s7_t: () => serviceCards[6]?.querySelector("h3"),
  s7_d: () => serviceCards[6]?.querySelector("p"),
  s8_t: () => serviceCards[7]?.querySelector("h3"),
  s8_d: () => serviceCards[7]?.querySelector("p"),
  gal_title: () => document.querySelector("#galeria .section-title"),
  cont_label: () => document.querySelector("#kontakt .section-label"),
  cont_title: () => document.querySelector("#kontakt .section-title"),
  cont_desc: () => document.querySelector("#kontakt .contact-desc"),
  cont_addr: () => contactLabels[0],
  cont_phone: () => contactLabels[1],
  cont_email: () => contactLabels[2],
  cont_btn: () => document.querySelector("#kontakt .contact-btn"),
  map_title: () => document.querySelector("#mapa .section-title"),
  foot_desc: () => document.querySelector(".footer-inner p"),
};

function setLanguage(lang) {
  if (!translations[lang]) return;
  const dict = translations[lang];

  document.title = dict.page_title;

  for (const key in dict) {
    if (domElements[key]) {
      const el = domElements[key]();
      if (el) {
        if (key === "hero_h1") {
          el.innerHTML = dict[key];
        } else {
          el.textContent = dict[key];
        }
      }
    }
  }

  const prevBtn = document.querySelector("#prevService");
  const nextBtn = document.querySelector("#nextService");
  if (prevBtn) prevBtn.setAttribute("aria-label", dict.prev_service_label);
  if (nextBtn) nextBtn.setAttribute("aria-label", dict.next_service_label);

  document.querySelectorAll(".lang-switch a").forEach((a) => {
    const isActive = a.dataset.lang === lang;
    a.classList.toggle("active", isActive);
    a.setAttribute("aria-current", isActive ? "true" : "false");
  });

  document.documentElement.lang = lang === "ua" ? "uk" : lang;
  try {
    localStorage.setItem("salon_lang", lang);
  } catch {}
}

document.querySelectorAll(".lang-switch a").forEach((a) => {
  a.addEventListener("click", (e) => {
    e.preventDefault();
    const lang = a.dataset.lang;
    setLanguage(lang);
  });
});

const urlLang = new URLSearchParams(window.location.search).get("lang");
let savedLang = null;
try {
  savedLang = localStorage.getItem("salon_lang");
} catch {}

const initialLang = translations[urlLang]
  ? urlLang
  : translations[savedLang]
    ? savedLang
    : "pl";

if (initialLang !== "pl") {
  setLanguage(initialLang);
}
