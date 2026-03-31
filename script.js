const revealables = document.querySelectorAll("[data-reveal]");

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
