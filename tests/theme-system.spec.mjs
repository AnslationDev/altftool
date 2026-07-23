import { expect, test } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";

const themeTokens = (page) =>
  page.evaluate(() => {
    const rootStyles = getComputedStyle(document.documentElement);
    const bodyStyles = getComputedStyle(document.body);
    const normalizeHex = (value) => {
      const token = value.trim().toLowerCase();
      if (!/^#[0-9a-f]{3}$/.test(token)) return token;
      return `#${token
        .slice(1)
        .split("")
        .map((character) => `${character}${character}`)
        .join("")}`;
    };

    return {
      mode: document.documentElement.dataset.themeMode,
      theme: document.documentElement.dataset.theme,
      page: normalizeHex(rootStyles.getPropertyValue("--anslation-ds-page")),
      surface: normalizeHex(rootStyles.getPropertyValue("--anslation-ds-surface")),
      primary: normalizeHex(rootStyles.getPropertyValue("--anslation-ds-primary")),
      bodyBackground: bodyStyles.backgroundColor,
      bodyColor: bodyStyles.color,
    };
  });

async function openWithMode(page, url, mode, colorScheme = "light") {
  await page.emulateMedia({ colorScheme });
  await page.addInitScript((selectedMode) => {
    localStorage.setItem("appThemeMode", selectedMode);
  }, mode);
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.themeMode))
    .toBe(mode);
}

test.describe("theme contract", () => {
  test("web light and dark modes expose canonical tokens", async ({ browser }) => {
    const lightPage = await browser.newPage();
    await openWithMode(lightPage, `${webUrl}/tools`, "light");
    await expect.poll(() => themeTokens(lightPage)).toEqual({
      mode: "light",
      theme: "light",
      page: "#f7f8fb",
      surface: "#ffffff",
      primary: "#0d9488",
      bodyBackground: "rgb(247, 248, 251)",
      bodyColor: "rgb(17, 24, 39)",
    });
    await lightPage.close();

    const darkPage = await browser.newPage();
    await openWithMode(darkPage, `${webUrl}/tools`, "dark");
    await expect.poll(() => themeTokens(darkPage)).toEqual({
      mode: "dark",
      theme: "dark",
      page: "#070d18",
      surface: "#101827",
      primary: "#2dd4bf",
      bodyBackground: "rgb(7, 13, 24)",
      bodyColor: "rgb(248, 250, 252)",
    });
    await darkPage.close();
  });

  test("Tailwind dark utilities apply to descendants", async ({ page }) => {
    await openWithMode(page, `${webUrl}/tools/all/car-ownership-cost-analyzer`, "light");

    const probe = page.locator('[class~="dark:opacity-10"]').first();
    await expect(probe).toBeAttached();
    await expect.poll(() => probe.evaluate((node) => getComputedStyle(node).opacity)).toBe("0.05");

    await page.evaluate(() => {
      document.documentElement.dataset.theme = "dark";
    });
    await expect
      .poll(() =>
        probe.evaluate((node) => getComputedStyle(node).opacity),
      )
      .toBe("0.1");
  });

  test("system mode follows live operating-system preference changes", async ({ page }) => {
    await openWithMode(page, `${webUrl}/tools`, "system", "light");
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");

    await page.emulateMedia({ colorScheme: "dark" });
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
    await expect.poll(() => page.evaluate(() => localStorage.getItem("appThemeMode"))).toBe("system");
  });

  test("self-contained routes cannot overwrite the platform theme contract", async ({ browser }) => {
    const isolatedRoutes = [
      "/prank-socialmedia",
      "/tripfindbox",
      "/business-ops/tripfindbox",
      "/live-activity-simulation",
      "/siding",
      "/housingneeds/hvac/climatech",
      "/housingneeds/pest-control/pest-control",
      "/housingneeds/siding/siding-pros",
      "/housingneeds/windows/window-replacement",
      "/tools/all/api-stress-estimator",
      "/tools/all/card-picker",
      "/tools/all/habbit_cost_calculator",
      "/tools/all/job-offer-comparison-tool",
      "/tools/all/life-productivity-score",
    ];

    const contracts = {
      light: {
        background: "#f7f8fb",
        primary: "#0d9488",
        utilityPrimary: "rgb(13, 148, 136)",
        bodyBackground: "rgb(247, 248, 251)",
        bodyColor: "rgb(17, 24, 39)",
        bodyDisplay: "block",
        theme: "light",
      },
      dark: {
        background: "#070d18",
        primary: "#2dd4bf",
        utilityPrimary: "rgb(45, 212, 191)",
        bodyBackground: "rgb(7, 13, 24)",
        bodyColor: "rgb(248, 250, 252)",
        bodyDisplay: "block",
        theme: "dark",
      },
    };

    for (const mode of ["light", "dark"]) {
      const page = await browser.newPage();
      await openWithMode(page, `${webUrl}/prank-socialmedia`, mode);
      await expect(page.locator(".mockly-root")).toBeVisible();

      for (const route of isolatedRoutes) {
        await page.goto(`${webUrl}${route}`, { waitUntil: "domcontentloaded" });
        await expect
          .poll(() =>
            page.evaluate(() => {
              const styles = getComputedStyle(document.documentElement);
              const bodyStyles = getComputedStyle(document.body);
              const probe = document.createElement("span");
              probe.style.backgroundColor = "var(--color-primary)";
              document.body.appendChild(probe);
              const utilityPrimary = getComputedStyle(probe).backgroundColor;
              probe.remove();

              return {
                background: styles.getPropertyValue("--anslation-ds-page").trim(),
                primary: styles.getPropertyValue("--anslation-ds-primary").trim(),
                utilityPrimary,
                bodyBackground: bodyStyles.backgroundColor,
                bodyColor: bodyStyles.color,
                bodyDisplay: bodyStyles.display,
                theme: document.documentElement.dataset.theme,
              };
            }),
          )
          .toEqual(contracts[mode]);
      }

      await page.close();
    }
  });

  test("admin login uses the same light and dark token contract", async ({ browser }) => {
    const lightPage = await browser.newPage();
    await openWithMode(lightPage, `${adminUrl}/login`, "light");
    await expect.poll(() => themeTokens(lightPage)).toMatchObject({
      theme: "light",
      page: "#f7f8fb",
      surface: "#ffffff",
      primary: "#0d9488",
      bodyBackground: "rgb(247, 248, 251)",
    });
    await lightPage.close();

    const darkPage = await browser.newPage();
    await openWithMode(darkPage, `${adminUrl}/login`, "dark");
    await expect.poll(() => themeTokens(darkPage)).toMatchObject({
      theme: "dark",
      page: "#070d18",
      surface: "#101827",
      primary: "#2dd4bf",
      bodyBackground: "rgb(7, 13, 24)",
    });
    await darkPage.close();
  });
});
