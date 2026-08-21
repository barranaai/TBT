import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { chromium } from "playwright-core";

const base = new URL(process.env.TBT_INTEGRATION_BASE_URL || "http://127.0.0.1:9401/");
const cookies = new Map();
const photoDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
let requestNumber = 1;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      await access(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Continue to the next standard browser location.
    }
  }
  throw new Error("No Chrome/Chromium executable found. Set CHROME_PATH to an installed browser.");
}

async function squareBrowserContext(browser, tokenizeResult = { status: "OK", token: "browser-square-token" }) {
  const context = await browser.newContext({ viewport: { width: 375, height: 844 } });
  await context.addInitScript((result) => {
    sessionStorage.setItem("tbt-intro-seen", "1");
    localStorage.setItem("tbt.analytics-consent.v1", "denied");
    window.Square = {
      payments: async () => ({
        card: async () => ({ attach: async () => undefined, tokenize: async () => result }),
        verifyBuyer: async () => ({ token: "browser-verification-token" }),
      }),
    };
  }, tokenizeResult);
  return context;
}

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
    if (cookies.size) headers.set("Cookie", [headers.get("Cookie"), cookieHeader()].filter(Boolean).join("; "));
    const response = await fetch(url, { ...options, headers, redirect: "manual" });
    rememberCookies(response);
    if (!follow || ![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get("location");
    if (!location) return response;
    url = new URL(location, url);
  }
  throw new Error(`Too many redirects for ${path}`);
}

async function jsonRequest(path, options = {}, expectedStatus = 200) {
  const response = await request(path, options);
  const body = await response.json().catch(() => ({}));
  const statuses = Array.isArray(expectedStatus) ? expectedStatus : [expectedStatus];
  assert(statuses.includes(response.status), `${path}: expected ${statuses.join(" or ")}, received ${response.status}: ${JSON.stringify(body)}`);
  return { response, body };
}

async function reset(scenarios = {}, purge = false) {
  await jsonRequest("/wp-json/tbt-test/v1/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base.origin },
    body: JSON.stringify({ ...scenarios, purge }),
  });
}

async function state() {
  return (await jsonRequest("/wp-json/tbt-test/v1/state")).body;
}

async function runBackgroundSync() {
  return (await jsonRequest("/wp-json/tbt-test/v1/run-sync", { method: "POST", headers: { Origin: base.origin } })).body;
}

async function postInquiry(payload, expectedStatus = 200, extraHeaders = {}) {
  const ip = `198.51.100.${requestNumber++}`;
  return jsonRequest("/wp-json/tbt/v1/inquiry", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base.origin, "X-Forwarded-For": ip, "User-Agent": "TBT-Integration-Verifier/1.0", ...extraHeaders },
    body: JSON.stringify(payload),
  }, expectedStatus);
}

async function postSquare(payload, expectedStatus = 200, origin = base.origin) {
  return jsonRequest("/wp-json/tbt/v1/square/pay", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: origin },
    body: JSON.stringify(payload),
  }, expectedStatus);
}

function common(token, email) {
  return {
    submissionToken: token,
    firstName: "Barrana",
    lastName: "Integration Test",
    email,
    phone: "+14245550199",
    preferredContact: "Email",
    socialHandle: "@barrana.integration",
    contactConsent: true,
    marketingConsent: false,
    analyticsConsent: false,
    attribution: { landingUrl: `${base.origin}/contact/?utm_source=integration`, utmSource: "integration" },
    photos: [{ name: "smile.png", dataUrl: photoDataUrl }],
  };
}

function newInquiry(token = "integration-new", email = "integration-new@example.com") {
  return {
    ...common(token, email),
    intent: "new",
    city: "Beverly Hills, CA",
    services: ["Veneers"],
    goals: "A natural smile transformation",
    timeline: "Within 1–3 months",
    budget: "$10K – $20K",
    financing: "Yes",
    readiness: "I am ready to schedule a consultation",
    message: "stale general answer must be discarded",
  };
}

function existingInquiry(token = "integration-existing", email = "integration-existing@example.com") {
  return {
    ...common(token, email),
    intent: "existing",
    city: "New York, NY",
    supportCategory: "Other support",
    supportMessage: "Please help with an existing appointment.",
    goals: "stale new-patient answer must be discarded",
  };
}

