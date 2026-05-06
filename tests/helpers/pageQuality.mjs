import { expect } from "@playwright/test";

const IGNORED_CONSOLE_PATTERNS = [
  /Download the React DevTools/i,
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

export function createPageQualityGate(page, { failOnWarnings = false } = {}) {
  let consoleIssues = [];

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
          .filter((image) => image.complete && image.currentSrc && image.naturalWidth === 0)
          .map((image) => image.getAttribute("alt") || image.currentSrc),
      ).catch(() => []);

      const issues = [
        ...consoleIssues,
        ...brokenImages.map((image) => `broken image: ${image}`),
      ].map((issue) => `${label} -> ${issue}`);

      consoleIssues = [];
      return issues;
    },

    async expectClean(label) {
      expect(await this.collect(label)).toEqual([]);
    },
  };
}
