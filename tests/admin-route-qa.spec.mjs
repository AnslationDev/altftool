import { expect, test } from "@playwright/test";
import { createPageQualityGate } from "./helpers/pageQuality.mjs";

const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const localAdminStorageKey = "ALTFT_LOCAL_ADMIN_SESSION_V1";

const adminRoutes = [
  {
    path: "/analytics",
    marker: /Analytics view|Analytics unavailable|Cross-project admin health/i,
  },
  { path: "/altftool/blogs", marker: /Blog Management/i },
  {
    path: "/altftool/buysmart",
    marker: /BuySmart Control|Loading BuySmart data|Store|Feature Brand/i,
  },
  { path: "/altftool/deals", marker: /Deals Control|Manage Deal Surfaces/i },
  { path: "/altftool/search-directory", marker: /Search Directory/i },
  {
    path: "/altftool/sale-locator",
    marker: /Manage all sales|Loading sales from Firebase/i,
  },
  { path: "/leadtree/blogs", marker: /Manage your Blogs/i },
  { path: "/leadtree/credit-cards", marker: /Manage your Credit Cards/i },
  { path: "/leadtree/blogs/view-blogs", marker: /All Blogs|Loading blogs/i },
  { path: "/leadtree/credit-cards/view-cards", marker: /All Credit Cards|Loading Cards/i },
  { path: "/leadtree/expert-videos/view-video", marker: /All Expert Videos|Loading videos/i },
];

const dealsTabs = [
  "Hero",
  "Top Coupon",
  "Categories",
  "Add Brand",
  "Brand Edit",
  "Trending Deals",
  "Best Coupon",
  "Upcoming Deal",
  "Saving Tips",
];

const buySmartTabs = [
  "Hero",
  "Store",
  "Categories",
  "Feature Brand",
  "Rule Set",
  "Trending",
];

