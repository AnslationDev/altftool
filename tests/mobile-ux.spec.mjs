import { expect, test } from "@playwright/test";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";

const mobileRoutes = [
  "/tools/all",
  "/extensions",
  "/academy",
];
const toolMobileViewports = [
  { label: "390px", width: 390, height: 844 },
  { label: "430px", width: 430, height: 932 },
];

async function expectNoHorizontalOverflow(page, label) {
  const overflow = await page.evaluate(() => {
    const maxScrollWidth = Math.max(
      document.documentElement.scrollWidth,
      document.body?.scrollWidth || 0,
    );

    const offenders = Array.from(document.body.querySelectorAll("*"))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          testId: element.getAttribute("data-testid") || "",
          className: typeof element.className === "string" ? element.className : "",
          text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter(({ left, right }) => right > window.innerWidth + 2 || (left < -2 && right > 2))
      .slice(0, 8);

    return {
      innerWidth: window.innerWidth,
      maxScrollWidth,
      offenders,
    };
  });

  expect(
    overflow.maxScrollWidth,
    `${label}\n${JSON.stringify(overflow.offenders, null, 2)}`,
  ).toBeLessThanOrEqual(overflow.innerWidth + 2);
}

async function expectToolActionBarFits(page, label) {
  const actionBar = page.getByTestId("tool-action-bar");
  await expect(actionBar).toBeVisible();
  await expect(page.getByTestId("priority-tool-badge")).toContainText("Top 40 verified");

  const layout = await page.evaluate(() => {
    const items = Array.from(
      document.querySelectorAll(
        "[data-testid='tool-action-bar'], [data-testid='priority-tool-badge'], [data-testid='copy-tool-link'], [data-testid='share-tool-link'], [data-testid='reset-tool-workspace']",
      ),
    );

    return items.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        testId: element.getAttribute("data-testid"),
        text: (element.textContent || "").replace(/\s+/g, " ").trim(),
        left: Math.round(rect.left),
        right: Math.round(rect.right),
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        viewportWidth: window.innerWidth,
      };
    });
  });

  for (const item of layout) {
    expect(item.left, `${label} ${item.testId} left`).toBeGreaterThanOrEqual(0);
    expect(item.right, `${label} ${item.testId} right`).toBeLessThanOrEqual(item.viewportWidth);
    expect(item.width, `${label} ${item.testId} width`).toBeGreaterThan(32);
    expect(item.height, `${label} ${item.testId} height`).toBeGreaterThanOrEqual(32);
  }
}

test.describe("mobile layout", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });

  for (const route of mobileRoutes) {
    test(`${route} has no horizontal document overflow`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded" });

      await expectNoHorizontalOverflow(page, route);
    });
  }
});

test.describe("top priority tool mobile layout", () => {
  for (const viewport of toolMobileViewports) {
    test.describe(viewport.label, () => {
      test.use({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: true,
      });

      test("/tools/all catalog has no horizontal overflow", async ({ page }) => {
        await page.goto("/tools/all", { waitUntil: "domcontentloaded" });
        await expect(page.getByRole("heading", { name: "Explore Tools" })).toBeVisible();
        await expectNoHorizontalOverflow(page, `${viewport.label} /tools/all`);
      });

      for (const slug of TOP_PRIORITY_TOOL_SLUGS) {
        test(`${slug} action bar fits without horizontal overflow`, async ({ page }) => {
          const route = `/tools/all/${slug}`;

          await page.goto(route, { waitUntil: "domcontentloaded" });
          await expect(page.getByRole("navigation", { name: "Tool route" })).toContainText("Tools");
          await expect(page.getByText("Preparing workspace")).toHaveCount(0);

          await expectToolActionBarFits(page, `${viewport.label} ${route}`);
          await expectNoHorizontalOverflow(page, `${viewport.label} ${route}`);
          await expect(page.locator("body")).not.toContainText("Application error");
        });
      }
    });
  }
});