function generalInquiry(token = "integration-general", email = "integration-general@example.com") {
  return {
    ...common(token, email),
    intent: "general",
    phone: "",
    organization: "Barrana AI",
    enquiryType: "General enquiry",
    message: "Integration verification enquiry.",
    goals: "stale new-patient answer must be discarded",
  };
}

function serviceLogs(snapshot, service) {
  return snapshot.logs.filter((entry) => entry.service === service);
}

function airtableFields(log) {
  return log?.body?.records?.[0]?.fields || {};
}

await request("/", {}, true);
await reset({}, true);

const healthResult = await jsonRequest("/wp-json/tbt/v1/health");
const health = healthResult.body;
assert(health.ok && health.plugin === "0.2.7" && health.airtable === true && health.square === true && health.airtablePending === 0 && health.airtablePendingDeposits === 0, `configured health mismatch: ${JSON.stringify(health)}`);
assert(healthResult.response.headers.get("cache-control")?.includes("no-store"), "Health response is cacheable");
const squareConfigResult = await jsonRequest("/wp-json/tbt/v1/square/config");
const squareConfig = squareConfigResult.body;
assert(squareConfig.configured && squareConfig.environment === "sandbox", "Square public config is not sandbox-configured");
assert(squareConfig.applicationId === "sandbox-sq0idb-integration" && squareConfig.locationId === "integration-location", "Square public identifiers mismatch");
assert(!JSON.stringify(squareConfig).includes("integration-square-token") && !("accessToken" in squareConfig), "Square access token leaked to the browser");
assert(squareConfigResult.response.headers.get("cache-control")?.includes("no-store"), "Square config response is cacheable");
assert((await state()).nextSync > 0, "Configured Airtable background sync was not scheduled");
console.log("PASS configured health and client-safe Square configuration");

await reset();
const newResult = (await postInquiry(newInquiry())).body;
assert(newResult.ok && newResult.recorded && newResult.stored && newResult.photos === 1, `New enquiry failed: ${JSON.stringify(newResult)}`);
let snapshot = await state();
let fields = airtableFields(serviceLogs(snapshot, "airtable")[0]);
assert(fields.Social === "Instagram: @barrana.integration", "New enquiry Social mapping is incorrect");
assert(fields.Photos === newResult.photosUrl && fields["Caller Type"] === "New consultation", "New enquiry Airtable routing fields are incorrect");
assert(!("Message" in fields) && fields.Services === "Veneers", "New enquiry leaked a stale branch answer");
assert(serviceLogs(snapshot, "meta").length === 0, "Meta was called without analytics consent");
assert(snapshot.inquiries.length === 1 && snapshot.photos.length === 1 && snapshot.inquiries[0].airtable_saved, "New enquiry was not stored exactly once");
const newAirtableLog = serviceLogs(snapshot, "airtable")[0];
assert(newAirtableLog.method === "PATCH" && JSON.stringify(newAirtableLog.body.performUpsert?.fieldsToMergeOn) === JSON.stringify(["Submission Token"]), "Lead Airtable writes are not idempotent upserts");

const gallery = await request(newResult.photosUrl);
const galleryHtml = await gallery.text();
assert(gallery.status === 200 && gallery.headers.get("x-robots-tag")?.includes("noindex"), "Private photo gallery noindex response failed");
assert(gallery.headers.get("x-content-type-options") === "nosniff" && gallery.headers.get("referrer-policy") === "no-referrer", "Private photo security headers are incomplete");
assert(gallery.headers.get("content-security-policy")?.includes("default-src 'none'"), "Private photo gallery CSP is missing");
const photoPath = galleryHtml.match(/<img src="([^"]+)"/)?.[1];
assert(photoPath, "Private photo gallery did not contain an image URL");
const privatePhoto = await request(photoPath);
assert(privatePhoto.status === 200 && privatePhoto.headers.get("content-type")?.startsWith("image/png"), "Private photo bytes/MIME could not be retrieved");
assert(privatePhoto.headers.get("x-frame-options") === "DENY", "Private photo anti-framing header is missing");
console.log("PASS New enquiry, exact Social mapping, branch scoping, and private photo delivery");