function createMockHealthSnapshot() {
  const generatedAt = new Date().toISOString();
  const vercelCommand = "npm run deploy:readiness -- --target=all";

  return {
    generatedAt,
    cached: false,
    manifest: {
      schemaVersion: 1,
      generatedAt,
    },
    overall: {
      score: 96,
      status: "healthy",
      label: "Release ready",
    },
    tools: {
      healthy: 231,
      total: 231,
      needsAttention: 0,
      averageScore: 100,
      categories: 18,
      directories: 231,
      registryWithoutDir: [],
      orphanToolDirs: [],
      topIssues: [],
    },
    qa: {
      total: 51,
      routeCovered: 51,
      functionalCovered: 51,
      score: 100,
      tools: [],
      checks: [],
    },
    seo: {
      score: 100,
      checks: [],
    },
    content: {
      score: 100,
      metrics: [],
      checks: [],
    },
    blogContent: {
      ok: true,
      status: "ready",
      score: 100,
      source: "mock",
      generatedAt,
      totals: {
        ready: 31,
        total: 31,
        withSources: 31,
        withFaq: 31,
        withLinks: 31,
      },
      topIssues: [],
      lowestScoring: [],
      checks: [],
    },
    automation: {
      score: 100,
      checks: [],
    },
    routeQa: {
      ok: true,
      checkedAt: generatedAt,
      score: 100,
      totals: {
        routes: 162,
        browserProbes: 15,
        failures: 0,
        warnings: 0,
        slowRoutes: 0,
      },
      performance: {
        averageMs: 220,
        p95Ms: 830,
        maxMs: 1200,
        thresholdMs: 2500,
        slowest: [],
      },
      routeGroups: {},
      groupMatrix: [],
      matrix: [],
    },
    firebaseAdmin: {
      score: 100,
      status: "ready",
      adminSdkReady: true,
      firestoreReadable: true,
      missing: [],
      invalid: [],
      checks: [],
    },
    firebaseLiveData: {
      ok: true,
      status: "ready",
      score: 100,
      projectId: "altftool-bca36",
      passingChecks: 19,
      totalChecks: 19,
      failures: [],
      checks: [],
      sections: {
        buySmart: {},
        consumerRating: {},
        blogs: { firstPageCount: 31 },
        extensions: { displayableCount: 12 },
        academy: { displayableCount: 8 },
        trendingVideos: { displayableCount: 10 },
      },
    },
    firebaseDataIntegrity: {
      ok: true,
      status: "ready",
      score: 100,
      projectId: "altftool-bca36",
      passingChecks: 12,
      totalChecks: 12,
      checks: [],
      failures: [],
      warnings: [],
    },
    runtimeQuality: {
      ok: true,
      status: "ready",
      score: 100,
      generatedAt,
      summary: {
        total: 4,
        pass: 4,
        block: 0,
      },
      commands: {
        combined: "npm run validate:runtime-quality",
      },
      gates: [],
      blockers: [],
    },
    performanceBudget: {
      ok: true,
      status: "clean",
      score: 100,
      generatedAt,
      totals: {
        publicImages: 390,
        dynamicToolImports: 231,
        directToolImportFiles: 0,
      },
      apps: [],
      failures: [],
      warnings: [],
      checks: [],
    },
    productionLinks: {
      ok: true,
      status: "clean",
      score: 100,
      generatedAt,
      totals: {
        pages: 12,
        linksChecked: 192,
        imagesChecked: 36,
        failures: 0,
        warnings: 0,
      },
      pages: [],
      failures: [],
      warnings: [],
      notices: [],
      checks: [],
    },
    releaseDoctorArtifact: {
      ok: false,
      status: "ready-with-warnings",
      score: 96,
      generatedAt,
      summary: {
        counts: {
          pass: 7,
          warn: 1,
          block: 0,
        },
        blockingChecks: [],
        warningChecks: ["Vercel deploy readiness"],
      },
      checks: [],
      qualityChecks: [],
    },
    releaseHistory: {
      generatedAt,
      savedEntryCount: 2,
      score: 96,
      status: "watch",
      metrics: [],
      timeline: [],
      checks: [],
    },
    fixCenter: {
      generatedAt,
      status: "watch",
      score: 93,
      counts: {
        total: 1,
        block: 0,
        warn: 1,
        command: 1,
      },
      items: [
        {
          key: "vercel-deploy-readiness",
          label: "Vercel deploy readiness",
          status: "warn",
          score: 67,
          detail: "Vercel projects are linked locally; secure deploy token is still needed.",
          nextAction: "Set VERCEL_TOKEN or VERCEL_TOKEN_FILE in a secure shell/CI secret.",
          command: vercelCommand,
          targetHref: "#deploy-readiness-panel",
          targetLabel: "Deploy readiness panel",
        },
      ],
      topCommands: [vercelCommand],
      checks: [],
    },
    deploy: {
      ok: false,
      status: "linked-needs-token",
      score: 67,
      linkedProjects: 2,
      missingSecrets: [
        {
          target: "web",
          label: "Vercel token",
          names: ["VERCEL_TOKEN", "VERCEL_TOKEN_FILE"],
          displayName: "VERCEL_TOKEN or VERCEL_TOKEN_FILE",
        },
      ],
      results: [
        {
          name: "web",
          label: "Public web",
          projectRoot: "altftoolweb",
          ok: false,
          present: [],
          missing: [
            {
              label: "Vercel token",
              names: ["VERCEL_TOKEN", "VERCEL_TOKEN_FILE"],
              displayName: "VERCEL_TOKEN or VERCEL_TOKEN_FILE",
            },
          ],
          projectLink: { projectName: "altftool-altftoolweb" },
        },
        {
          name: "admin",
          label: "Admin web",
          projectRoot: "altftoolwebadmin",
          ok: false,
          present: [],
          missing: [
            {
              label: "Vercel token",
              names: ["VERCEL_TOKEN", "VERCEL_TOKEN_FILE"],
              displayName: "VERCEL_TOKEN or VERCEL_TOKEN_FILE",
            },
          ],
          projectLink: { projectName: "altftools-admin" },
        },
      ],
    },
    production: {
      score: 100,
      status: "fresh",
      healthUrl: "https://altftool.com/api/health",
      expectedCommit: "abcdef1234567890",
      productionCommit: "abcdef1234567890",
      publicHealth: {
        status: "healthy",
        label: "Release ready",
      },
      checks: [],
    },
    releaseGates: {
      score: 96,
      ready: true,
      status: "watch",
      passed: 7,
      warning: 1,
      blocked: 0,
      total: 8,
      blockers: [],
      gates: [
        {
          key: "vercel-deploy-readiness",
          label: "Vercel deploy readiness",
          status: "warn",
          score: 67,
          detail: "Vercel projects are linked locally; secure deploy token is still needed.",
          action: "Set VERCEL_TOKEN or VERCEL_TOKEN_FILE in a secure shell/CI secret.",
          source: "deployReadiness",
        },
      ],
    },
    releaseDoctor: {
      status: "ready-with-warnings",
      strictStatus: "blocked",
      ready: false,
      strictReady: false,
      score: 96,
      commands: {
        normal: "npm run release:doctor",
        strict: "npm run release:doctor:strict",
        offline: "npm run release:doctor -- --offline",
      },
      summary: {
        counts: {
          pass: 7,
          warn: 1,
          block: 0,
        },
        blockingChecks: [],
        warningChecks: ["Vercel deploy readiness"],
      },
      sources: {
        routeQaCheckedAt: generatedAt,
        blogContentGeneratedAt: generatedAt,
        productionHealthUrl: "https://altftool.com/api/health",
        productionStatus: "fresh",
        productionScore: 100,
      },
      checks: [
        {
          key: "vercel-deploy-readiness",
          label: "Vercel deploy readiness",
          status: "warn",
          score: 67,
          detail: "Vercel projects are linked locally; secure deploy token is still needed.",
          nextAction: "Set VERCEL_TOKEN or VERCEL_TOKEN_FILE in a secure shell/CI secret.",
          command: vercelCommand,
          source: "deployReadiness",
        },
      ],
    },
    recommendations: [],
  };
}

