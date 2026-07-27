import assert from "node:assert/strict";
import test from "node:test";

const MODULE = "../altftoolweb/src/platform/seo/generateMetadata.js";

// generateMetadata reads process.env at call time, but the module is cached
// across imports — a fresh query string forces a clean evaluation per case.
async function withEnv(vars, run) {
  const saved = {};
  for (const [key, value] of Object.entries(vars)) {
    saved[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    const mod = await import(`${MODULE}?verify=${Math.random()}`);
    return await run(mod);
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

const CLEARED = {
  ALTFT_VERIFY_GOOGLE: undefined,
  ALTFT_VERIFY_BING: undefined,
  ALTFT_VERIFY_YANDEX: undefined,
  ALTFT_VERIFY_PINTEREST: undefined,
  ALTFT_VERIFY_FACEBOOK: undefined,
};

test("no verification env vars leaves metadata.verification absent", async () => {
  await withEnv(CLEARED, async ({ createPageMetadata }) => {
    const meta = await createPageMetadata({ title: "T", description: "D", path: "/" });
    assert.equal(meta.verification, undefined);
  });
});

test("Bing token reaches Next as the msvalidate.01 meta tag", async () => {
  await withEnv({ ...CLEARED, ALTFT_VERIFY_BING: "ABC123" }, async ({ createPageMetadata }) => {
    const meta = await createPageMetadata({ title: "T", description: "D", path: "/" });
    assert.deepEqual(meta.verification, { other: { "msvalidate.01": "ABC123" } });
  });
});

test("Google and Yandex tokens map to their dedicated Next fields", async () => {
  await withEnv(
    { ...CLEARED, ALTFT_VERIFY_GOOGLE: "g-tok", ALTFT_VERIFY_YANDEX: "y-tok" },
    async ({ createPageMetadata }) => {
      const meta = await createPageMetadata({ title: "T", description: "D", path: "/" });
      assert.equal(meta.verification.google, "g-tok");
      assert.equal(meta.verification.yandex, "y-tok");
    },
  );
});

test("blank and whitespace-only tokens are ignored, not emitted empty", async () => {
  await withEnv(
    { ...CLEARED, ALTFT_VERIFY_BING: "   ", ALTFT_VERIFY_GOOGLE: "" },
    async ({ createPageMetadata }) => {
      const meta = await createPageMetadata({ title: "T", description: "D", path: "/" });
      assert.equal(meta.verification, undefined);
    },
  );
});

test("tokens are trimmed, so a copy-pasted trailing newline still verifies", async () => {
  await withEnv({ ...CLEARED, ALTFT_VERIFY_BING: " ABC123\n" }, async ({ createPageMetadata }) => {
    const meta = await createPageMetadata({ title: "T", description: "D", path: "/" });
    assert.equal(meta.verification.other["msvalidate.01"], "ABC123");
  });
});
