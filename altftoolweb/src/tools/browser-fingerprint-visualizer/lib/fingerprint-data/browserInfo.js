"use client";



export function getBrowserInfo() {
  try {
    // --- User Agent ---

    const userAgent = navigator.userAgent || "Unknown";

    const getBrowserName = (ua) => {
      if (ua.includes("Edg/")) return "Microsoft Edge";
      if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
      if (ua.includes("Brave")) return "Brave";
      if (ua.includes("Chrome")) return "Chrome";
      if (ua.includes("Firefox")) return "Firefox";
      if (ua.includes("Safari") && !ua.includes("Chrome")) return "Safari";
      return "Unknown";
    };

    const language = navigator.language || "Unknown";

    const languages = navigator.languages
      ? Array.from(navigator.languages)
      : [language];

    // --- Timezone ---

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";

    // --- Timezone Offset ---

    const timezoneOffset = new Date().getTimezoneOffset();

    // --- Cookies Enabled ---
    const cookiesEnabled = navigator.cookieEnabled;

    const doNotTrack =
      navigator.doNotTrack === "1" ||
      window.doNotTrack === "1" ||
      navigator.msDoNotTrack === "1"
        ? "Enabled"
        : "Disabled";

    // --- Global Privacy Control (newer standard) ---
    const globalPrivacyControl = navigator.globalPrivacyControl
      ? "Enabled"
      : "Disabled";

    // --- Is Webdriver (bot detection) ---

    const isWebdriver = navigator.webdriver || false;

    // --- PDF Viewer ---
    const pdfViewerEnabled = navigator.pdfViewerEnabled || false;

    // --- Plugins list ---
    const plugins = navigator.plugins
      ? Array.from(navigator.plugins).map((p) => p.name)
      : [];

    // --- Vendor ---

    const vendor = navigator.vendor || "Unknown";

    const rawValue = [userAgent, language, timezone, timezoneOffset, cookiesEnabled, doNotTrack].join("|");

    return {
      userAgent,
      browserName: getBrowserName(userAgent),
      language,
      languages,
      timezone,
      timezoneOffset,
      cookiesEnabled,
      doNotTrack,
      globalPrivacyControl,
      isWebdriver,
      pdfViewerEnabled,
      plugins,
      vendor,
      rawValue,
    };
  } catch {
    // A privacy tool that throws on navigator/Intl reads (some do, as a
    // defense mechanism) degrades to a blocked-shaped result, same contract
    // as the canvas/webgl/audio collectors, instead of failing the whole
    // fingerprint analysis.
    return {
      userAgent: "Unknown",
      browserName: "Unknown",
      language: "Unknown",
      languages: [],
      timezone: "Unknown",
      timezoneOffset: 0,
      cookiesEnabled: false,
      doNotTrack: "Disabled",
      globalPrivacyControl: "Disabled",
      isWebdriver: false,
      pdfViewerEnabled: false,
      plugins: [],
      vendor: "Unknown",
      rawValue: "browser-blocked",
    };
  }
}
