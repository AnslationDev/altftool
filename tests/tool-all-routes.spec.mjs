import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const routeTimeoutMs = Number(process.env.ALTFT_ALL_TOOL_ROUTE_TIMEOUT_MS || 60_000);

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
const toolEntries = Object.entries(toolMetaMap).sort(([a], [b]) => a.localeCompare(b));

test.describe("all microtool route health", () => {
  test.describe.configure({ mode: "serial" });

  for (const [slug, tool] of toolEntries) {
    test(`${slug} loads a stable public workspace`, async ({ page }) => {
      test.setTimeout(routeTimeoutMs + 15_000);

      const quality = createPageQualityGate(page);
      const response = await gotoToolRoute(page, `${webUrl}/tools/all/${slug}`);

      expect(response?.ok(), `${slug} route response`).toBeTruthy();

      const routeNav = page.getByRole("navigation", { name: "Tool route" });
      await expect(routeNav).toContainText("Tools", { timeout: routeTimeoutMs });
      await expect(routeNav).toContainText(tool.name, { timeout: routeTimeoutMs });
      await expect(page.getByText("Preparing workspace")).toHaveCount(0, {
        timeout: routeTimeoutMs,
      });

      const body = page.locator("body");
      await expect(body).not.toContainText("Application error");
      await expect(body).not.toContainText("This page could not be found");
      await expect(body).not.toContainText("Tool workspace could not load");

      await quality.expectClean(`tool route ${slug}`);
    });
  }
});
