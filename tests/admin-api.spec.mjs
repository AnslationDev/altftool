import { expect, test } from "@playwright/test";

const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const localAdminHeaders = {
  authorization: "Bearer local-dev-admin-token",
};

test.describe("admin API safety", () => {
  test("tool slug catalog requires an active admin session", async ({ request }) => {
    const unauthorized = await request.get(`${adminUrl}/api/tools/slugs`);

    expect(unauthorized.status()).toBe(401);
    await expect(unauthorized.json()).resolves.toEqual({ error: "Unauthorized" });

    const authorized = await request.get(`${adminUrl}/api/tools/slugs`, {
      headers: localAdminHeaders,
    });

    expect(authorized.ok()).toBeTruthy();
    expect(authorized.headers()["cache-control"]).toContain("no-store");

    const payload = await authorized.json();
    expect(payload.count).toBeGreaterThan(0);
    expect(payload.items).toHaveLength(payload.count);
  });

  test("local super admin can read the admin list without Firebase Admin secrets", async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/admin/list`, {
      headers: localAdminHeaders,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers().vary).toContain("Authorization");

    const payload = await response.json();
    expect(payload.admins).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          uid: "local-dev-admin",
          email: "admin@altftool.local",
          roleType: "superadmin",
          isActive: true,
        }),
      ]),
    );
  });

  test("admin create rejects invalid payloads before touching Firebase", async ({ request }) => {
    const response = await request.post(`${adminUrl}/api/admin/create`, {
      headers: {
        ...localAdminHeaders,
        "content-type": "application/json",
      },
      data: {},
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: "Email is required" }),
    );
  });

  test("admin update rejects empty updates before touching Firebase", async ({ request }) => {
    const response = await request.post(`${adminUrl}/api/admin/update`, {
      headers: {
        ...localAdminHeaders,
        "content-type": "application/json",
      },
      data: {
        uid: "target-admin",
        updates: {
          createdAt: "should-not-be-updatable",
        },
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: "No valid admin updates supplied" }),
    );
  });

  test("admin status route protects the current local super admin", async ({ request }) => {
    const response = await request.post(`${adminUrl}/api/admin/toggle-status`, {
      headers: {
        ...localAdminHeaders,
        "content-type": "application/json",
      },
      data: {
        adminId: "local-dev-admin",
        isActive: false,
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: "You cannot change your own active status" }),
    );
  });

  test("health endpoint reports Firebase Admin readiness without exposing secrets", async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/health`, {
      headers: localAdminHeaders,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers().vary).toContain("Authorization");

    const payload = await response.json();
    expect(payload.mode).toBe("live");
    expect(payload.liveProbeSkipped).toBe(false);
    expect(payload.firebaseAdmin).toEqual(
      expect.objectContaining({
        checks: expect.any(Array),
        missing: expect.any(Array),
        invalid: expect.any(Array),
        firestoreReadable: expect.any(Boolean),
      }),
    );
    expect(payload.firebaseLiveData).toEqual(
      expect.objectContaining({
        checks: expect.any(Array),
        failures: expect.any(Array),
        sections: expect.any(Object),
        status: expect.any(String),
        totalChecks: expect.any(Number),
      }),
    );
    expect(payload.firebaseDataIntegrity).toEqual(
      expect.objectContaining({
        checks: expect.any(Array),
        failures: expect.any(Array),
        warnings: expect.any(Array),
        sections: expect.any(Object),
        status: expect.any(String),
        totalChecks: expect.any(Number),
      }),
    );
    expect(payload.performanceBudget).toEqual(
      expect.objectContaining({
        checks: expect.any(Array),
        score: expect.any(Number),
        status: expect.any(String),
        totals: expect.objectContaining({
          publicImages: expect.any(Number),
          dynamicToolImports: expect.any(Number),
        }),
      }),
    );
    expect(payload.routeQuality).toEqual(
      expect.objectContaining({
        checks: expect.any(Array),
        groups: expect.any(Array),
        watchlist: expect.any(Array),
        score: expect.any(Number),
        status: expect.any(String),
        totals: expect.objectContaining({
          routes: expect.any(Number),
          indexable: expect.any(Number),
          noindex: expect.any(Number),
          sitemapCoverage: expect.any(Number),
          indexConflicts: expect.any(Number),
          missingCanonicalTargets: expect.any(Number),
        }),
        command: "npm run seo:route-quality:report",
        strictCommand: "npm run seo:route-quality:strict",
        indexControlCommand: "npm run seo:index-control",
      }),
    );
    expect(payload.productionMonitoring).toEqual(
      expect.objectContaining({
        probes: expect.any(Array),
        score: expect.any(Number),
        status: expect.any(String),
        totals: expect.objectContaining({
          probes: expect.any(Number),
          passing: expect.any(Number),
          slow: expect.any(Number),
          failing: expect.any(Number),
        }),
      }),
    );
    expect(payload.productionLinks).toEqual(
      expect.objectContaining({
        checks: expect.any(Array),
        score: expect.any(Number),
        status: expect.any(String),
        totals: expect.objectContaining({
          pages: expect.any(Number),
          linksChecked: expect.any(Number),
          imagesChecked: expect.any(Number),
        }),
        pages: expect.any(Array),
        failures: expect.any(Array),
        warnings: expect.any(Array),
      }),
    );
    expect(payload.releaseDoctorArtifact).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        score: expect.any(Number),
        summary: expect.objectContaining({
          counts: expect.objectContaining({
            pass: expect.any(Number),
            warn: expect.any(Number),
            block: expect.any(Number),
          }),
        }),
        checks: expect.any(Array),
        qualityChecks: expect.any(Array),
        artifactCommand: "npm run release:doctor:report",
      }),
    );
    expect(payload.releaseHistory).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        score: expect.any(Number),
        savedEntryCount: expect.any(Number),
        timeline: expect.any(Array),
        metrics: expect.arrayContaining([
          expect.objectContaining({
            key: "release-doctor",
            current: expect.objectContaining({
              score: expect.any(Number),
            }),
            points: expect.any(Array),
          }),
          expect.objectContaining({
            key: "production-links",
            current: expect.objectContaining({
              score: expect.any(Number),
            }),
          }),
        ]),
        checks: expect.any(Array),
        command: "npm run release:history:report",
      }),
    );
    expect(payload.fixCenter).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        score: expect.any(Number),
        counts: expect.objectContaining({
          total: expect.any(Number),
          block: expect.any(Number),
          warn: expect.any(Number),
          command: expect.any(Number),
        }),
        items: expect.any(Array),
        topCommands: expect.any(Array),
        checks: expect.any(Array),
      }),
    );
    if (payload.fixCenter.items.length) {
      expect(payload.fixCenter.items[0]).toEqual(
        expect.objectContaining({
          targetHref: expect.stringMatching(/^#/),
          targetLabel: expect.any(String),
        }),
      );
    }
    expect(payload.qa).toEqual(
      expect.objectContaining({
        total: 51,
        routeCovered: 51,
        functionalCovered: expect.any(Number),
        tools: expect.any(Array),
      }),
    );
    expect(payload.qa.tools).toHaveLength(51);
    expect(payload.deploy).toEqual(
      expect.objectContaining({
        score: expect.any(Number),
        missingSecrets: expect.any(Array),
        results: expect.any(Array),
      }),
    );
    expect(payload.production).toEqual(
      expect.objectContaining({
        score: expect.any(Number),
        status: expect.any(String),
        checks: expect.any(Array),
      }),
    );
    expect(payload.releaseDoctor).toEqual(
      expect.objectContaining({
        status: expect.any(String),
        strictStatus: expect.any(String),
        commands: expect.objectContaining({
          normal: "npm run release:doctor",
          strict: "npm run release:doctor:strict",
        }),
        summary: expect.objectContaining({
          counts: expect.objectContaining({
            pass: expect.any(Number),
            warn: expect.any(Number),
            block: expect.any(Number),
          }),
          blockingChecks: expect.any(Array),
          warningChecks: expect.any(Array),
        }),
        checks: expect.any(Array),
      }),
    );
    expect(payload.runtimeQuality).toEqual(
      expect.objectContaining({
        ok: expect.any(Boolean),
        status: expect.any(String),
        score: expect.any(Number),
        commands: expect.objectContaining({
          combined: "npm run validate:runtime-quality",
          route: "npm run qa:routes:strict",
          firebase: "npm run firebase:live-check:strict",
          firebaseIntegrity: "npm run firebase:integrity:strict",
          performance: "npm run performance:budget:strict",
        }),
        gates: expect.arrayContaining([
          expect.objectContaining({
            key: "route-qa-strict",
            command: "npm run qa:routes:strict",
          }),
          expect.objectContaining({
            key: "firebase-live-strict",
            command: "npm run firebase:live-check:strict",
          }),
          expect.objectContaining({
            key: "firebase-integrity-strict",
            command: "npm run firebase:integrity:strict",
          }),
          expect.objectContaining({
            key: "performance-budget-strict",
            command: "npm run performance:budget:strict",
          }),
        ]),
      }),
    );
    expect(payload.releaseDoctor.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: "vercel-deploy-readiness",
          command: "npm run deploy:readiness -- --target=all",
        }),
      ]),
    );
    expect(JSON.stringify(payload.firebaseAdmin)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.firebaseLiveData)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.firebaseDataIntegrity)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.runtimeQuality)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.performanceBudget)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.routeQuality)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.productionLinks)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.productionMonitoring)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.releaseDoctorArtifact)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.releaseHistory)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.fixCenter)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.deploy)).not.toContain("dummy");
    expect(JSON.stringify(payload.releaseDoctor)).not.toContain("PRIVATE KEY-----");
  });

  test("health endpoint supports a fast lite mode with saved probes and fix links", async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/health?lite=1`, {
      headers: localAdminHeaders,
    });

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers().vary).toContain("Authorization");

    const payload = await response.json();
    expect(payload.mode).toBe("lite");
    expect(payload.liveProbeSkipped).toBe(true);
    expect(payload.firebaseLiveData).toEqual(
      expect.objectContaining({
        lite: true,
        skipped: true,
        checks: expect.any(Array),
        status: expect.any(String),
      }),
    );
    expect(payload.firebaseDataIntegrity).toEqual(
      expect.objectContaining({
        lite: true,
        skipped: true,
        checks: expect.any(Array),
        status: expect.any(String),
      }),
    );
    expect(payload.production).toEqual(
      expect.objectContaining({
        lite: true,
        skipped: true,
        checks: expect.any(Array),
        status: expect.any(String),
      }),
    );
    expect(payload.productionMonitoring).toEqual(
      expect.objectContaining({
        lite: true,
        skipped: true,
        probes: [],
        totals: expect.objectContaining({
          probes: expect.any(Number),
          passing: expect.any(Number),
          slow: 0,
          failing: expect.any(Number),
        }),
      }),
    );
    expect(payload.routeQuality).toEqual(
      expect.objectContaining({
        checks: expect.any(Array),
        groups: expect.any(Array),
        watchlist: expect.any(Array),
      }),
    );
    expect(payload.fixCenter).toEqual(
      expect.objectContaining({
        items: expect.any(Array),
        topCommands: expect.any(Array),
      }),
    );
    if (payload.fixCenter.items.length) {
      expect(payload.fixCenter.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            targetHref: expect.stringMatching(/^#/),
            targetLabel: expect.any(String),
          }),
        ]),
      );
    }
    expect(JSON.stringify(payload)).not.toContain("PRIVATE KEY-----");
  });

  test("tool readiness endpoint is authenticated, private, filtered, and paginated", async ({ request }) => {
    const response = await request.get(
      `${adminUrl}/api/health/tools?status=working&page=1&pageSize=10&q=json`,
      { headers: localAdminHeaders },
    );

    expect(response.ok()).toBeTruthy();
    expect(response.headers()["cache-control"]).toContain("private");
    expect(response.headers()["cache-control"]).toContain("no-store");
    expect(response.headers().vary).toContain("Authorization");

    const payload = await response.json();
    expect(payload.summary).toEqual(
      expect.objectContaining({
        methodology: "static-readiness-v2",
        total: expect.any(Number),
        counts: expect.objectContaining({
          working: expect.any(Number),
          "api-required": expect.any(Number),
          partial: expect.any(Number),
          broken: expect.any(Number),
        }),
        api: expect.objectContaining({
          tools: expect.any(Number),
          counts: expect.objectContaining({
            configured: expect.any(Number),
            "missing-config": expect.any(Number),
            "runtime-check": expect.any(Number),
          }),
        }),
      }),
    );
    expect(payload.filters).toEqual({
      query: "json",
      status: "working",
      apiStatus: "all",
    });
    expect(payload.pagination).toEqual(
      expect.objectContaining({
        page: 1,
        pageSize: 10,
        pages: expect.any(Number),
        total: expect.any(Number),
      }),
    );
    expect(payload.items.length).toBeLessThanOrEqual(10);
    for (const item of payload.items) {
      expect(item.status).toBe("working");
      expect(item.apiReadiness).toEqual(
        expect.objectContaining({
          status: expect.any(String),
          providers: expect.any(Array),
          environment: expect.any(Array),
        }),
      );
      expect(
        `${item.slug} ${item.name} ${item.category}`.toLowerCase(),
      ).toContain("json");
    }
    expect(JSON.stringify(payload)).not.toContain("PRIVATE KEY-----");
  });
});
