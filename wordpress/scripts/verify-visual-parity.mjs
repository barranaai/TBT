import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import pixelmatch from "pixelmatch";
import { chromium } from "playwright-core";
import { PNG } from "pngjs";

const referenceBase = new URL(process.env.TBT_REFERENCE_URL || "http://127.0.0.1:9300/");
const targetBase = new URL(process.env.TBT_BASE_URL || "http://127.0.0.1:9400/");
const basicAuth = process.env.TBT_BASIC_AUTH || "";
const artifactDir = path.resolve("artifacts/visual-parity");
const defaultRoutes = ["/", "/about/", "/services/", "/gallery/", "/financing/", "/contact/", "/consultation/", "/reserve/?type=video", "/privacy/", "/classic/"];
const routes = process.env.TBT_ROUTES ? process.env.TBT_ROUTES.split(",").map((route) => route.trim()).filter(Boolean) : defaultRoutes;
const defaultViewports = [
  { name: "mobile", width: 375, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 950 },
];
const requestedViewports = new Set((process.env.TBT_VIEWPORTS || "mobile,tablet,desktop").split(",").map((name) => name.trim()).filter(Boolean));
const viewports = defaultViewports.filter((viewport) => requestedViewports.has(viewport.name));
// The strict semantic/media checks have zero tolerance. A small raster budget remains
// for Next Image encoding, font antialiasing and the documented contrast uplift.
const maxPixelDiff = Number(process.env.TBT_MAX_PIXEL_DIFF || 0.06);
const maxHeightDiff = Number(process.env.TBT_MAX_HEIGHT_DIFF || 0.02);
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

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
  if (route === "/") return "home";
  const url = new URL(route, "https://parity.invalid/");
  const base = url.pathname.replaceAll("/", "") || "home";
  return `${base}${url.search ? `-${url.searchParams.toString().replaceAll(/[^a-z0-9]+/gi, "-")}` : ""}`;
}

function normalizeText(value) {
  return String(value || "").replaceAll(/\s+/g, " ").trim();
}

function normalizeLink(raw, pageUrl) {
  const url = new URL(raw, pageUrl);
  const internalHosts = new Set([referenceBase.hostname, targetBase.hostname]);
  if (internalHosts.has(url.hostname)) {
    const pathname = url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "");
    return `${pathname}${url.search}${url.hash}`;
  }
  return url.href.replace(/\/$/, "");
}

function normalizeMedia(raw, pageUrl) {
  if (!raw) return "";
  const url = new URL(raw, pageUrl);
  let pathname = url.pathname;
  if (pathname === "/_next/image") {
    pathname = new URLSearchParams(url.search).get("url") || pathname;
  }
  pathname = decodeURIComponent(pathname);
  return pathname.replace(/^\/wp-content\/themes\/teeth-by-trev\/assets\/media/, "");
}

function padPng(image, width, height) {
  if (image.width === width && image.height === height) return image;
  const padded = new PNG({ width, height });
  padded.data.fill(255);
  PNG.bitblt(image, padded, 0, 0, image.width, image.height, 0, 0);
  return padded;
}

async function createContext(browser, viewport, withAuth = false) {
  const [username, ...passwordParts] = basicAuth.split(":");
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    colorScheme: "light",
    ignoreHTTPSErrors: false,
    ...(withAuth && basicAuth ? { httpCredentials: { username, password: passwordParts.join(":") } } : {}),
  });
  await context.addInitScript(() => {
    sessionStorage.setItem("tbt-intro-seen", "1");
    localStorage.setItem("tbt.analytics-consent.v1", "denied");
    const addParityStyle = () => {
      const style = document.createElement("style");
      style.dataset.tbtParity = "true";
      style.textContent = `
        *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
        html { scroll-behavior: auto !important; }
        img, video, .grain { visibility: hidden !important; }
        .reveal { opacity: 1 !important; transform: none !important; filter: none !important; }
        .line-reveal > span { transform: none !important; }
        .img-reveal { clip-path: none !important; transform: none !important; }
      `;
      document.head.append(style);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addParityStyle, { once: true });
    else addParityStyle();
  });
  return context;
}

