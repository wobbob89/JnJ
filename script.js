const revealables = document.querySelectorAll("[data-reveal]");
const navLinks = document.querySelectorAll(".js-nav-link");
const sections = document.querySelectorAll("section[id]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  revealables.forEach((element) => revealObserver.observe(element));
} else {
  revealables.forEach((element) => element.classList.add("is-visible"));
}

const setActiveNav = (id) => {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.navTarget === id);
  });
};

if ("IntersectionObserver" in window && navLinks.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (visible) {
        setActiveNav(visible.target.id);
      }
    },
    {
      threshold: [0.2, 0.45, 0.7],
      rootMargin: "-18% 0px -45% 0px",
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
} else if (sections[0]) {
  setActiveNav(sections[0].id);
}

const updateHeroOffset = () => {
  if (reducedMotion) {
    document.documentElement.style.setProperty("--hero-offset", "0px");
    return;
  }

  document.documentElement.style.setProperty("--hero-offset", `${window.scrollY * -0.06}px`);
};

updateHeroOffset();
window.addEventListener("scroll", updateHeroOffset, { passive: true });