async function loginAsLocalAdmin(page) {
  await page.goto(`${adminUrl}/login`, { waitUntil: "domcontentloaded" });
  await page.evaluate((key) => localStorage.setItem(key, "active"), localAdminStorageKey);
  await page.goto(`${adminUrl}/admin-management`, { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Admin Management" })).toBeVisible({
    timeout: 30_000,
  });
}

async function expectHealthyAdminRoute(page, route) {
  const response = await page.goto(`${adminUrl}${route.path}`, {
    waitUntil: "domcontentloaded",
  });

  if (response) {
    expect(response.status(), route.path).toBeLessThan(500);
  }

  const body = page.locator("body");

  await expect(body, route.path).toContainText(route.marker, { timeout: 45_000 });
  await expect(body, route.path).not.toContainText("Application error");
  await expect(body, route.path).not.toContainText("This page could not be found");
  await expect(body, route.path).not.toContainText("This admin page is not available");
  await expect(body, route.path).not.toContainText("Module route unavailable");
  await expect(body, route.path).not.toContainText("NEXT_HTTP_ERROR_FALLBACK");
  await expect(page.locator('[data-admin-hydrated="true"]'), route.path).toBeVisible();
}

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
          role: element.getAttribute("role") || "",
          ariaLabel: element.getAttribute("aria-label") || "",
          className: typeof element.className === "string" ? element.className : "",
          text: (element.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
        };
      })
      .filter(({ left, right }) => right > window.innerWidth + 2 || (left < -2 && right > 2))
      .slice(0, 10);

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

