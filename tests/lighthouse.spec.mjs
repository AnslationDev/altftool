import { expect, test } from "@playwright/test";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";

const DESKTOP_CONFIG = {
  extends: "lighthouse:default",
  settings: {
    formFactor: "desktop",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    screenEmulation: {
      mobile: false,
      width: 1440,
      height: 1000,
      deviceScaleFactor: 1,
      disabled: false,
    },
    throttlingMethod: "simulate",
  },
};

const PAGES = [
  {
    name: "home",
    path: "/",
    budgets: {
      performance: 0.3,
      accessibility: 0.75,
      "best-practices": 0.75,
      seo: 0.85,
    },
  },
  {
    name: "tools catalog",
    path: "/tools",
    budgets: {
      performance: 0.3,
      accessibility: 0.75,
      "best-practices": 0.75,
      seo: 0.85,
    },
  },
  {
    name: "tool workspace",
    path: "/tools/all/api-stress-estimator",
    budgets: {
      performance: 0.3,
      accessibility: 0.75,
      "best-practices": 0.75,
      seo: 0.85,
    },
  },
  {
    name: "blogs catalog",
    path: "/blogs",
    budgets: {
      performance: 0.3,
      accessibility: 0.75,
      "best-practices": 0.75,
      seo: 0.85,
    },
  },
  {
    name: "extensions catalog",
    path: "/extensions",
    budgets: {
      performance: 0.3,
      accessibility: 0.75,
      "best-practices": 0.75,
      seo: 0.85,
    },
  },
  {
    name: "academy catalog",
    path: "/academy",
    budgets: {
      performance: 0.3,
      accessibility: 0.75,
      "best-practices": 0.75,
      seo: 0.85,
    },
  },
];

function formatScore(score) {
  return Math.round((score || 0) * 100);
}

test.describe.serial("lighthouse quality gate", () => {
  test.setTimeout(240_000);

  for (const pageConfig of PAGES) {
    test(`${pageConfig.name} meets lighthouse budgets`, async () => {
      const chrome = await launch({
        chromeFlags: [
          "--headless=new",
          "--disable-dev-shm-usage",
          "--disable-gpu",
          "--no-sandbox",
        ],
      });

      try {
        const result = await lighthouse(
          new URL(pageConfig.path, webUrl).toString(),
          {
            logLevel: "error",
            output: "json",
            port: chrome.port,
          },
          DESKTOP_CONFIG,
        );

        const categories = result.lhr.categories;
        const failures = [
          ...(result.lhr.runtimeError
            ? [`${pageConfig.name} runtime error: ${result.lhr.runtimeError.message}`]
            : []),
          ...Object.entries(pageConfig.budgets)
            .map(([category, minimum]) => {
              const score = categories[category]?.score || 0;
              return {
                category,
                minimum,
                score,
              };
            })
            .filter(({ minimum, score }) => score < minimum)
            .map(
              ({ category, minimum, score }) =>
                `${pageConfig.name} ${category}: ${formatScore(score)} < ${formatScore(minimum)}`,
            ),
        ];

        expect(failures).toEqual([]);
      } finally {
        await chrome.kill();
      }
    });
  }
});