async function settlePage(page) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
    const maximum = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    for (let y = 0; y < maximum; y += Math.max(500, window.innerHeight * 0.8)) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 35));
    }
    window.scrollTo(0, 0);
    for (const video of document.querySelectorAll("video")) {
      video.pause();
      try { video.currentTime = 0; } catch { /* The video is visually masked. */ }
    }
    await Promise.all([...document.images].map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      const finish = () => {
        clearTimeout(timeout);
        resolve();
      };
      const timeout = setTimeout(finish, 2000);
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", finish, { once: true });
    })));
  });
  await page.waitForTimeout(250);
}

async function capture(browser, base, viewport, route, label) {
  const context = await createContext(browser, viewport, label === "target");
  const page = await context.newPage();
  const url = new URL(route, base).href;
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    assert(response?.status() === 200, `${label} ${route}: expected 200, received ${response?.status()}`);
    await settlePage(page);
    const semantic = await page.evaluate(() => {
      const main = document.querySelector("main");
      const root = main || document.body;
      const visible = (element) => {
        const style = getComputedStyle(element);
        return style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length > 0;
      };
      return {
        title: document.title,
        headings: [...root.querySelectorAll("h1,h2,h3")]
          .filter(visible)
          .map((heading) => ({ level: heading.tagName.toLowerCase(), text: heading.textContent || "" })),
        text: root.innerText || "",
        links: [...root.querySelectorAll("a[href]")]
          .filter(visible)
          .map((link) => ({ text: link.textContent || link.getAttribute("aria-label") || "", href: link.href })),
        media: [...root.querySelectorAll("img,video")].map((element) => ({
          kind: element.tagName.toLowerCase(),
          alt: element instanceof HTMLImageElement ? element.alt : "",
          src: element.currentSrc || element.src || element.querySelector("source")?.src || "",
          poster: element instanceof HTMLVideoElement ? element.poster : "",
        })),
      };
    });
    const screenshot = await page.screenshot({ fullPage: true });
    return {
      url,
      screenshot,
      semantic: {
        title: normalizeText(semantic.title),
        headings: semantic.headings.map((heading) => ({ ...heading, text: normalizeText(heading.text) })),
        text: normalizeText(semantic.text),
        links: semantic.links.map((link) => ({ text: normalizeText(link.text), href: normalizeLink(link.href, url) })),
        media: semantic.media.map((item) => ({
          kind: item.kind,
          alt: normalizeText(item.alt),
          src: normalizeMedia(item.src, url),
          poster: normalizeMedia(item.poster, url),
        })),
      },
    };
  } finally {
    await context.close();
  }
}

