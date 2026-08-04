import assert from "node:assert/strict";
import test from "node:test";

async function loadDynamicRouteModule(suffix) {
  return import(`../../app/[slug]/data/dynamicRoute.js?test=${suffix}`);
}

test("a missing dynamic route is cached instead of refetched", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return new Response(null, { status: 404 });
  };

  try {
    const { fetchDynamicRouteConfig } = await loadDynamicRouteModule("cached-null");
    assert.equal(await fetchDynamicRouteConfig(), null);
    assert.equal(await fetchDynamicRouteConfig(), null);
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("concurrent dynamic-route reads share one Firestore request", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  let release;
  globalThis.fetch = () => {
    calls += 1;
    return new Promise((resolve) => {
      release = () => resolve(new Response(null, { status: 404 }));
    });
  };

  try {
    const { fetchDynamicRouteConfig } = await loadDynamicRouteModule("coalesced");
    const requests = Array.from({ length: 20 }, () => fetchDynamicRouteConfig());
    assert.equal(calls, 1);
    release();
    assert.deepEqual(await Promise.all(requests), Array(20).fill(null));
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
