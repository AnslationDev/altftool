import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { TOP_PRIORITY_TOOL_SLUGS } from "@altftool/core/toolHealth";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const routeTimeoutMs = Number(process.env.ALTFT_PRIORITY_TOOL_ROUTE_TIMEOUT_MS || 60_000);

async function readToolMetaMap() {
  const source = await readFile(
    new URL("../altftoolweb/src/platform/registry/toolMetaMap.js", import.meta.url),
    "utf8",
  );
  const match = source.match(/export const toolMetaMap = (\{[\s\S]*\});?\s*$/);

  if (!match) {
    throw new Error("Unable to parse tool registry.");
  }

  return JSON.parse(match[1]);
}

async function gotoToolRoute(page, url) {
  try {
    return await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: routeTimeoutMs,
    });
  } catch (error) {
    if (!/ERR_NETWORK_IO_SUSPENDED|ECONNRESET|ECONNREFUSED/.test(error?.message || "")) {
      throw error;
    }

    await page.waitForTimeout(1_000);
    return page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: routeTimeoutMs,
    });
  }
}

const toolMetaMap = await readToolMetaMap();

test.describe("top priority microtool route health", () => {
  for (const slug of TOP_PRIORITY_TOOL_SLUGS) {
    test(`${slug} loads the public workspace shell`, async ({ page }) => {
      test.setTimeout(routeTimeoutMs + 15_000);

      const tool = toolMetaMap[slug];
      expect(tool, `${slug} should exist in generated registry`).toBeTruthy();

      const quality = createPageQualityGate(page);
      const response = await gotoToolRoute(page, `${webUrl}/tools/all/${slug}`);

      expect(response?.ok(), `${slug} route response`).toBeTruthy();

      const routeNav = page.getByRole("navigation", { name: "Tool route" });
      await expect(routeNav).toContainText("Tools", { timeout: routeTimeoutMs });
      await expect(routeNav).toContainText(tool.name, { timeout: routeTimeoutMs });
      await expect(page.getByTestId("tool-action-bar")).toBeVisible({ timeout: routeTimeoutMs });
      await expect(page.getByTestId("priority-tool-badge")).toContainText("Top 40 verified");
      await expect(page.getByTestId("copy-tool-link")).toBeVisible();
      await expect(page.getByTestId("share-tool-link")).toBeVisible();
      await expect(page.getByTestId("reset-tool-workspace")).toBeVisible();
      await expect(page.getByText("Preparing workspace")).toHaveCount(0, {
        timeout: routeTimeoutMs,
      });
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.locator("body")).not.toContainText("This page could not be found");

      await quality.expectClean(`priority tool route ${slug}`);
    });
  }
});
