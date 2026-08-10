const root = document.documentElement;
const nav = document.querySelector("[data-tbt-nav]");
const menu = document.querySelector("[data-tbt-menu]");
const toggle = document.querySelector("[data-tbt-menu-toggle]");
const menuLabel = document.querySelector("[data-tbt-menu-label]");
const classicNav = document.querySelector("[data-tbt-classic-nav]");
const classicMenu = document.querySelector("[data-tbt-classic-menu]");
const classicToggle = document.querySelector("[data-tbt-classic-toggle]");

const setMenu = (open) => {
  root.classList.toggle("tbt-menu-open", open);
  if (!menu || !toggle) return;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  menu.setAttribute("aria-hidden", String(!open));
  menu.toggleAttribute("inert", !open);
  if (menuLabel) menuLabel.textContent = open ? "Close" : "Menu";
};

toggle?.addEventListener("click", () => setMenu(!root.classList.contains("tbt-menu-open")));
menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));

const setClassicMenu = (open) => {
  if (!classicNav || !classicMenu || !classicToggle) return;
  classicNav.classList.toggle("is-open", open);
  root.classList.toggle("tbt-classic-menu-open", open);
  classicToggle.setAttribute("aria-expanded", String(open));
  classicToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  classicMenu.setAttribute("aria-hidden", String(!open));
  classicMenu.toggleAttribute("inert", !open);
};

classicToggle?.addEventListener("click", () => setClassicMenu(!classicNav.classList.contains("is-open")));
classicMenu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setClassicMenu(false)));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    setMenu(false);
    setClassicMenu(false);
  }
});

const updateNav = () => nav?.classList.toggle("is-scrolled", window.scrollY > 32);
const updateClassicNav = () => classicNav?.classList.toggle("is-scrolled", window.scrollY > 24);
updateNav();
updateClassicNav();
window.addEventListener("scroll", () => { updateNav(); updateClassicNav(); }, { passive: true });

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible", "is-revealed");
    observer.unobserve(entry.target);
  }),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal, .line-reveal, .img-reveal").forEach((element) => observer.observe(element));

window.addEventListener("load", () => {
  const veil = document.querySelector(".tbt-intro-veil");
  if (!veil) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const seen = sessionStorage.getItem("tbt-intro-seen");
  if (seen || reduced) {
    veil.remove();
    return;
  }
  sessionStorage.setItem("tbt-intro-seen", "1");
  root.classList.add("tbt-intro-active");
  window.setTimeout(() => veil.classList.add("is-in"), 60);
  window.setTimeout(() => veil.classList.add("is-lift"), 1100);
  window.setTimeout(() => {
    root.classList.remove("tbt-intro-active");
    veil.remove();
  }, 2050);
});

const stats = document.querySelector("[data-tbt-stats]");
if (stats) {
  const runStats = () => {
    stats.querySelectorAll("[data-tbt-count]").forEach((node) => {
      const target = Number(node.dataset.tbtCount || 0);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        node.textContent = target.toLocaleString();
        return;
      }
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - started) / 1600, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = Math.round(eased * target).toLocaleString();
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };
  const statsObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    runStats();
    statsObserver.disconnect();
  }, { threshold: 0.4 });
  statsObserver.observe(stats);
}

const services = document.querySelector("[data-tbt-services]");
const servicePreview = services?.querySelector(".tbt-service-preview");
if (services && servicePreview) {
  const target = { x: 0, y: 0 };
  const position = { x: 0, y: 0 };
  let seeded = false;
  window.addEventListener("pointermove", (event) => {
    target.x = event.clientX;
    target.y = event.clientY;
    if (!seeded) {
      position.x = target.x;
      position.y = target.y;
      seeded = true;
    }
  }, { passive: true });
  const follow = () => {
    const ease = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 1 : 0.14;
    position.x += (target.x - position.x) * ease;
    position.y += (target.y - position.y) * ease;
    servicePreview.style.transform = `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
  services.querySelectorAll("[data-tbt-service]").forEach((link) => {
    const activate = () => {
      servicePreview.classList.add("is-active");
      servicePreview.querySelectorAll("[data-tbt-service-image]").forEach((image) => image.classList.toggle("is-active", image.dataset.tbtServiceImage === link.dataset.tbtService));
    };
    const deactivate = () => servicePreview.classList.remove("is-active");
    link.addEventListener("mouseenter", activate);
    link.addEventListener("mouseleave", deactivate);
    link.addEventListener("focus", activate);
    link.addEventListener("blur", deactivate);
  });
}

document.querySelectorAll("[data-tbt-before-after]").forEach((comparison) => {
  const before = comparison.querySelector("[data-tbt-before]");
  const handle = comparison.querySelector("[data-tbt-handle]");
  const slider = handle?.querySelector('[role="slider"]');
  let position = 50;
  let dragging = false;
  const render = () => {
    before.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
    handle.style.left = `${position}%`;
    slider.setAttribute("aria-valuenow", String(Math.round(position)));
  };
  const setFromX = (x) => {
    const rect = comparison.getBoundingClientRect();
    position = Math.min(100, Math.max(0, ((x - rect.left) / rect.width) * 100));
    render();
  };
  comparison.addEventListener("pointerdown", (event) => {
    dragging = true;
    comparison.setPointerCapture?.(event.pointerId);
    setFromX(event.clientX);
  });
  comparison.addEventListener("pointermove", (event) => {
    if (dragging) setFromX(event.clientX);
  });
  const stop = () => { dragging = false; };
  comparison.addEventListener("pointerup", stop);
  comparison.addEventListener("pointercancel", stop);
  slider?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") position = Math.max(0, position - 4);
    else if (event.key === "ArrowRight") position = Math.min(100, position + 4);
    else return;
    event.preventDefault();
    render();
  });
});

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.querySelectorAll("[data-tbt-magnetic]").forEach((element) => {
    const strength = Number(element.dataset.tbtMagnetic || 0.3);
    element.addEventListener("pointermove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      element.style.transform = `translate(${(x * strength).toFixed(2)}px, ${(y * strength).toFixed(2)}px)`;
    });
    element.addEventListener("pointerleave", () => { element.style.transform = "translate(0px, 0px)"; });
  });

  const parallaxFrames = [...document.querySelectorAll("[data-tbt-parallax]")];
  if (parallaxFrames.length) {
    let parallaxTicking = false;
    const updateParallax = () => {
      parallaxTicking = false;
      const viewportHeight = window.innerHeight;
      parallaxFrames.forEach((frame) => {
        const inner = frame.querySelector("[data-tbt-parallax-inner]");
        if (!inner) return;
        const rect = frame.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) return;
        const progress = (rect.top + rect.height / 2 - viewportHeight / 2) / (viewportHeight / 2 + rect.height / 2);
        inner.style.transform = `translate3d(0, ${(-progress * 8).toFixed(2)}%, 0)`;
      });
    };
    const queueParallax = () => {
      if (parallaxTicking) return;
      parallaxTicking = true;
      requestAnimationFrame(updateParallax);
    };
    updateParallax();
    window.addEventListener("scroll", queueParallax, { passive: true });
    window.addEventListener("resize", queueParallax, { passive: true });
  }
}
