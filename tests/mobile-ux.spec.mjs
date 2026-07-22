import { expect, test } from "@playwright/test";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";

const mobileRoutes = [
  "/tools/all",
  "/tools/all?search=json",
  "/blogs",
  "/blogs/age-calculator-guide",
  "/search?q=json",
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

async function expectToolWorkspaceFits(page, label) {
  const workspace = page.getByTestId("tool-workspace-shell");
  await expect(workspace).toBeVisible();
  await expect.poll(
    () => workspace.evaluate((element) => Number(Boolean(element.querySelector(
      "button, input, textarea, select, canvas, [role='button'], [data-testid='tool-output']",
    )))),
    {
      message: `${label} workspace should finish lazy loading`,
      timeout: 60_000,
    },
  ).toBe(1);

  const layout = await workspace.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      right: Math.round(rect.right),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      viewportWidth: window.innerWidth,
    };
  });

  expect(layout.left, `${label} workspace left`).toBeGreaterThanOrEqual(0);
  expect(layout.right, `${label} workspace right`).toBeLessThanOrEqual(layout.viewportWidth + 2);
  expect(layout.width, `${label} workspace width`).toBeGreaterThan(0);
  expect(layout.height, `${label} workspace height`).toBeGreaterThan(80);
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

  test("AI assistant submit control stays compact and inside mobile viewport", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Ask AltF AI" })).toBeVisible();
    const submit = page.getByRole("button", { name: "Send question" });
    await expect(submit).toBeVisible();
    await submit.scrollIntoViewIfNeeded();

    const box = await submit.boundingBox();
    expect(box, "assistant submit bounding box").toBeTruthy();
    expect(box.width, "mobile assistant submit width").toBeLessThanOrEqual(48);
    expect(box.height, "mobile assistant submit height").toBeLessThanOrEqual(48);
    expect(box.x + box.width, "mobile assistant submit right edge").toBeLessThanOrEqual(390);
    expect(box.y + box.height, "mobile assistant submit bottom edge").toBeLessThanOrEqual(844);
  });

  test("blog mobile controls remain reachable", async ({ page }) => {
    await page.goto("/blogs", { waitUntil: "domcontentloaded" });

    await expect(page.locator('main[aria-labelledby="blog-index-title"]')).toBeVisible();
    // The inline search textbox + sort dropdown were replaced by a
    // "Search all" entry link and category quick links in the blog hero,
    // so assert the current mobile controls instead.
    await expect(page.getByRole("link", { name: /Search all/i }).first()).toBeVisible();
    await expect(page.getByRole("region", { name: "Blog categories" })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Sort articles" })).toBeVisible();
    await expectNoHorizontalOverflow(page, "mobile /blogs controls");
  });

  test("blog detail mobile reader controls remain reachable", async ({ page }) => {
    await page.goto("/blogs/age-calculator-guide", { waitUntil: "domcontentloaded" });

    await expect(page.locator('main[aria-labelledby="blog-article-title"]')).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Article reading flow" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Like this guide/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Show comments/i })).toBeVisible();
    await expectNoHorizontalOverflow(page, "mobile blog detail controls");
  });
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
        test(`${slug} workspace fits without horizontal overflow`, async ({ page }) => {
          const route = `/tools/all/${slug}`;

          await page.goto(route, { waitUntil: "domcontentloaded" });
          await expect(page.getByRole("navigation", { name: "Tool route" })).toContainText("Tools");
          await expect(page.getByText("Preparing workspace")).toHaveCount(0);

          await expectToolWorkspaceFits(page, `${viewport.label} ${route}`);
          await expectNoHorizontalOverflow(page, `${viewport.label} ${route}`);
          await expect(page.locator("body")).not.toContainText("Application error");
        });
      }
    });
  }
});
