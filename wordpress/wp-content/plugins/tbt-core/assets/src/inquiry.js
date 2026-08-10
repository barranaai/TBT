const root = document.querySelector("[data-tbt-inquiry]");

if (root) {
  const config = window.TBTInquiryConfig || {};
  const intentScreen = root.querySelector("[data-tbt-intent-screen]");
  const form = root.querySelector("[data-tbt-wizard]");
  const success = root.querySelector("[data-tbt-success]");
  const progress = root.querySelector("[data-tbt-progress]");
  const meta = root.querySelector("[data-tbt-step-meta]");
  const title = root.querySelector("[data-tbt-step-title]");
  const intentLabel = root.querySelector("[data-tbt-intent-label]");
  const nextButton = root.querySelector("[data-tbt-next]");
  const backButton = root.querySelector("[data-tbt-back]");
  const submitButton = root.querySelector("[data-tbt-submit]");
  const formError = root.querySelector("[data-tbt-form-error]");
  const branches = {
    new: [
      { key: "contact", label: "Contact", title: "Let’s start with you." },
      { key: "new-smile", label: "Your Smile", title: "Tell us about your smile." },
      { key: "new-investment", label: "Investment", title: "Plan the next step with confidence." },
      { key: "permission", label: "Permission", title: "Choose how our team should respond." },
    ],
    existing: [
      { key: "contact", label: "Contact", title: "Help us find the right patient record." },
      { key: "existing-support", label: "Support", title: "Tell us what kind of help you need." },
      { key: "permission", label: "Permission", title: "Choose how our team should respond." },
    ],
    general: [
      { key: "contact", label: "Contact", title: "Tell us how to reach you." },
      { key: "general-enquiry", label: "Enquiry", title: "What would you like to discuss?" },
      { key: "permission", label: "Permission", title: "Choose how our team should respond." },
    ],
  };
  const intentNames = {
    new: "New smile consultation",
    existing: "Existing-patient support",
    general: "General or business enquiry",
  };
  let intent = "";
  let step = 0;
  let photos = [];
  const choices = {};
  const submissionToken = window.crypto?.randomUUID?.() || `tbt-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const clearErrors = (scope = form) => {
    scope.querySelectorAll(".has-error").forEach((element) => element.classList.remove("has-error"));
    scope.querySelectorAll(".tbt-error").forEach((element) => element.remove());
    formError.classList.add("hidden");
    formError.textContent = "";
  };

  const showError = (element, message) => {
    const holder = element.closest(".tbt-field, .tbt-choice-field, .tbt-photo-field, .tbt-consent") || element.parentElement;
    holder.classList.add("has-error");
    const error = document.createElement("p");
    error.className = "tbt-error";
    error.setAttribute("role", "alert");
    error.textContent = message;
    holder.appendChild(error);
  };

  const currentSteps = () => branches[intent] || [];
  const currentPanel = () => root.querySelector(`[data-step="${currentSteps()[step]?.key}"]`);

  const renderProgress = () => {
    progress.textContent = "";
    currentSteps().forEach((item, index) => {
      const li = document.createElement("li");
      li.className = `flex items-center ${index < currentSteps().length - 1 ? "flex-1" : ""}`;
      const state = index < step ? "border-gold bg-gold text-onyx" : index === step ? "border-gold text-gold" : "border-ivory/20 text-ivory/40";
      li.innerHTML = `<div class="flex items-center gap-2.5"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-[0.7rem] tabular-nums ${state}" ${index === step ? 'aria-current="step"' : ""}>${index < step ? "✓" : `0${index + 1}`}</span><span class="hidden text-[0.62rem] uppercase tracking-[0.2em] lg:inline ${index === step ? "text-ivory" : "text-ivory/40"}">${item.label}</span></div>${index < currentSteps().length - 1 ? `<span class="mx-3 h-px flex-1 ${index < step ? "bg-gold/60" : "bg-ivory/15"}"></span>` : ""}`;
      progress.appendChild(li);
    });
  };

  const render = () => {
    root.querySelectorAll("[data-step]").forEach((panel) => panel.classList.add("hidden"));
    currentPanel()?.classList.remove("hidden");
    const item = currentSteps()[step];
    meta.textContent = `Step 0${step + 1} / 0${currentSteps().length} — ${item.label}`;
    title.textContent = item.title;
    intentLabel.textContent = intentNames[intent];
    const last = step === currentSteps().length - 1;
    nextButton.classList.toggle("hidden", last);
    submitButton.classList.toggle("hidden", !last);
    submitButton.classList.toggle("inline-flex", last);
    root.querySelector("[data-phone-star]")?.classList.toggle("hidden", intent === "general");
    renderProgress();
    clearErrors();
  };

  const chooseIntent = (value) => {
    intent = value;
    step = 0;
    intentScreen.classList.add("hidden");
    form.classList.remove("hidden");
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  root.querySelectorAll("[data-intent]").forEach((button) => button.addEventListener("click", () => chooseIntent(button.dataset.intent)));
  root.querySelector("[data-tbt-change-intent]")?.addEventListener("click", () => {
    intent = "";
    step = 0;
    form.classList.add("hidden");
    intentScreen.classList.remove("hidden");
  });

  root.querySelectorAll("[data-choice-field]").forEach((field) => {
    const name = field.dataset.choiceField;
    const multiple = field.dataset.multiple === "true";
    choices[name] = multiple ? [] : "";
    field.querySelectorAll("[data-choice-value]").forEach((button) => button.addEventListener("click", () => {
      const value = button.dataset.choiceValue;
      if (multiple) {
        choices[name] = choices[name].includes(value) ? choices[name].filter((item) => item !== value) : [...choices[name], value];
        button.classList.toggle("is-active", choices[name].includes(value));
        button.setAttribute("aria-pressed", String(choices[name].includes(value)));
      } else {
        choices[name] = value;
        field.querySelectorAll("[data-choice-value]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
      }
      field.classList.remove("has-error");
      field.querySelector(".tbt-error")?.remove();
    }));
  });

  const renderPhotos = () => {
    root.querySelectorAll("[data-tbt-photo-list]").forEach((list) => {
      list.textContent = "";
      photos.forEach((file, index) => {
        const li = document.createElement("li");
        li.className = "flex items-center gap-2 border border-gold/30 px-3 py-1 text-xs text-gold";
        const name = document.createElement("span");
        name.textContent = file.name;
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "text-gold/60 hover:text-gold";
        remove.setAttribute("aria-label", `Remove ${file.name}`);
        remove.textContent = "×";
        remove.addEventListener("click", () => { photos = photos.filter((_, itemIndex) => itemIndex !== index); renderPhotos(); });
        li.append(name, remove);
        list.appendChild(li);
      });
    });
  };

  root.querySelectorAll("[data-tbt-photos]").forEach((input) => input.addEventListener("change", () => {
    photos = [...photos, ...Array.from(input.files || [])].slice(0, 12);
    input.value = "";
    renderPhotos();
    root.querySelectorAll("[data-tbt-photo-field]").forEach((field) => { field.classList.remove("has-error"); field.querySelector(".tbt-error")?.remove(); });
  }));

  const validatePanel = (panel) => {
    clearErrors(panel);
    let firstInvalid = null;
    panel.querySelectorAll("input, select, textarea").forEach((field) => {
      const requiredForIntent = (field.dataset.intentRequired || "").split(",").includes(intent);
      const required = field.dataset.required === "true" || requiredForIntent;
      if (!required) return;
      const invalid = field.type === "checkbox" ? !field.checked : !String(field.value || "").trim();
      if (invalid) {
        showError(field, "Required");
        firstInvalid ||= field;
      } else if (field.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(field.value)) {
        showError(field, "Enter a valid email address");
        firstInvalid ||= field;
      }
    });
    panel.querySelectorAll("[data-choice-field]").forEach((field) => {
      const value = choices[field.dataset.choiceField];
      if (!value || (Array.isArray(value) && !value.length)) {
        showError(field, field.dataset.choiceField === "services" ? "Choose at least one service" : "Choose one option");
        firstInvalid ||= field.querySelector("button");
      }
    });
    if (["new-smile", "existing-support", "general-enquiry"].includes(panel.dataset.step) && !photos.length) {
      const photoField = panel.querySelector("[data-tbt-photo-field]");
      showError(photoField, "Add at least one photo of your smile");
      firstInvalid ||= photoField.querySelector("input");
    }
    firstInvalid?.focus?.();
    return !firstInvalid;
  };

  nextButton.addEventListener("click", () => {
    if (!validatePanel(currentPanel())) return;
    step = Math.min(step + 1, currentSteps().length - 1);
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  backButton.addEventListener("click", () => {
    if (step === 0) {
      form.classList.add("hidden");
      intentScreen.classList.remove("hidden");
      return;
    }
    step -= 1;
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const photoToDataUrl = (file) => new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const fallback = () => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    const image = new Image();
    image.onload = () => {
      try {
        let width = image.naturalWidth;
        let height = image.naturalHeight;
        const scale = Math.min(1, 1600 / Math.max(width, height));
        width = Math.round(width * scale);
        height = Math.round(height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("No canvas context");
        context.drawImage(image, 0, 0, width, height);
        URL.revokeObjectURL(objectUrl);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      } catch {
        URL.revokeObjectURL(objectUrl);
        fallback();
      }
    };
    image.onerror = () => { URL.revokeObjectURL(objectUrl); fallback(); };
    image.src = objectUrl;
  });

  const value = (name) => String(form.elements[name]?.value || "").trim();
  const attribution = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      landingUrl: window.location.href,
      referrer: document.referrer,
      utmSource: params.get("utm_source") || "",
      utmMedium: params.get("utm_medium") || "",
      utmCampaign: params.get("utm_campaign") || "",
      utmContent: params.get("utm_content") || "",
      utmTerm: params.get("utm_term") || "",
      fbclid: params.get("fbclid") || "",
      ttclid: params.get("ttclid") || "",
      entryChannel: params.get("entry_channel") || params.get("utm_source") || "",
      entryAccount: params.get("entry_account") || params.get("utm_content") || "",
    };
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    for (let index = 0; index < currentSteps().length; index += 1) {
      const panel = root.querySelector(`[data-step="${currentSteps()[index].key}"]`);
      if (!validatePanel(panel)) {
        step = index;
        render();
        validatePanel(panel);
        root.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }
    submitButton.disabled = true;
    submitButton.textContent = "Saving your enquiry…";
    formError.classList.add("hidden");
    try {
      const photoPayload = (await Promise.all(photos.map(async (file, index) => ({ name: file.name || `photo-${index + 1}.jpg`, dataUrl: await photoToDataUrl(file) })))).filter((photo) => photo.dataUrl);
      const payload = {
        intent,
        submissionToken,
        firstName: value("firstName"),
        lastName: value("lastName"),
        phone: value("phone"),
        email: value("email"),
        preferredContact: value("preferredContact"),
        socialPlatform: "Instagram",
        socialHandle: value("socialHandle"),
        hear: value("hear"),
        contactConsent: form.elements.contactConsent.checked,
        consentVersion: config.consentVersion,
        marketingConsent: form.elements.marketingConsent.checked,
        analyticsConsent: localStorage.getItem("tbt.analytics-consent.v1") === "granted",
        attribution: attribution(),
        photos: photoPayload,
      };
      if (intent === "new") Object.assign(payload, { city: value("city"), services: choices.services, goals: value("goals"), timeline: value("timeline"), budget: choices.budget, financing: choices.financing, readiness: choices.readiness });
      if (intent === "existing") Object.assign(payload, { city: value("supportCity"), supportCategory: value("supportCategory"), appointmentDate: value("appointmentDate"), supportMessage: value("supportMessage") });
      if (intent === "general") Object.assign(payload, { organization: value("organization"), enquiryType: value("enquiryType"), message: value("message") });
      const response = await fetch(config.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok || result.recorded === false) throw new Error(result.message || result.error || "Your enquiry was not saved. Please check your connection and try again.");
      const reference = result.leadReference || "";
      const handoff = `Hi, I just completed the Teeth by Trev ${intent === "new" ? "smile assessment" : "enquiry"}. My reference is ${reference}.`;
      root.querySelector("[data-tbt-reference]").textContent = reference;
      root.querySelector("[data-tbt-handoff]").textContent = handoff;
      root.querySelector("[data-tbt-copy]").addEventListener("click", async (copyEvent) => {
        try { await navigator.clipboard.writeText(handoff); copyEvent.currentTarget.textContent = "Copied"; } catch { copyEvent.currentTarget.textContent = "Copy unavailable"; }
      }, { once: true });
      if (payload.analyticsConsent && result.metaEventId) window.TBTAnalytics?.trackLead?.(result.metaEventId);
      form.classList.add("hidden");
      success.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      formError.textContent = error instanceof Error ? error.message : "Your enquiry was not saved. Please try again.";
      formError.classList.remove("hidden");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send to the concierge team";
    }
  });

  const routedIntent = new URLSearchParams(window.location.search).get("intent");
  if (["new", "existing", "general"].includes(routedIntent)) chooseIntent(routedIntent);
}

window.TBTInquiry = Object.freeze({ version: "0.2.2", ready: Boolean(root) });
