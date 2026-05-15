import { expect, test } from "@playwright/test";

const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";
const localAdminHeaders = {
  authorization: "Bearer local-dev-admin-token",
};

test.describe("admin API safety", () => {
  test("local super admin can read the admin list without Firebase Admin secrets", async ({ request }) => {
    const response = await request.get(`${adminUrl}/api/admin/list`, {
      headers: localAdminHeaders,
    });

    expect(response.ok()).toBeTruthy();

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

    const payload = await response.json();
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
    expect(payload.qa).toEqual(
      expect.objectContaining({
        total: 40,
        routeCovered: 40,
        functionalCovered: expect.any(Number),
        tools: expect.any(Array),
      }),
    );
    expect(payload.qa.tools).toHaveLength(40);
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
    expect(JSON.stringify(payload.firebaseAdmin)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.firebaseLiveData)).not.toContain("PRIVATE KEY-----");
    expect(JSON.stringify(payload.deploy)).not.toContain("dummy");
  });
});
