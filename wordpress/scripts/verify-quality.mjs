import { access, mkdir, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import axe from "axe-core";
import { chromium } from "playwright-core";

const base = new URL(process.env.TBT_BASE_URL || "http://127.0.0.1:9400/");
const basicAuth = process.env.TBT_BASIC_AUTH || "";
const artifactDir = path.resolve("artifacts/quality");
const chromeCandidates = [
  process.env.CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const defaultRoutes = ["/", "/about/", "/services/", "/gallery/", "/financing/", "/contact/", "/consultation/", "/reserve/?type=video", "/privacy/", "/classic/"];
const routes = process.env.TBT_ROUTES ? process.env.TBT_ROUTES.split(",").map((route) => route.trim()).filter(Boolean) : defaultRoutes;
const defaultViewports = [
  { name: "mobile", width: 375, height: 844, lcpBudget: 6000 },
  { name: "desktop", width: 1440, height: 950, lcpBudget: 5000 },
];
const requestedViewports = new Set((process.env.TBT_VIEWPORTS || "mobile,desktop").split(",").map((name) => name.trim()).filter(Boolean));
const viewports = defaultViewports.filter((viewport) => requestedViewports.has(viewport.name));
const performanceBudgets = {
  cls: Number(process.env.TBT_PERF_CLS || 0.1),
  load: Number(process.env.TBT_PERF_LOAD_MS || 10000),
  ttfb: Number(process.env.TBT_PERF_TTFB_MS || 3000),
  transfer: Number(process.env.TBT_PERF_TRANSFER_BYTES || 25 * 1024 * 1024),
};
const interactiveRoles = new Set(["button", "checkbox", "combobox", "link", "menuitem", "radio", "searchbox", "slider", "spinbutton", "switch", "tab", "textbox"]);

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

function summarizeViolation(violation) {
  return {
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    helpUrl: violation.helpUrl,
    targets: violation.nodes.map((node) => node.target.join(" ")),
    nodes: violation.nodes.map((node) => ({
      target: node.target.join(" "),
      html: node.html,
      failureSummary: node.failureSummary,
    })),
  };
}

async function createContext(browser, viewport) {
  const [username, ...passwordParts] = basicAuth.split(":");
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
    ...(basicAuth ? { httpCredentials: { username, password: passwordParts.join(":") } } : {}),
  });
  await context.addInitScript(() => {
    sessionStorage.setItem("tbt-intro-seen", "1");
    localStorage.setItem("tbt.analytics-consent.v1", "denied");
    window.__tbtQuality = { cls: 0, lcp: 0, longTask: 0 };
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__tbtQuality.cls += entry.value;
      }).observe({ type: "layout-shift", buffered: true });
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) window.__tbtQuality.lcp = entries.at(-1).startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__tbtQuality.longTask += entry.duration;
      }).observe({ type: "longtask", buffered: true });
    } catch {
      // Older engines can still run the structural and accessibility checks.
    }
  });
  return context;
}