await reset();
const existingResult = (await postInquiry(existingInquiry())).body;
assert(existingResult.ok && existingResult.stored && existingResult.photos === 1, "Existing-patient enquiry failed");
snapshot = await state();
fields = airtableFields(serviceLogs(snapshot, "airtable")[0]);
assert(fields.Social === "Instagram: @barrana.integration" && fields["Caller Type"] === "Existing patient", "Existing enquiry Airtable mapping failed");
assert(fields["Existing Patient Issue"] === "Please help with an existing appointment." && !("Treatment Interest" in fields), "Existing enquiry branch scoping failed");

await reset();
const generalResult = (await postInquiry(generalInquiry())).body;
assert(generalResult.ok && generalResult.stored && generalResult.photos === 1, "General enquiry failed");
snapshot = await state();
fields = airtableFields(serviceLogs(snapshot, "airtable")[0]);
assert(fields.Social === "Instagram: @barrana.integration" && fields["Caller Type"] === "General / business", "General enquiry Airtable mapping failed");
assert(fields.Message === "Integration verification enquiry." && !("Treatment Interest" in fields), "General enquiry branch scoping failed");
assert(snapshot.inquiries.length === 3 && snapshot.photos.length === 3, "Three enquiry types were not stored once each");
console.log("PASS Existing and General enquiry Airtable mappings and branch scoping");

const retryPayload = newInquiry("integration-retry", "integration-retry@example.com");
retryPayload.analyticsConsent = true;
retryPayload.attribution.fbclid = "fbclid-integration-123";
await reset({
  airtable: [{ status: 503, body: { error: "temporary" } }, { status: 201 }],
  meta: [{ status: 503, body: { error: "temporary" } }, { status: 200 }],
});
const retryFirst = (await postInquiry(retryPayload, 200, { Cookie: "_fbp=fb.1.123.integration" })).body;
assert(retryFirst.ok && retryFirst.recorded && retryFirst.stored === false && retryFirst.metaServerEventAccepted === false, "First degraded enquiry response was incorrect");
const retrySecond = (await postInquiry(retryPayload, 200, { Cookie: "_fbp=fb.1.123.integration" })).body;
assert(retrySecond.ok && retrySecond.idempotent && retrySecond.stored && retrySecond.leadReference === retryFirst.leadReference, "Idempotent Airtable recovery failed");
assert(retrySecond.metaEventId === "integration-retry" && retrySecond.metaServerEventAccepted, "Idempotent Meta retry/dedupe ID failed");
snapshot = await state();
const retryRows = snapshot.inquiries.filter((row) => row.submission_token === "integration-retry");
const retryPhotos = snapshot.photos.filter((row) => row.lead_reference === retryFirst.leadReference);
assert(retryRows.length === 1 && retryPhotos.length === 1 && retryRows[0].airtable_saved, "Idempotent retry duplicated local data or failed to mark Airtable saved");
const retryAirtableLogs = serviceLogs(snapshot, "airtable");
const retryMetaLogs = serviceLogs(snapshot, "meta");
assert(retryAirtableLogs.length === 2 && retryMetaLogs.length === 2, "Upstream recovery attempts were not repeated exactly once");
for (const log of retryMetaLogs) {
  const event = log.body.data?.[0] || {};
  assert(event.event_id === "integration-retry" && event.event_name === "Lead", "Meta server event did not preserve the dedupe ID");
  assert(event.event_source_url === `${base.origin}/`, "Meta event source leaked a form/query path");
  assert(event.user_data?.fbp === "fb.1.123.integration" && /^fb\.1\.\d+\.fbclid-integration-123$/.test(event.user_data?.fbc || ""), "Meta browser identifiers were not mapped correctly");
  const serialized = JSON.stringify(log.body);
  for (const sensitive of ["Barrana", "integration-retry@example.com", "+14245550199", "@barrana.integration", "natural smile"]) {
    assert(!serialized.includes(sensitive), `Meta payload leaked sensitive form data: ${sensitive}`);
  }
}
console.log("PASS degraded Airtable/Meta recovery, local idempotency, and privacy-safe deduplication");

