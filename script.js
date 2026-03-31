const revealables = document.querySelectorAll("[data-reveal]");
const projectVideos = document.querySelectorAll(".js-project-video");
const navToggle = document.querySelector(".js-nav-toggle");
const siteNav = document.querySelector(".js-site-nav");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

if ("IntersectionObserver" in window && !reducedMotion) {
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
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealables.forEach((element) => revealObserver.observe(element));
} else {
  revealables.forEach((element) => element.classList.add("is-visible"));
}

const hydrateVideo = (video) => {
  if (video.dataset.loaded === "true") {
    return;
  }

  const source = document.createElement("source");
  source.src = video.dataset.videoSrc;
  source.type = "video/mp4";
  video.append(source);
  video.load();
  video.dataset.loaded = "true";
};

if ("IntersectionObserver" in window && projectVideos.length > 0) {
  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        hydrateVideo(entry.target);
        videoObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "260px 0px",
      threshold: 0.1,
    }
  );

  projectVideos.forEach((video) => videoObserver.observe(video));
} else {
  projectVideos.forEach(hydrateVideo);
}

projectVideos.forEach((video) => {
  video.addEventListener("play", () => {
    projectVideos.forEach((otherVideo) => {
      if (otherVideo !== video) {
        otherVideo.pause();
      }
    });
  });
});
