const base = new URL(process.env.TBT_BASE_URL || "http://127.0.0.1:9400/");
const basicAuth = process.env.TBT_BASIC_AUTH || "";
const expectNoindex = process.env.TBT_EXPECT_NOINDEX === "1";
const cookies = new Map();

function rememberCookies(response) {
  const values = response.headers.getSetCookie?.() || (response.headers.get("set-cookie") ? [response.headers.get("set-cookie")] : []);
  values.forEach((value) => {
    const pair = value.split(";", 1)[0];
    const separator = pair.indexOf("=");
    if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  });
}

function cookieHeader() {
  return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function request(path, options = {}, follow = false) {
  let url = new URL(path, base);
  for (let attempt = 0; attempt < (follow ? 5 : 1); attempt += 1) {
    const headers = new Headers(options.headers || {});
    if (cookies.size) headers.set("Cookie", cookieHeader());
    if (basicAuth) headers.set("Authorization", `Basic ${Buffer.from(basicAuth).toString("base64")}`);
    const response = await fetch(url, { ...options, headers, redirect: "manual" });
    rememberCookies(response);
    if (!follow || ![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location) return response;
    url = new URL(location, url);
  }
  throw new Error(`Too many redirects for ${path}`);
}

function count(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("'", "&#039;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

await request("/", {}, true);

const routes = [
  ["/", "Teeth by Trev — Cosmetic & Implant Dentistry", "A couture atelier of cosmetic & implant dentistry by Dr. Trevor J. Thomas. Where the smile becomes art.", "Where the smile"],
  ["/about/", "About Dr. Trev — Teeth by Trev", "Meet Dr. Trevor J. Thomas, DDS — cosmetic & implant dentist blending artistry, precision, and genuine care into every smile.", "Dentistry is my ministry."],
  ["/services/", "Services — Teeth by Trev", "Smile makeovers, porcelain veneers, dental implants, and full-mouth rehabilitation — signature cosmetic & implant dentistry by Dr. Trevor J. Thomas.", "General Dentistry &amp; Hygiene"],
  ["/gallery/", "Smile Gallery — Teeth by Trev", "Real transformations by Dr. Trevor J. Thomas — veneers, implants, whitening, and full-mouth makeovers. Transformations, not just teeth.", "See the difference, side by side."],
  ["/financing/", "Financing — Teeth by Trev", "Smile now, pay later. Flexible financing and monthly payment plans make life-changing dentistry by Dr. Trevor J. Thomas accessible.", "Trusted financing partners."],
  ["/contact/", "Contact the Teeth by Trev Concierge Team", "Start a smile consultation, request existing-patient support, or send a general enquiry to the Teeth by Trev concierge team.", "Begin with the right team."],
  ["/consultation/", "Book a Consultation — Teeth by Trev", "Reserve a private consultation with Dr. Trevor J. Thomas — in person or by video. A considered $250 conversation about the smile you imagine.", "Begin with a conversation."],
  ["/reserve/?type=video", "Reserve Your Consultation — Teeth by Trev", "Secure your private consultation with Dr. Trevor J. Thomas with a $250 deposit, credited 100% toward your treatment.", "Reserve · Video consultation"],
  ["/privacy/", "Privacy & Analytics — Teeth by Trev", "How Teeth by Trev handles website enquiries and optional analytics.", "Your information stays under your control."],
  ["/classic/", "Teeth by Trev — Classic", "The classic Teeth by Trev experience. Cosmetic & implant dentistry by Dr. Trevor J. Thomas.", "It’s not about the teeth."],
];

const htmlByRoute = new Map();
for (const [path, title, description, marker] of routes) {
  const response = await request(path);
  const html = await response.text();
  assert(response.status === 200, `${path}: expected 200, received ${response.status}`);
  assert(html.includes(`<title>${title}</title>`), `${path}: title mismatch`);
  assert(html.includes(`name="description" content="${escapeAttribute(description)}"`), `${path}: description mismatch`);
  assert(html.includes(marker), `${path}: missing source marker ${marker}`);
  assert(count(html, /rel=["']canonical["']/g) === 1, `${path}: expected exactly one canonical`);
  const canonical = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["'][^>]*>/i)?.[1];
  assert(canonical && new URL(canonical).origin === base.origin, `${path}: canonical does not use the tested origin`);
  assert(!html.includes('id="wpadminbar"'), `${path}: frontend admin bar leaked into output`);
  if (expectNoindex) {
    const stagingRobots = [...html.matchAll(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/gi)];
    assert(stagingRobots.some((match) => match[1].includes("noindex")), `${path}: protected staging page is indexable`);
  }
  if (path.startsWith("/reserve/")) {
    const robots = [...html.matchAll(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["'][^>]*>/gi)];
    assert(robots.length === 1 && robots[0][1].includes("noindex") && robots[0][1].includes("follow"), `${path}: reserve must emit one noindex,follow directive`);
  }
  htmlByRoute.set(path, html);
  console.log(`PASS ${path} · ${title}`);
}

const assetUrls = new Set();
const internalUrls = new Set();
for (const html of htmlByRoute.values()) {
  for (const match of html.matchAll(/<(?:img|source|video)[^>]+(?:src|poster)=["']([^"']+)["']/g)) {
    const url = new URL(match[1], base);
    if (url.origin === base.origin) assetUrls.add(url.href);
  }
  for (const match of html.matchAll(/<a[^>]+href=["']([^"']+)["']/g)) {
    if (/^(?:mailto:|tel:|#)/.test(match[1])) continue;
    const url = new URL(match[1], base);
    if (url.origin !== base.origin) continue;
    url.hash = "";
    internalUrls.add(url.href);
  }
}

for (const url of assetUrls) {
  const response = await request(url, { method: "HEAD" });
  assert(response.status === 200, `asset failed: ${url} (${response.status})`);
}
console.log(`PASS ${assetUrls.size} same-origin image/video assets`);

for (const url of internalUrls) {
  const response = await request(url);
  const expectedRedirect = new URL(url).pathname.replace(/\/+$/, "") === "/atelier";
  assert(expectedRedirect ? response.status === 301 : response.status === 200, `internal link failed: ${url} (${response.status})`);
}
console.log(`PASS ${internalUrls.size} internal navigation targets`);

const atelier = await request("/atelier");
assert(atelier.status === 301, `/atelier: expected 301, received ${atelier.status}`);
assert(new URL(atelier.headers.get("location"), base).href === base.href, "/atelier: incorrect redirect target");

const missing = await request("/definitely-not-a-tbt-route/");
const missingHtml = await missing.text();
assert(missing.status === 404, `unknown route: expected 404, received ${missing.status}`);
assert(count(missingHtml, /rel=["']canonical["']/g) === 0, "unknown route: must not canonicalize to the homepage");
assert(count(missingHtml, /name=["']description["']/g) === 0, "unknown route: must not emit a page description");

const sitemapResponse = await request("/wp-sitemap-posts-page-1.xml");
const sitemap = await sitemapResponse.text();
assert(sitemapResponse.status === 200, `page sitemap failed: ${sitemapResponse.status}`);
assert(!sitemap.includes("/reserve/"), "reserve noindex URL leaked into the page sitemap");

const healthResponse = await request("/wp-json/tbt/v1/health");
const health = await healthResponse.json();
assert(healthResponse.status === 200 && health.ok && health.plugin === "0.2.5", "health endpoint/version mismatch");

const squareResponse = await request("/api/square/config");
const square = await squareResponse.json();
assert(squareResponse.status === 200 && typeof square.configured === "boolean", "legacy Square config endpoint failed");

const commonInquiry = {
  firstName: "Parity",
  lastName: "Verifier",
  email: "parity-verifier@example.com",
  phone: "+13105550199",
  preferredContact: "Email",
  socialHandle: "@parityverifier",
  contactConsent: true,
  photos: [],
};
const inquiryPayloads = [
  { ...commonInquiry, intent: "new", city: "Beverly Hills, CA", services: ["Veneers"], goals: "Verification", timeline: "Within 1–3 months", budget: "$10K – $20K", financing: "Yes", readiness: "I am ready to schedule a consultation" },
  { ...commonInquiry, intent: "existing", city: "Beverly Hills, CA", supportCategory: "Other support", supportMessage: "Verification" },
  { ...commonInquiry, intent: "general", enquiryType: "General enquiry", message: "Verification" },
];
for (const payload of inquiryPayloads) {
  const response = await request("/wp-json/tbt/v1/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base.origin },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  assert(response.status === 422 && result.code === "photos_required", `${payload.intent}: missing smile photos were not rejected`);
}
console.log("PASS mandatory smile-photo enforcement for new, existing, and general enquiries");
const spoofedPhoto = { ...commonInquiry, intent: "general", enquiryType: "General enquiry", message: "Verification", photos: [{ name: "not-a-photo.png", dataUrl: "data:image/png;base64,SGVsbG8=" }] };
const spoofedPhotoResponse = await request("/wp-json/tbt/v1/inquiry", {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: base.origin, "X-Forwarded-For": "198.51.100.44" },
  body: JSON.stringify(spoofedPhoto),
});
const spoofedPhotoResult = await spoofedPhotoResponse.json();
assert(spoofedPhotoResponse.status === 422 && spoofedPhotoResult.code === "photos_required", "declared image MIME with invalid bytes was accepted");
console.log("PASS image signature validation and private-photo MIME hardening");
console.log(`PASS WordPress parity verification at ${base.href}`);
