const body = document.body;
const menuButton = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
const dropdownToggles = document.querySelectorAll(".dropdown-toggle");
const homeHeader = document.querySelector(".home-page.home-redesign .site-header, .scrolling-nav-page .site-header");

if (homeHeader) {
  const updateHomeHeader = () => {
    homeHeader.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHomeHeader();
  window.addEventListener("scroll", updateHomeHeader, { passive: true });
}

if (menuButton && navMenu) {
  menuButton.addEventListener("click", () => {
    const isOpen = body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

dropdownToggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    if (!window.matchMedia("(max-width: 960px)").matches) return;
    const parent = toggle.closest(".dropdown");
    const isOpen = parent.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
});

document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal, .image-reveal, .page-hero-image, .impact-hero-image").forEach((item) => {
  observer.observe(item);
});

const heroCarousel = document.querySelector(".hero-carousel");

// Longer testimonials stay comfortably inside the fixed carousel card while
// short quotes retain the more expressive display size.
document.querySelectorAll(".testimonial-card blockquote").forEach((quote) => {
  const quoteLength = quote.textContent.trim().length;
  quote.classList.toggle("is-long", quoteLength > 180 && quoteLength <= 280);
  quote.classList.toggle("is-extra-long", quoteLength > 280);
});

if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll(".hero-slide"));
  const dots = Array.from(heroCarousel.querySelectorAll(".hero-carousel-dot"));
  const panels = Array.from(heroCarousel.querySelectorAll(".testimonial-panel"));
  const previousButton = heroCarousel.querySelector(".hero-carousel-previous");
  const nextButton = heroCarousel.querySelector(".hero-carousel-next");
  let activeSlide = 0;

  heroCarousel.classList.add("has-first-testimonial");

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;
    heroCarousel.classList.toggle("has-first-testimonial", activeSlide === 0);

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-active", slideIndex === activeSlide);
    });

    panels.forEach((panel, panelIndex) => {
      panel.classList.toggle("is-active", panelIndex === activeSlide);
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeSlide;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", String(isActive));
    });
  };

  previousButton?.addEventListener("click", () => showSlide(activeSlide - 1));
  nextButton?.addEventListener("click", () => showSlide(activeSlide + 1));

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  heroCarousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showSlide(activeSlide - 1);
    if (event.key === "ArrowRight") showSlide(activeSlide + 1);
  });
}

window.addEventListener("pageshow", () => {
  document.documentElement.animate(
    [{ opacity: 0.98 }, { opacity: 1 }],
    { duration: 220, easing: "ease-out" }
  );
});