await reset({ airtable: [{ status: 503, body: { error: "temporary" } }] });
const backgroundPayload = generalInquiry("integration-background-sync", "background-sync@example.com");
const backgroundFirst = (await postInquiry(backgroundPayload)).body;
assert(backgroundFirst.ok && backgroundFirst.recorded && backgroundFirst.stored === false, "Background-sync fixture did not retain a local-only enquiry");
let pendingHealth = (await jsonRequest("/wp-json/tbt/v1/health")).body;
assert(pendingHealth.airtablePending === 1, `Pending Airtable enquiry was not reported: ${JSON.stringify(pendingHealth)}`);
await reset({ airtable: [{ status: 200 }] });
await runBackgroundSync();
snapshot = await state();
const backgroundRow = snapshot.inquiries.find((row) => row.submission_token === "integration-background-sync");
assert(backgroundRow?.airtable_saved && serviceLogs(snapshot, "airtable").length === 1, "Background Airtable enquiry recovery failed");
assert(serviceLogs(snapshot, "airtable")[0].body.performUpsert?.fieldsToMergeOn?.[0] === "Submission Token", "Background enquiry recovery was not an idempotent upsert");
pendingHealth = (await jsonRequest("/wp-json/tbt/v1/health")).body;
assert(pendingHealth.airtablePending === 0, "Recovered Airtable enquiry remained pending in health status");
console.log("PASS scheduled Airtable enquiry recovery and pending-health reporting");

await reset({ airtable: [{ status: 422, body: { error: { message: 'Unknown field name: "Social"' } } }] });
const criticalResult = (await postInquiry(generalInquiry("integration-critical-field", "critical-field@example.com"))).body;
assert(criticalResult.ok && criticalResult.recorded && criticalResult.stored === false, "Missing critical Airtable Social field was incorrectly accepted");
snapshot = await state();
assert(serviceLogs(snapshot, "airtable").length === 1, "Critical Airtable field was silently dropped and retried");
assert(snapshot.inquiries.find((row) => row.submission_token === "integration-critical-field")?.airtable_saved === false, "Critical-field failure was marked as Airtable-saved");

const optionalPayload = generalInquiry("integration-optional-field", "optional-field@example.com");
optionalPayload.attribution.utmTerm = "optional-term";
await reset({ airtable: [{ status: 422, body: { error: { message: 'Unknown field name: "UTM Term"' } } }, { status: 201 }] });
const optionalResult = (await postInquiry(optionalPayload)).body;
assert(optionalResult.stored, "Optional unknown Airtable field did not recover");
snapshot = await state();
const optionalLogs = serviceLogs(snapshot, "airtable");
assert(optionalLogs.length === 2, "Optional unknown Airtable field did not trigger one bounded retry");
assert("UTM Term" in airtableFields(optionalLogs[0]) && !("UTM Term" in airtableFields(optionalLogs[1])), "Optional Airtable field was not dropped only for the retry");
console.log("PASS critical Airtable field protection and optional-column compatibility retry");

const depositsBefore = (await state()).deposits.length;
await reset({ square: [{ status: 200, body: { payment: { id: "sq-success-1", status: "COMPLETED" } } }] });
const squarePayload = { sourceId: "cnon:card-nonce-ok", verificationToken: "verify-ok", idempotencyKey: "integration-square-success", type: "video", name: "Barrana Integration Test", email: "integration-new@example.com", phone: "+14245550199", amount: 1 };
const squareSuccess = (await postSquare(squarePayload)).body;
assert(squareSuccess.ok && squareSuccess.paymentId === "sq-success-1" && squareSuccess.status === "COMPLETED", "Square success response failed");
snapshot = await state();
const squareLogs = serviceLogs(snapshot, "square");
assert(squareLogs.length === 1 && squareLogs[0].url.includes("connect.squareupsandbox.com/v2/payments"), "Square did not use the sandbox Payments endpoint");
assert(squareLogs[0].authorizationPresent && squareLogs[0].squareVersion, "Square server authentication/version headers are missing");
assert(squareLogs[0].body.amount_money?.amount === 25000 && squareLogs[0].body.amount_money?.currency === "USD", "Square amount was not fixed server-side at $250 USD");
assert(squareLogs[0].body.idempotency_key === "integration-square-success" && squareLogs[0].body.location_id === "integration-location", "Square idempotency/location mapping failed");
const deposit = snapshot.deposits.find((row) => row.payment_id === "sq-success-1");
assert(deposit && Number(deposit.amount_cents) === 25000 && deposit.lead_reference === newResult.leadReference, "Successful Square payment was not reconciled to the local lead/deposit log");
const depositFields = airtableFields(serviceLogs(snapshot, "airtable").find((entry) => airtableFields(entry)["Payment ID"] === "sq-success-1"));
assert(depositFields.Amount === 250 && depositFields["Matched Lead"] === newResult.leadReference, "Square deposit Airtable reconciliation failed");
const depositAirtableLog = serviceLogs(snapshot, "airtable").find((entry) => airtableFields(entry)["Payment ID"] === "sq-success-1");
assert(depositAirtableLog.method === "PATCH" && depositAirtableLog.body.performUpsert?.fieldsToMergeOn?.[0] === "Payment ID", "Deposit Airtable write was not an idempotent Payment ID upsert");
assert(deposit.airtable_saved, "Successful deposit Airtable write was not marked locally");

