document.querySelectorAll("[data-tbt-square]").forEach((root) => {
  const config = window.TBTSquareConfig || {};
  const loading = root.querySelector("[data-square-loading]");
  const unconfigured = root.querySelector("[data-square-unconfigured]");
  const form = root.querySelector("[data-square-form]");
  const success = root.querySelector("[data-square-success]");
  const error = root.querySelector("[data-square-error]");
  const pay = root.querySelector("[data-square-pay]");
  const cardContainer = root.querySelector("[data-square-card]");
  let card;
  let payments;
  let idempotencyKey = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const showError = (message) => {
    error.textContent = message;
    error.classList.toggle("hidden", !message);
  };

  const loadSdk = (environment) => new Promise((resolve, reject) => {
    if (window.Square) return resolve();
    const existing = document.querySelector("script[data-square-sdk]");
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }
    const script = document.createElement("script");
    script.dataset.squareSdk = "true";
    script.async = true;
    script.src = environment === "sandbox" ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  (async () => {
    try {
      const response = await fetch(config.configEndpoint);
      const publicConfig = await response.json();
      loading.classList.add("hidden");
      if (!publicConfig.configured || !publicConfig.applicationId || !publicConfig.locationId) {
        unconfigured.classList.remove("hidden");
        return;
      }
      await loadSdk(publicConfig.environment || "production");
      payments = await window.Square.payments(publicConfig.applicationId, publicConfig.locationId);
      const style = {
        input: { color: "#16130f", fontSize: "16px" },
        ".input-container": { borderColor: "rgba(20,17,13,0.18)", borderRadius: "0px" },
        ".input-container.is-focus": { borderColor: "#9a7b46" },
        ".input-container.is-error": { borderColor: "#b91c1c" },
        ".message-text.is-error": { color: "#b91c1c" },
        "input::placeholder": { color: "rgba(20,17,13,0.4)" },
      };
      try {
        card = await payments.card({ style });
        await card.attach(cardContainer);
      } catch {
        card = await payments.card();
        await card.attach(cardContainer);
      }
      form.classList.remove("hidden");
    } catch {
      loading.classList.add("hidden");
      unconfigured.classList.remove("hidden");
      unconfigured.querySelector("p").textContent = "Could not load the secure payment field. Please refresh or contact our team.";
    }
  })();

  pay.addEventListener("click", async () => {
    if (!card || pay.disabled) return;
    pay.disabled = true;
    pay.textContent = "Processing…";
    showError("");
    let requestStarted = false;
    let responseReceived = false;
    try {
      const token = await card.tokenize();
      if (token.status !== "OK" || !token.token) throw new Error(token.errors?.[0]?.message || "Please check your card details.");
      const email = root.querySelector('[name="squareEmail"]').value.trim();
      let verificationToken;
      try {
        const verification = await payments.verifyBuyer?.(token.token, { amount: "250.00", currencyCode: "USD", intent: "CHARGE", ...(email ? { billingContact: { email } } : {}) });
        verificationToken = verification?.token;
      } catch { /* optional buyer verification */ }
      requestStarted = true;
      const response = await fetch(config.payEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceId: token.token, verificationToken, idempotencyKey, type: root.dataset.type, name: root.querySelector('[name="squareName"]').value.trim(), email, phone: root.querySelector('[name="squarePhone"]').value.trim() }) });
      responseReceived = true;
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) throw new Error(result.message || result.error || "Payment could not be completed.");
      form.classList.add("hidden");
      success.classList.remove("hidden");
    } catch (failure) {
      if (requestStarted && !responseReceived) {
        showError("We couldn't confirm your payment. Please contact us before trying again so you're not charged twice.");
        pay.textContent = "Payment status unconfirmed";
        return;
      }
      showError(failure instanceof Error ? failure.message : "Payment could not be completed.");
      pay.disabled = false;
      pay.textContent = "Pay $250 deposit";
    }
  });
});