async function inspectRoute(browser, viewport, route) {
  const context = await createContext(browser, viewport);
  const page = await context.newPage();
  try {
    const response = await page.goto(new URL(route, base).href, { waitUntil: "networkidle" });
    assert(response?.status() === 200, `${viewport.name} ${route}: expected 200, received ${response?.status()}`);
    await page.waitForFunction(() => !document.querySelector(".tbt-intro-veil"));
    await page.waitForTimeout(500);
    await page.addScriptTag({ content: axe.source });

    const axeResult = await page.evaluate(async () => window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
      resultTypes: ["violations"],
    }));
    const violations = axeResult.violations.map(summarizeViolation);
    const blockingViolations = violations.filter((item) => item.impact === "critical" || item.impact === "serious");

    const cdp = await context.newCDPSession(page);
    await cdp.send("Accessibility.enable");
    const accessibilityTree = await cdp.send("Accessibility.getFullAXTree");
    const unnamedInteractive = accessibilityTree.nodes.filter((node) => {
      if (node.ignored) return false;
      const role = String(node.role?.value || "");
      const name = String(node.name?.value || "").trim();
      return interactiveRoles.has(role) && !name;
    }).map((node) => ({ role: node.role?.value || "", backendDOMNodeId: node.backendDOMNodeId || null }));

    const structure = await page.evaluate(() => {
      const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((heading) => ({ level: Number(heading.tagName.slice(1)), text: heading.textContent.trim() }));
      const duplicateIds = [...document.querySelectorAll("[id]")].map((element) => element.id).filter((id, index, ids) => id && ids.indexOf(id) !== index);
      const skippedHeadings = headings.slice(1).filter((heading, index) => heading.level > headings[index].level + 1);
      const focusable = [...document.querySelectorAll('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter((element) => {
        const style = getComputedStyle(element);
        return !element.disabled && !element.hidden && style.display !== "none" && style.visibility !== "hidden" && element.getClientRects().length;
      }).length;
      return {
        lang: document.documentElement.lang,
        h1: headings.filter((heading) => heading.level === 1).length,
        main: document.querySelectorAll("main").length,
        duplicateIds: [...new Set(duplicateIds)],
        skippedHeadings,
        focusable,
      };
    });

    const tabStops = [];
    for (let index = 0; index < Math.min(structure.focusable + 2, 24); index += 1) {
      await page.keyboard.press("Tab");
      tabStops.push(await page.evaluate(() => {
        const element = document.activeElement;
        if (!element || element === document.body) return "";
        return element.getAttribute("aria-label") || element.textContent?.trim() || element.getAttribute("alt") || element.getAttribute("name") || element.id || element.tagName;
      }));
    }

    const performance = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      return {
        cls: Number((window.__tbtQuality?.cls || 0).toFixed(4)),
        domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd || 0),
        lcp: Math.round(window.__tbtQuality?.lcp || 0),
        load: Math.round(navigation?.loadEventEnd || 0),
        longTask: Math.round(window.__tbtQuality?.longTask || 0),
        resourceCount: resources.length,
        transfer: Math.round((navigation?.transferSize || 0) + resources.reduce((total, entry) => total + (entry.transferSize || 0), 0)),
        ttfb: Math.round(navigation?.responseStart || 0),
      };
    });

    const failures = [];
    const check = (condition, message) => { if (!condition) failures.push(message); };
    check(blockingViolations.length === 0, `blocking axe violations: ${blockingViolations.map((item) => item.id).join(", ")}`);
    check(unnamedInteractive.length === 0, `unnamed accessibility-tree controls: ${JSON.stringify(unnamedInteractive)}`);
    check(structure.lang === "en-US", `html language is ${structure.lang || "missing"}`);
    check(structure.h1 === 1, `expected one h1, received ${structure.h1}`);
    check(structure.main === 1, `expected one main landmark, received ${structure.main}`);
    check(structure.duplicateIds.length === 0, `duplicate IDs: ${structure.duplicateIds.join(", ")}`);
    check(structure.skippedHeadings.length === 0, `skipped heading level near ${structure.skippedHeadings[0]?.text}`);
    check(structure.focusable === 0 || tabStops.some(Boolean), "keyboard navigation found no named focus target");
    check(performance.cls <= performanceBudgets.cls, `CLS ${performance.cls} exceeds ${performanceBudgets.cls}`);
    check(performance.lcp > 0 && performance.lcp <= viewport.lcpBudget, `LCP ${performance.lcp}ms exceeds ${viewport.lcpBudget}ms`);
    check(performance.load <= performanceBudgets.load, `load ${performance.load}ms exceeds ${performanceBudgets.load}ms`);
    check(performance.ttfb <= performanceBudgets.ttfb, `TTFB ${performance.ttfb}ms exceeds ${performanceBudgets.ttfb}ms`);
    check(performance.transfer <= performanceBudgets.transfer, `transfer ${performance.transfer} exceeds ${performanceBudgets.transfer}`);

    return { viewport: viewport.name, route, axe: violations, unnamedInteractive, structure, tabStops: tabStops.filter(Boolean), performance, failures };
  } finally {
    await context.close();
  }
}

await mkdir(artifactDir, { recursive: true });
const executablePath = await findChrome();
const browser = await chromium.launch({ executablePath, headless: true });
const report = { base: base.href, generatedAt: new Date().toISOString(), axeVersion: axe.version, budgets: performanceBudgets, results: [] };
let verificationError = null;

try {
  for (const viewport of viewports) {
    for (const route of routes) {
      const result = await inspectRoute(browser, viewport, route);
      report.results.push(result);
      console.log(`${result.failures.length ? "FAIL" : "PASS"} ${viewport.name} ${route} · axe ${result.axe.length} · LCP ${result.performance.lcp}ms · CLS ${result.performance.cls}`);
    }
  }
} catch (error) {
  verificationError = error;
} finally {
  await browser.close();
  await writeFile(path.join(artifactDir, "quality-report.json"), `${JSON.stringify(report, null, 2)}\n`);
}

if (verificationError) throw verificationError;
const failed = report.results.filter((result) => result.failures.length);
assert(failed.length === 0, failed.map((result) => `${result.viewport} ${result.route}: ${result.failures.join("; ")}`).join("\n"));
console.log(`PASS accessibility and performance verification at ${base.href}`);
console.log(`Report: ${path.join(artifactDir, "quality-report.json")}`);
