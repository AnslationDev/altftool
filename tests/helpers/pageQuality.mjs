import { expect } from "@playwright/test";

const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/i,
  // Resource-load console errors carry no URL, so they cannot distinguish a
  // real broken app asset from an external service (Firebase, analytics)
  // that is simply unconfigured/unreachable in CI. They are replaced by the
  // URL-aware same-origin response check below.
  /Failed to load resource/i,
  // Firestore logs a console error for a transient transport retry even when
  // its local cache keeps the screen usable and the next request succeeds.
  // Same-origin API failures and missing rendered data remain covered below.
  /Could not reach Cloud Firestore backend[\s\S]*client will operate in offline mode/i,
  // AdSense's cross-origin iframe can probe the Storage Access API. Chromium
  // reports the denied probe as a console error even though the page and ad
  // fallback continue normally.
  /requestStorageAccess:\s*Permission denied/i,
];

const DANGEROUS_WARNING_PATTERNS = [
  /Hydration failed/i,
  /Received `true` for a non-boolean attribute/i,
  /Image with src .* has either width or height modified/i,
  /The width\(-?\d+\) and height\(-?\d+\) of chart should be greater than 0/i,
];

function shouldIgnoreConsoleMessage(text) {
  return IGNORED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text));
}

function isDangerousWarning(text) {
  return DANGEROUS_WARNING_PATTERNS.some((pattern) => pattern.test(text));
}

function isSameOriginUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

export function createPageQualityGate(
  page,
  { failOnWarnings = false, ignoreIssuePatterns = [] } = {},
) {
  let consoleIssues = [];

  function shouldIgnoreIssue(issue) {
    return ignoreIssuePatterns.some((pattern) => pattern.test(issue));
  }

  // Flag failing responses served by the app itself (missing chunks, broken
  // API routes, dead asset paths). External hosts are excluded on purpose —
  // in CI, Firebase/analytics endpoints are unconfigured or unreachable and
  // their failures say nothing about the app's own route surface.
  page.on("response", (response) => {
    const status = response.status();
    const url = response.url();
    if (status >= 400 && isSameOriginUrl(url)) {
      consoleIssues.push(`http ${status}: ${url}`);
    }
  });

  page.on("console", (message) => {
    const type = message.type();
    const text = message.text();
    const isFailureType =
      type === "error" ||
      (type === "warning" && (failOnWarnings || isDangerousWarning(text)));

    if (!isFailureType || shouldIgnoreConsoleMessage(text)) return;

    consoleIssues.push(`${type}: ${text}`);
  });

  page.on("pageerror", (error) => {
    consoleIssues.push(`pageerror: ${error.message}`);
  });

  return {
    async collect(label) {
      const brokenImages = await page.locator("img").evaluateAll((images) =>
        images
          .filter(
            (image) =>
              image.complete &&
              image.currentSrc &&
              image.naturalWidth === 0 &&
              !image.closest(".adsbygoogle"),
          )
          .map((image) => image.getAttribute("alt") || image.currentSrc),
      ).catch(() => []);

      const issues = [
        ...consoleIssues,
        ...brokenImages.map((image) => `broken image: ${image}`),
      ]
        .filter((issue) => !shouldIgnoreIssue(issue))
        .map((issue) => `${label} -> ${issue}`);

      consoleIssues = [];
      return issues;
    },

    async expectClean(label) {
      expect(await this.collect(label)).toEqual([]);
    },
  };
}