await reset();
const squareRetry = (await postSquare(squarePayload)).body;
assert(squareRetry.ok && squareRetry.idempotent && squareRetry.paymentId === "sq-success-1", "Square local idempotent retry failed");
snapshot = await state();
assert(snapshot.logs.length === 0 && snapshot.deposits.length === depositsBefore + 1, "Square retry repeated an upstream charge/log write");

await reset({ square: [{ status: 400, body: { errors: [{ detail: "Sandbox card declined." }] } }] });
const declined = (await postSquare({ ...squarePayload, idempotencyKey: "integration-square-decline", sourceId: "cnon:card-nonce-decline" }, 402)).body;
assert(declined.code === "payment_failed" && declined.message === "Sandbox card declined.", "Square decline was not surfaced safely");
assert((await state()).deposits.length === depositsBefore + 1, "Declined Square payment was logged as a deposit");

await reset({ square: [{ error: "simulated timeout" }, { status: 200, body: { payment: { id: "sq-after-timeout", status: "COMPLETED" } } }] });
const ambiguousPayload = { ...squarePayload, idempotencyKey: "integration-square-timeout", sourceId: "cnon:card-nonce-timeout", email: "integration-general@example.com" };
const ambiguousFirst = (await postSquare(ambiguousPayload, 502)).body;
assert(ambiguousFirst.code === "square_network", "Ambiguous Square network failure was not distinguished");
const ambiguousSecond = (await postSquare(ambiguousPayload)).body;
assert(ambiguousSecond.ok && ambiguousSecond.paymentId === "sq-after-timeout", "Same-key Square recovery after an ambiguous failure failed");
snapshot = await state();
const ambiguousSquareLogs = serviceLogs(snapshot, "square");
assert(ambiguousSquareLogs.length === 2 && ambiguousSquareLogs.every((entry) => entry.body.idempotency_key === "integration-square-timeout"), "Square ambiguous retry changed the idempotency key");
assert(snapshot.deposits.length === depositsBefore + 2, "Recovered Square payment was not logged exactly once");
console.log("PASS Square fixed amount, success, decline, local retry, ambiguous retry, and deposit reconciliation");

await reset({ square: [{ status: 200, body: { payment: { id: "sq-background-sync", status: "COMPLETED" } } }], airtable: [{ status: 503, body: { error: "temporary" } }] });
const backgroundDepositPayload = { ...squarePayload, idempotencyKey: "integration-square-background", sourceId: "cnon:card-background", email: "background-sync@example.com" };
const backgroundDepositResult = (await postSquare(backgroundDepositPayload)).body;
assert(backgroundDepositResult.ok && backgroundDepositResult.paymentId === "sq-background-sync", "Background deposit fixture payment failed");
snapshot = await state();
assert(snapshot.deposits.find((row) => row.payment_id === "sq-background-sync")?.airtable_saved === false, "Failed deposit Airtable write was marked saved");
pendingHealth = (await jsonRequest("/wp-json/tbt/v1/health")).body;
assert(pendingHealth.airtablePendingDeposits === 1, "Pending Airtable deposit was not reported");
await reset({ airtable: [{ status: 200 }, { status: 200 }] });
await runBackgroundSync();
snapshot = await state();
const syncedDeposit = snapshot.deposits.find((row) => row.payment_id === "sq-background-sync");
const syncedDepositLog = serviceLogs(snapshot, "airtable").find((entry) => airtableFields(entry)["Payment ID"] === "sq-background-sync");
assert(syncedDeposit?.airtable_saved && syncedDepositLog?.body?.performUpsert?.fieldsToMergeOn?.[0] === "Payment ID", "Background Airtable deposit recovery failed or was not idempotent");
pendingHealth = (await jsonRequest("/wp-json/tbt/v1/health")).body;
assert(pendingHealth.airtablePendingDeposits === 0, "Recovered Airtable deposit remained pending in health status");
console.log("PASS scheduled Airtable deposit recovery and pending-health reporting");