test.describe("admin route QA guard", () => {
  test.describe.configure({ timeout: 180_000 });

  test.beforeEach(async ({ page }) => {
    await loginAsLocalAdmin(page);
  });

  test("core analytics and dynamic module routes resolve cleanly", async ({ page }) => {
    const quality = createPageQualityGate(page);

    for (const route of adminRoutes) {
      await expectHealthyAdminRoute(page, route);
      await quality.expectClean(`admin route ${route.path}`);
    }
  });

  test("BuySmart shell fits mobile route layout", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await expectHealthyAdminRoute(page, {
      path: "/altftool/buysmart",
      marker: /BuySmart Control|Loading BuySmart data|Store|Feature Brand/i,
    });
    await expect(page.getByRole("tablist", { name: "BuySmart sections" })).toBeVisible();
    await expectNoHorizontalOverflow(page, "admin BuySmart mobile shell");
    await quality.expectClean("admin BuySmart mobile shell");
  });

  test("Deals shell fits mobile route layout", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await page.setViewportSize({ width: 390, height: 844 });
    await expectHealthyAdminRoute(page, {
      path: "/altftool/deals",
      marker: /Deals Control|Manage Deal Surfaces/i,
    });
    await expect(page.getByRole("tablist", { name: "Deals sections" })).toBeVisible();
    await expectNoHorizontalOverflow(page, "admin Deals mobile shell");
    await quality.expectClean("admin Deals mobile shell");
  });

  test("Deals tabs switch without route errors", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await expectHealthyAdminRoute(page, {
      path: "/altftool/deals",
      marker: /Deals Control|Manage Deal Surfaces/i,
    });

    for (const tabName of dealsTabs) {
      await page.getByRole("tab", { name: new RegExp(tabName, "i") }).click();
      await expect(page.getByRole("tabpanel", { name: tabName })).toBeVisible();
      await expect(page.getByRole("heading", { name: tabName })).toBeVisible();
      await expectNoHorizontalOverflow(page, `admin Deals tab ${tabName}`);
      await quality.expectClean(`admin Deals tab ${tabName}`);
    }
  });

  test("BuySmart tabs switch without route errors", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await expectHealthyAdminRoute(page, {
      path: "/altftool/buysmart",
      marker: /BuySmart Control|Loading BuySmart data|Store|Feature Brand/i,
    });

    for (const tabName of buySmartTabs) {
      await page.getByRole("tab", { name: new RegExp(tabName, "i") }).click();
      await expect(page.getByRole("tabpanel", { name: tabName })).toBeVisible();
      await expect(page.getByRole("heading", { name: tabName })).toBeVisible();
      await expectNoHorizontalOverflow(page, `admin BuySmart tab ${tabName}`);
      await quality.expectClean(`admin BuySmart tab ${tabName}`);
    }
  });

  test("Sale Locator exposes the Firebase-backed editor flow", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await expectHealthyAdminRoute(page, {
      path: "/altftool/sale-locator",
      marker: /Manage all sales|Loading sales from Firebase/i,
    });

    await page.getByRole("button", { name: "Add Sale" }).click();
    await expect(page.getByRole("heading", { name: "New Sale" })).toBeVisible();
    await expect(page.getByText("Configure sale type, content and media.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create Sale" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "New Sale" })).toHaveCount(0);

    await expectNoHorizontalOverflow(page, "admin Sale Locator editor");
    await quality.expectClean("admin Sale Locator editor");
  });

  test("health dashboard exposes portfolio filters and project details", async ({ page }) => {
    const quality = createPageQualityGate(page);

    await expectHealthyAdminRoute(page, {
      path: "/health",
      marker: /Health Overview|All project reports/i,
    });

    await expect(page.getByPlaceholder("Search project, admin, environment...")).toBeVisible();
    await expect(page.getByRole("button", { name: "All Projects", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "CSV", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Excel", exact: true })).toBeVisible();

    const altfRow = page.getByRole("row").filter({ hasText: "AltFTool" }).first();
    await expect(altfRow).toBeVisible();
    await altfRow.getByRole("button", { name: "View details" }).click();
    await expect(page.getByRole("dialog", { name: "AltFTool health details" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Health breakdown" })).toBeVisible();
    await page.getByRole("button", { name: "Close details" }).click();

    await expectNoHorizontalOverflow(page, "admin health portfolio controls");
    await quality.expectClean("admin health portfolio controls");
  });
});
