"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export const META_PIXEL_ID = "1571342728047194";
export const ANALYTICS_CONSENT_KEY = "tbt.analytics-consent.v1";
export const ANALYTICS_CONSENT_EVENT = "tbt:analytics-consent";

export type AnalyticsConsentChoice = "granted" | "denied";

type MetaFbq = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push?: MetaFbq;
  queue?: unknown[][];
  version?: string;
};

declare global {
  interface Window {
    _fbq?: MetaFbq;
    __tbtMetaPixelInitialized?: boolean;
    fbq?: MetaFbq;
  }
}

export function getAnalyticsConsent(): AnalyticsConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === "granted" || value === "denied" ? value : null;
  } catch {
    return null;
  }
}

function ensureFbq(): MetaFbq {
  if (window.fbq) return window.fbq;

  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue?.push(args);
  } as MetaFbq;

  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;
  return fbq;
}

function ensureMetaPixel(): MetaFbq | null {
  if (getAnalyticsConsent() !== "granted") return null;

  const fbq = ensureFbq();
  fbq("consent", "grant");

  if (!window.__tbtMetaPixelInitialized) {
    window.__tbtMetaPixelInitialized = true;
    fbq("init", META_PIXEL_ID);
  }

  if (!document.getElementById("tbt-meta-pixel-script")) {
    const script = document.createElement("script");
    script.id = "tbt-meta-pixel-script";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
  }

  return fbq;
}

export function trackMetaLead(eventId: string): void {
  if (!eventId || getAnalyticsConsent() !== "granted") return;
  const fbq = ensureMetaPixel();
  fbq?.("trackSingle", META_PIXEL_ID, "Lead", {}, { eventID: eventId });
}

export default function MetaPixel() {
  const pathname = usePathname();
  const lastTrackedPath = useRef("");

  useEffect(() => {
    const trackPageView = () => {
      if (getAnalyticsConsent() !== "granted") return;
      if (lastTrackedPath.current === pathname) return;
      const fbq = ensureMetaPixel();
      if (!fbq) return;
      lastTrackedPath.current = pathname;
      fbq("trackSingle", META_PIXEL_ID, "PageView");
    };

    const handleConsent = (event: Event) => {
      const choice = (event as CustomEvent<AnalyticsConsentChoice>).detail;
      if (choice === "granted") {
        lastTrackedPath.current = "";
        trackPageView();
        return;
      }
      window.fbq?.("consent", "revoke");
    };

    trackPageView();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
    return () =>
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, handleConsent);
  }, [pathname]);

  return null;
}
