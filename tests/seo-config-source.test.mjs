import assert from "node:assert/strict";
import test from "node:test";

const sourceUrl = new URL(
  "../altftoolweb/src/platform/seo/seoConfigSource.js",
  import.meta.url,
);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

test("SEO config priming bounds a cold runtime read and publishes the eventual snapshot", async () => {
  const originalFetch = globalThis.fetch;
  const previous = {
    ALTFT_SEO_ENGINE_ENABLED: process.env.ALTFT_SEO_ENGINE_ENABLED,
    ALTFT_SEO_PRIME_BUDGET_MS: process.env.ALTFT_SEO_PRIME_BUDGET_MS,
    ALTFT_FIRESTORE_REST_TIMEOUT_MS:
      process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS,
  };

  process.env.ALTFT_SEO_ENGINE_ENABLED = "true";
  process.env.ALTFT_SEO_PRIME_BUDGET_MS = "20";
  process.env.ALTFT_FIRESTORE_REST_TIMEOUT_MS = "500";
  globalThis.fetch = async () => {
    await delay(120);
    return new Response(
      JSON.stringify({
        fields: {
          enabled: { booleanValue: true },
          version: { integerValue: "7" },
        },
      }),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  };

  try {
    const source = await import(`${sourceUrl.href}?bounded=${Date.now()}`);
    const startedAt = performance.now();
    await source.primeSeoConfig();
    const elapsedMs = performance.now() - startedAt;

    assert.ok(
      elapsedMs < 100,
      `cold prime should respect its 20ms budget, received ${elapsedMs.toFixed(1)}ms`,
    );
    assert.equal(source.getSeoConfigSnapshot(), null);

    await delay(140);
    assert.equal(source.getSeoConfigSnapshot()?.enabled, true);
    assert.equal(source.getSeoConfigSnapshot()?.version, 7);

    source.__expireSeoConfigCache();
    assert.equal(
      source.getSeoConfigSnapshot()?.version,
      7,
      "expired snapshots remain available while refresh is pending",
    );
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
