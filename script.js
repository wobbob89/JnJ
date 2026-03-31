const revealables = document.querySelectorAll("[data-reveal]");
const stackLinks = document.querySelectorAll(".stack-link");
const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.12,
    }
  );

  revealables.forEach((element) => revealObserver.observe(element));
} else {
  revealables.forEach((element) => element.classList.add("is-visible"));
}

const updateHeroShift = () => {
  document.documentElement.style.setProperty("--hero-shift", `${window.scrollY * -0.08}px`);
};

updateHeroShift();
window.addEventListener("scroll", updateHeroShift, { passive: true });

if ("IntersectionObserver" in window && stackLinks.length > 0) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        stackLinks.forEach((link) => {
          link.classList.toggle(
            "is-active",
            link.getAttribute("href") === `#${entry.target.id}`
          );
        });
      });
    },
    {
      threshold: 0.55,
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
}
