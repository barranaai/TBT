const KEY = "tbt.analytics-consent.v1";
const PIXEL_ID = "1571342728047194";
const panel = document.querySelector("[data-tbt-privacy-panel]");
const openButton = document.querySelector("[data-tbt-privacy-open]");
let pageViewTracked = false;
let memoryChoice = null;

const choice = () => {
  try {
    const value = localStorage.getItem(KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch { return memoryChoice; }
};

const ensureFbq = () => {
  if (window.fbq) return window.fbq;
  const fbq = function (...args) {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  };
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
};

const ensurePixel = () => {
  if (choice() !== "granted") return null;
  const fbq = ensureFbq();
  fbq("consent", "grant");
  if (!window.__tbtMetaPixelInitialized) {
    window.__tbtMetaPixelInitialized = true;
    fbq("init", PIXEL_ID);
  }
  if (!document.getElementById("tbt-meta-pixel-script")) {
    const script = document.createElement("script");
    script.id = "tbt-meta-pixel-script";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }
  return fbq;
};

const trackPageView = () => {
  if (pageViewTracked || choice() !== "granted") return;
  const fbq = ensurePixel();
  if (!fbq) return;
  fbq("trackSingle", PIXEL_ID, "PageView");
  pageViewTracked = true;
};

const render = () => {
  const saved = choice();
  const needsChoice = saved === null;
  panel?.classList.toggle("hidden", !needsChoice);
  openButton?.classList.toggle("hidden", needsChoice);
  const state = openButton?.querySelector("[data-tbt-privacy-state]");
  if (state) state.textContent = `. Analytics is currently ${saved === "granted" ? "allowed" : "off"}.`;
};

document.querySelectorAll("[data-tbt-privacy-choice]").forEach((button) => button.addEventListener("click", () => {
  const value = button.dataset.tbtPrivacyChoice;
  memoryChoice = value;
  try { localStorage.setItem(KEY, value); } catch { /* page-view choice only */ }
  panel.classList.add("hidden");
  openButton.classList.remove("hidden");
  if (value === "granted") {
    pageViewTracked = false;
    trackPageView();
  } else {
    window.fbq?.("consent", "revoke");
  }
  render();
}));

openButton?.addEventListener("click", () => {
  panel?.classList.remove("hidden");
  openButton.classList.add("hidden");
});

window.TBTAnalytics = Object.freeze({
  consent: choice,
  trackLead(eventId) {
    if (!eventId || choice() !== "granted") return;
    ensurePixel()?.("trackSingle", PIXEL_ID, "Lead", {}, { eventID: eventId });
  },
});

render();
trackPageView();