async function compareRoute(browser, viewport, route) {
  const name = `${viewport.name}-${routeName(route)}`;
  const [reference, target] = await Promise.all([
    capture(browser, referenceBase, viewport, route, "reference"),
    capture(browser, targetBase, viewport, route, "target"),
  ]);
  const referencePng = PNG.sync.read(reference.screenshot);
  const targetPng = PNG.sync.read(target.screenshot);
  const width = Math.max(referencePng.width, targetPng.width);
  const height = Math.max(referencePng.height, targetPng.height);
  const normalizedReference = padPng(referencePng, width, height);
  const normalizedTarget = padPng(targetPng, width, height);
  const diff = new PNG({ width, height });
  const changedPixels = pixelmatch(normalizedReference.data, normalizedTarget.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
    diffColor: [255, 0, 82],
    aaColor: [255, 210, 0],
  });
  const pixelDiff = Number((changedPixels / (width * height)).toFixed(6));
  const heightDiff = Number((Math.abs(referencePng.height - targetPng.height) / Math.max(referencePng.height, targetPng.height)).toFixed(6));
  const dimensionsWithinBudget = referencePng.width === targetPng.width && heightDiff <= maxHeightDiff;
  const titleMatch = reference.semantic.title === target.semantic.title;
  const headingsMatch = JSON.stringify(reference.semantic.headings) === JSON.stringify(target.semantic.headings);
  const textMatch = reference.semantic.text === target.semantic.text;
  const linksMatch = JSON.stringify(reference.semantic.links) === JSON.stringify(target.semantic.links);
  const mediaMatch = JSON.stringify(reference.semantic.media) === JSON.stringify(target.semantic.media);

  await Promise.all([
    writeFile(path.join(artifactDir, "reference", `${name}.png`), reference.screenshot),
    writeFile(path.join(artifactDir, "target", `${name}.png`), target.screenshot),
    writeFile(path.join(artifactDir, "diff", `${name}.png`), PNG.sync.write(diff)),
  ]);

  const failures = [];
  if (!dimensionsWithinBudget) failures.push(`dimensions ${referencePng.width}x${referencePng.height} vs ${targetPng.width}x${targetPng.height}; height diff ${(heightDiff * 100).toFixed(2)}% exceeds ${(maxHeightDiff * 100).toFixed(2)}%`);
  if (!titleMatch) failures.push("title differs");
  if (!headingsMatch) failures.push("heading sequence differs");
  if (!textMatch) failures.push("visible main text differs");
  if (!linksMatch) failures.push("main link sequence differs");
  if (!mediaMatch) failures.push("main media sequence differs");
  if (pixelDiff > maxPixelDiff) failures.push(`pixel diff ${(pixelDiff * 100).toFixed(2)}% exceeds ${(maxPixelDiff * 100).toFixed(2)}%`);

  return {
    viewport: viewport.name,
    route,
    referenceUrl: reference.url,
    targetUrl: target.url,
    referenceDimensions: { width: referencePng.width, height: referencePng.height },
    targetDimensions: { width: targetPng.width, height: targetPng.height },
    heightDiff,
    pixelDiff,
    titleMatch,
    headingsMatch,
    textMatch,
    linksMatch,
    mediaMatch,
    failures,
    semantic: failures.some((failure) => failure.includes("text") || failure.includes("heading") || failure.includes("link") || failure.includes("title") || failure.includes("media"))
      ? { reference: reference.semantic, target: target.semantic }
      : undefined,
  };
}

await Promise.all([
  mkdir(path.join(artifactDir, "reference"), { recursive: true }),
  mkdir(path.join(artifactDir, "target"), { recursive: true }),
  mkdir(path.join(artifactDir, "diff"), { recursive: true }),
]);
const executablePath = await findChrome();
const browser = await chromium.launch({ executablePath, headless: true });
const report = {
  reference: referenceBase.href,
  target: targetBase.href,
  generatedAt: new Date().toISOString(),
  maxPixelDiff,
  maxHeightDiff,
  results: [],
};
let verificationError = null;

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const result = await compareRoute(browser, viewport, route);
      report.results.push(result);
      console.log(`${result.failures.length ? "FAIL" : "PASS"} ${viewport.name} ${route} · diff ${(result.pixelDiff * 100).toFixed(2)}% · ${result.referenceDimensions.height}/${result.targetDimensions.height}px`);
    }
  }
} catch (error) {
  verificationError = error;
} finally {
  await browser.close();
  await writeFile(path.join(artifactDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

if (verificationError) throw verificationError;
const failed = report.results.filter((result) => result.failures.length);
assert(failed.length === 0, failed.map((result) => `${result.viewport} ${result.route}: ${result.failures.join("; ")}`).join("\n"));
console.log(`PASS visual parity verification: ${referenceBase.href} -> ${targetBase.href}`);
console.log(`Report: ${path.join(artifactDir, "report.json")}`);