const crossOriginInquiry = await postInquiry(generalInquiry("integration-cross-origin", "cross-origin@example.com"), [401, 403], { Origin: "https://evil.example" });
assert(crossOriginInquiry.body.code === "rest_forbidden", "Cross-origin inquiry write was not rejected");
const crossOriginSquare = await postSquare({ sourceId: "cnon:test", idempotencyKey: "cross-origin" }, [401, 403], "https://evil.example");
assert(crossOriginSquare.body.code === "rest_forbidden", "Cross-origin Square write was not rejected");
console.log("PASS public write origin boundary");

await reset({ square: [{ status: 200, body: { payment: { id: "sq-browser-success", status: "COMPLETED" } } }] });
const browser = await chromium.launch({ executablePath: await findChrome(), headless: true });
try {
  const successContext = await squareBrowserContext(browser);
  const successPage = await successContext.newPage();
  await successPage.goto(new URL("/reserve/?type=video", base).href, { waitUntil: "networkidle" });
  await successPage.locator("[data-square-form]").waitFor({ state: "visible" });
  await successPage.locator('[name="squareName"]').fill("Barrana Browser Test");
  await successPage.locator('[name="squareEmail"]').fill("integration-new@example.com");
  await successPage.locator('[name="squarePhone"]').fill("+14245550199");
  await successPage.locator("[data-square-pay]").click();
  await successPage.locator("[data-square-success]").waitFor({ state: "visible" });
  assert(!(await successPage.locator("[data-square-form]").isVisible()), "Square browser form remained visible after success");
  await successContext.close();
  snapshot = await state();
  const browserSquareLog = serviceLogs(snapshot, "square")[0];
  assert(browserSquareLog?.body?.source_id === "browser-square-token" && browserSquareLog.body.verification_token === "browser-verification-token", "Square browser tokenization/verification tokens did not reach the server");

  const tokenFailureContext = await squareBrowserContext(browser, { status: "FAILED", errors: [{ message: "Card details invalid." }] });
  const tokenFailurePage = await tokenFailureContext.newPage();
  await tokenFailurePage.goto(new URL("/reserve/?type=video", base).href, { waitUntil: "networkidle" });
  await tokenFailurePage.locator("[data-square-form]").waitFor({ state: "visible" });
  await tokenFailurePage.locator("[data-square-pay]").click();
  await tokenFailurePage.locator("[data-square-error]").filter({ hasText: "Card details invalid." }).waitFor({ state: "visible" });
  assert(!(await tokenFailurePage.locator("[data-square-pay]").isDisabled()) && (await tokenFailurePage.locator("[data-square-pay]").textContent())?.includes("Pay $250"), "Square tokenization failure did not restore a retryable button");
  await tokenFailureContext.close();

  const ambiguousContext = await squareBrowserContext(browser);
  const ambiguousPage = await ambiguousContext.newPage();
  await ambiguousPage.route("**/wp-json/tbt/v1/square/pay", (route) => route.abort("failed"));
  await ambiguousPage.goto(new URL("/reserve/?type=video", base).href, { waitUntil: "networkidle" });
  await ambiguousPage.locator("[data-square-form]").waitFor({ state: "visible" });
  await ambiguousPage.locator("[data-square-pay]").click();
  await ambiguousPage.locator("[data-square-error]").filter({ hasText: "before trying again" }).waitFor({ state: "visible" });
  assert(await ambiguousPage.locator("[data-square-pay]").isDisabled(), "Ambiguous browser payment failure allowed an unsafe immediate retry");
  assert((await ambiguousPage.locator("[data-square-pay]").textContent())?.includes("Payment status unconfirmed"), "Ambiguous browser payment state was not labelled clearly");
  await ambiguousContext.close();
} finally {
  await browser.close();
}
console.log("PASS Square browser SDK success, tokenization failure, and ambiguous-network safety states");

console.log(`PASS hermetic TBT upstream integration verification at ${base.href}`);
