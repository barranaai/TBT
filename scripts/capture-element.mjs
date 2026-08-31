// Capture a clipped screenshot of one element on a page, via headless Chrome
// over the DevTools Protocol (no dependencies). Sets the viewport to the full
// document height first, so smooth-scroll libraries and reveal-on-scroll
// animations are bypassed entirely.
// Usage: node capture-element.mjs <url> <css-selector> <outfile.png>
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const [URL_ARG, SELECTOR, OUT] = process.argv.slice(2);
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
const WIDTH = 1200;

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  `--window-size=${WIDTH},1400`,
  "--hide-scrollbars",
  "--no-first-run",
  "--user-data-dir=/tmp/tbt-cdp-profile2",
]);
chrome.stderr.on("data", () => {});

let target;
for (let i = 0; i < 40; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    target = list.find((t) => t.type === "page");
    if (target) break;
  } catch {}
  await sleep(300);
}
if (!target) { chrome.kill(); throw new Error("CDP endpoint never ready"); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { resolve, reject } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? reject(new Error(JSON.stringify(m.error))) : resolve(m.result);
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval failed");
  return r.result.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Page.navigate", { url: URL_ARG });
await sleep(3000);
// Dismiss the analytics banner if present.
await evaluate(`(() => { const b=[...document.querySelectorAll("button")].find(x=>/essential only/i.test(x.textContent)); if(b)b.click(); return true; })()`);
await sleep(500);

const docH = await evaluate("document.documentElement.scrollHeight");
await send("Emulation.setDeviceMetricsOverride", {
  width: WIDTH, height: Math.min(Math.ceil(docH) + 200, 12000), deviceScaleFactor: 2, mobile: false,
});
await sleep(1200);
await evaluate("window.scrollTo(0,0); true");
await evaluate(`(() => { document.querySelectorAll(".reveal").forEach(el => el.classList.add("is-visible")); return true; })()`);
await sleep(900);

const box = await evaluate(`(() => {
  const el = document.querySelector(${JSON.stringify(SELECTOR)});
  if (!el) return null;
  const r = el.getBoundingClientRect();
  const pad = 8;
  return { x: Math.max(0, r.left - pad), y: Math.max(0, r.top - pad), width: r.width + pad*2, height: r.height + pad*2 };
})()`);
if (!box) { chrome.kill(); throw new Error("selector not found: " + SELECTOR); }

const { data } = await send("Page.captureScreenshot", {
  format: "png", captureBeyondViewport: true,
  clip: { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.width), height: Math.ceil(box.height), scale: 1.5 },
});
writeFileSync(OUT, Buffer.from(data, "base64"));
console.log(`captured ${OUT} (${Math.round(box.width)}x${Math.round(box.height)})`);
ws.close();
chrome.kill();
