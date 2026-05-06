import { expect, test } from "@playwright/test";

const webUrl = process.env.ALTFT_WEB_URL || "http://localhost:3002";
const adminUrl = process.env.ALTFT_ADMIN_URL || "http://localhost:3001";

const BASE_HEADERS = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "x-permitted-cross-domain-policies": "none",
  "x-download-options": "noopen",
  "origin-agent-cluster": "?1",
  "cross-origin-opener-policy": "same-origin-allow-popups",
  "referrer-policy": "strict-origin-when-cross-origin",
};

function expectBaseSecurityHeaders(headers) {
  for (const [name, value] of Object.entries(BASE_HEADERS)) {
    expect(headers[name], name).toBe(value);
  }

  expect(headers["strict-transport-security"]).toContain("includeSubDomains");
  expect(headers["content-security-policy-report-only"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy-report-only"]).toContain("object-src 'none'");
  expect(headers["permissions-policy"]).toContain("payment=()");
}

test("public web security headers are applied", async ({ request }) => {
  const response = await request.get(`${webUrl}/tools`);

  expect(response.ok()).toBeTruthy();
  const headers = response.headers();
  expectBaseSecurityHeaders(headers);
  expect(headers["permissions-policy"]).toContain("camera=(self)");
  expect(headers["permissions-policy"]).toContain("microphone=(self)");
});

test("admin security headers are applied with tighter device permissions", async ({ request }) => {
  const response = await request.get(`${adminUrl}/login`);

  expect(response.ok()).toBeTruthy();
  const headers = response.headers();
  expectBaseSecurityHeaders(headers);
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["permissions-policy"]).toContain("microphone=()");
});
