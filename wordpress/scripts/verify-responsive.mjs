import { access, mkdir } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const base = new URL(process.env.TBT_BASE_URL || "http://127.0.0.1:9400/");
const basicAuth = process.env.TBT_BASIC_AUTH || "";
const artifactDir = path.resolve("artifacts/responsive");
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const routes = [
  "/",
  "/about/",
  "/services/",
  "/gallery/",
  "/financing/",
  "/contact/",
  "/consultation/",
  "/reserve/?type=video",
  "/privacy/",
  "/classic/",
];
const viewports = [
  { name: "mobile", width: 375, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 950 },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function findChrome() {
  for (const candidate of chromeCandidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next installed browser.
    }
  }
  throw new Error("No Chrome/Chromium executable found. Set CHROME_PATH to an installed browser.");
}

function routeName(route) {
  return route === "/" ? "home" : route.split("?")[0].replaceAll("/", "") || "home";
}

async function createContext(browser, viewport, { consent = "denied", reducedMotion = "reduce" } = {}) {
  const [username, ...passwordParts] = basicAuth.split(":");
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion,
    ...(basicAuth ? { httpCredentials: { username, password: passwordParts.join(":") } } : {}),
  });
  await context.addInitScript(({ savedConsent }) => {
    sessionStorage.setItem("tbt-intro-seen", "1");
    if (savedConsent) localStorage.setItem("tbt.analytics-consent.v1", savedConsent);
  }, { savedConsent: consent });
  return context;
}

async function openChecked(page, route, errors) {
  errors.length = 0;
  const response = await page.goto(new URL(route, base).href, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  assert(response?.status() === 200, `${route}: expected 200, received ${response?.status()}`);
  await page.waitForFunction(() => !document.querySelector(".tbt-intro-veil"));
  assert(await page.locator('link[rel="canonical"]').count() === 1, `${route}: expected one canonical link`);
  assert(await page.locator("#wpadminbar").count() === 0, `${route}: frontend admin bar is visible`);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.currentSrc || image.src),
  }));
  assert(layout.scrollWidth <= layout.clientWidth + 1, `${route}: horizontal overflow ${layout.scrollWidth}px > ${layout.clientWidth}px`);
  assert(layout.brokenImages.length === 0, `${route}: broken images: ${layout.brokenImages.join(", ")}`);
  assert(errors.length === 0, `${route}: browser errors: ${errors.join(" | ")}`);
}

await mkdir(artifactDir, { recursive: true });
const executablePath = await findChrome();
const browser = await chromium.launch({ executablePath, headless: true });

try {
  for (const viewport of viewports) {
    const context = await createContext(browser, viewport);
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("favicon.ico")) errors.push(message.text());
    });

    for (const route of routes) {
      await openChecked(page, route, errors);
      if (route === "/" || route === "/classic/") {
        await page.screenshot({ path: path.join(artifactDir, `${viewport.name}-${routeName(route)}.png`), animations: "disabled" });
      }
    }
    await context.close();
    console.log(`PASS ${viewport.name} ${viewport.width}x${viewport.height} · ${routes.length} routes`);
  }

  const mobileContext = await createContext(browser, viewports[0], { reducedMotion: "no-preference" });
  const mobilePage = await mobileContext.newPage();
  const mobileErrors = [];
  mobilePage.on("pageerror", (error) => mobileErrors.push(error.message));

  await openChecked(mobilePage, "/classic/", mobileErrors);
  const classicToggle = mobilePage.locator("[data-tbt-classic-toggle]");
  const classicMenu = mobilePage.locator("[data-tbt-classic-menu]");
  assert(await classicToggle.isVisible(), "Classic mobile menu toggle is not visible");
  await classicToggle.click();
  assert(await classicToggle.getAttribute("aria-expanded") === "true", "Classic menu did not open");
  assert(await classicMenu.getAttribute("aria-hidden") === "false" && !(await classicMenu.getAttribute("inert")), "Classic menu accessibility state is incorrect when open");
  assert(await mobilePage.locator("html").evaluate((node) => node.classList.contains("tbt-classic-menu-open")), "Classic menu did not lock the document");
  await mobilePage.keyboard.press("Escape");
  assert(await classicToggle.getAttribute("aria-expanded") === "false", "Classic menu did not close with Escape");

  const slider = mobilePage.locator('[data-tbt-before-after] [role="slider"]').first();
  await slider.scrollIntoViewIfNeeded();
  await slider.focus();
  await mobilePage.keyboard.press("ArrowRight");
  assert(await slider.getAttribute("aria-valuenow") === "54", "Classic comparison slider keyboard control failed");

  const stats = mobilePage.locator("[data-tbt-stats]");
  await stats.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(1800);
  const counterValues = await stats.locator("[data-tbt-count]").allTextContents();
  assert(JSON.stringify(counterValues) === JSON.stringify(["10", "8", "5,000", "100"]), `Classic counters failed: ${counterValues.join(", ")}`);

  await mobilePage.goto(new URL("/classic/#consultation", base).href, { waitUntil: "domcontentloaded", timeout: 30000 });
  await mobilePage.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await mobilePage.locator("#classic-first-name").fill("Barrana");
  await mobilePage.locator("#classic-last-name").fill("Parity Test");
  await mobilePage.locator("#classic-email").fill("parity@example.com");
  await mobilePage.locator("#classic-phone").fill("+14245550199");
  await mobilePage.locator("#classic-message").fill("A natural smile transformation");
  await Promise.all([
    mobilePage.waitForURL((url) => url.pathname.endsWith("/contact/")),
    mobilePage.locator('form[aria-label="Consultation request"] button[type="submit"]').click(),
  ]);
  assert(await mobilePage.locator('[data-tbt-wizard]:not(.hidden)').count() === 1, "Classic handoff did not open the New smile wizard");
  const prefill = await mobilePage.locator("[data-tbt-wizard]").evaluate((form) => ({
    firstName: form.elements.firstName.value,
    lastName: form.elements.lastName.value,
    email: form.elements.email.value,
    phone: form.elements.phone.value,
    goals: form.elements.goals.value,
  }));
  assert(JSON.stringify(prefill) === JSON.stringify({ firstName: "Barrana", lastName: "Parity Test", email: "parity@example.com", phone: "+14245550199", goals: "A natural smile transformation" }), `Classic form handoff prefill failed: ${JSON.stringify(prefill)}`);

  await openChecked(mobilePage, "/", mobileErrors);
  const atelierToggle = mobilePage.locator("[data-tbt-menu-toggle]");
  const atelierMenu = mobilePage.locator("[data-tbt-menu]");
  assert(await atelierToggle.isVisible(), "Atelier mobile menu toggle is not visible");
  await atelierToggle.click();
  assert(await atelierToggle.getAttribute("aria-expanded") === "true", "Atelier menu did not open");
  assert(await atelierMenu.getAttribute("aria-hidden") === "false" && !(await atelierMenu.getAttribute("inert")), "Atelier menu accessibility state is incorrect when open");
  await mobilePage.keyboard.press("Escape");
  assert(await atelierToggle.getAttribute("aria-expanded") === "false", "Atelier menu did not close with Escape");
  const parallax = mobilePage.locator("[data-tbt-parallax]").first();
  await parallax.scrollIntoViewIfNeeded();
  await mobilePage.evaluate(() => window.scrollBy(0, 40));
  await mobilePage.waitForTimeout(100);
  assert((await parallax.locator("[data-tbt-parallax-inner]").getAttribute("style"))?.includes("translate3d"), "Atelier selected-work parallax did not update");

  for (const [intent, phoneRequired] of [["new", true], ["existing", true], ["general", false]]) {
    await openChecked(mobilePage, "/contact/", mobileErrors);
    await mobilePage.locator(`[data-intent="${intent}"]`).click();
    assert(await mobilePage.locator("#socialHandle").isVisible(), `${intent}: Instagram handle is not available`);
    assert(await mobilePage.locator("#socialHandle").getAttribute("data-required") === "true", `${intent}: Instagram handle is not mandatory`);
    const phoneStarVisible = await mobilePage.locator("[data-phone-star]").isVisible();
    assert(phoneStarVisible === phoneRequired, `${intent}: phone requirement indicator is incorrect`);
    await mobilePage.locator("#firstName").fill("Barrana");
    await mobilePage.locator("#lastName").fill("Verifier");
    if (phoneRequired) await mobilePage.locator("#phone").fill("+14245550199");
    await mobilePage.locator("#email").fill("parity@example.com");
    await mobilePage.locator("#preferredContact").selectOption("Email");
    await mobilePage.locator("#socialHandle").fill("@barranaverifier");
    await mobilePage.locator("[data-tbt-next]").click();
    assert(await mobilePage.locator(`[data-intent-panel="${intent}"]:not(.hidden) [data-tbt-photo-field]`).count() === 1, `${intent}: mandatory smile photo control is missing`);
  }
  await mobileContext.close();
  console.log("PASS mobile menus, slider, counters, parallax, Classic handoff, and enquiry controls");

  const consentContext = await createContext(browser, viewports[0], { consent: null });
  const consentPage = await consentContext.newPage();
  await consentPage.goto(base.href, { waitUntil: "domcontentloaded", timeout: 30000 });
  await consentPage.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  assert(await consentPage.locator("[data-tbt-privacy-panel]").isVisible(), "Consent panel is not visible before a choice");
  assert(await consentPage.locator("#tbt-meta-pixel-script").count() === 0, "Meta Pixel loaded before consent");
  await consentPage.locator('[data-tbt-privacy-choice="denied"]').click();
  assert(!(await consentPage.locator("[data-tbt-privacy-panel]").isVisible()), "Consent panel remained open after Essential only");
  assert(await consentPage.locator("[data-tbt-privacy-open]").isVisible(), "Privacy choices control is not available after a choice");
  assert(await consentPage.locator("#tbt-meta-pixel-script").count() === 0, "Meta Pixel loaded after analytics was denied");
  await consentContext.close();
  console.log("PASS default-off analytics consent and Essential-only behavior");

  const analyticsContext = await createContext(browser, viewports[0], { consent: null });
  const analyticsPage = await analyticsContext.newPage();
  await analyticsPage.route("https://connect.facebook.net/**", (route) => route.abort());
  await analyticsPage.goto(base.href, { waitUntil: "domcontentloaded", timeout: 30000 });
  await analyticsPage.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await analyticsPage.locator('[data-tbt-privacy-choice="granted"]').click();
  await analyticsPage.waitForFunction(() => Boolean(window.fbq?.queue?.length));
  await analyticsPage.evaluate(() => window.TBTAnalytics.trackLead("integration-dedupe-id"));
  const analyticsState = await analyticsPage.evaluate(() => ({
    consent: window.TBTAnalytics.consent(),
    calls: (window.fbq?.queue || []).map((args) => Array.from(args)),
    script: document.getElementById("tbt-meta-pixel-script")?.getAttribute("src") || "",
  }));
  assert(analyticsState.consent === "granted" && analyticsState.script.includes("connect.facebook.net/en_US/fbevents.js"), "Analytics consent did not initialize Meta Pixel");
  assert(analyticsState.calls.some((call) => call[0] === "trackSingle" && call[2] === "PageView"), "Consented Meta PageView was not queued");
  assert(analyticsState.calls.some((call) => call[0] === "trackSingle" && call[2] === "Lead" && call[4]?.eventID === "integration-dedupe-id"), "Browser Lead event did not preserve the server dedupe ID");
  await analyticsContext.close();
  console.log("PASS consented Meta Pixel initialization and browser/server Lead dedupe ID");

  const reserveContext = await createContext(browser, viewports[0]);
  const reservePage = await reserveContext.newPage();
  await reservePage.goto(new URL("/reserve/?type=video", base).href, { waitUntil: "domcontentloaded", timeout: 30000 });
  await reservePage.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  assert(await reservePage.locator("[data-square-unconfigured]").isVisible(), "Unconfigured Square fallback is not visible");
  assert(!(await reservePage.locator("[data-square-loading]").isVisible()), "Square loading state did not finish");
  await reserveContext.close();
  console.log("PASS unconfigured Square fallback");

  console.log(`PASS responsive WordPress verification at ${base.href}`);
  console.log(`Screenshots: ${artifactDir}`);
} finally {
  await browser.close();
}
