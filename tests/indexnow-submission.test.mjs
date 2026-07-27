import assert from "node:assert/strict";
import test from "node:test";

const MODULE = "../altftoolweb/src/platform/seo/indexNow.js";

// The module reads process.env at call time, but ES modules are cached — a
// unique query string forces a clean evaluation per case.
async function load() {
  return import(`${MODULE}?t=${Math.random()}`);
}

function stubFetch(impl) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init, body: init?.body ? JSON.parse(init.body) : undefined });
    return impl ? impl() : { ok: true, status: 200 };
  };
  return {
    calls,
    restore() {
      globalThis.fetch = original;
    },
  };
}

async function withKey(key, run) {
  const saved = process.env.ALTFT_INDEXNOW_KEY;
  if (key === undefined) delete process.env.ALTFT_INDEXNOW_KEY;
  else process.env.ALTFT_INDEXNOW_KEY = key;
  try {
    return await run();
  } finally {
    if (saved === undefined) delete process.env.ALTFT_INDEXNOW_KEY;
    else process.env.ALTFT_INDEXNOW_KEY = saved;
  }
}

const VALID_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";

test("stays inert when no key is configured", async () => {
  await withKey(undefined, async () => {
    const { submitToIndexNow, getIndexNowKey } = await load();
    const stub = stubFetch();
    try {
      assert.equal(getIndexNowKey(), null);
      assert.deepEqual(await submitToIndexNow(["/a"]), { skipped: "no-key" });
      assert.equal(stub.calls.length, 0, "must not call the network without a key");
    } finally {
      stub.restore();
    }
  });
});

test("a malformed key is ignored rather than submitted", async () => {
  await withKey("short", async () => {
    const { getIndexNowKey, submitToIndexNow } = await load();
    const stub = stubFetch();
    try {
      assert.equal(getIndexNowKey(), null);
      assert.deepEqual(await submitToIndexNow(["/a"]), { skipped: "no-key" });
      assert.equal(stub.calls.length, 0);
    } finally {
      stub.restore();
    }
  });
});

test("submits absolute URLs with host, key and keyLocation", async () => {
  await withKey(VALID_KEY, async () => {
    const { submitToIndexNow, getIndexNowKeyLocation } = await load();
    const stub = stubFetch();
    try {
      const result = await submitToIndexNow(["/blogs/post", "/tools/all/x"]);
      assert.equal(result.ok, true);
      assert.equal(result.count, 2);

      assert.equal(stub.calls.length, 1);
      const { url, body, init } = stub.calls[0];
      assert.equal(url, "https://api.indexnow.org/indexnow");
      assert.equal(init.method, "POST");
      assert.equal(body.key, VALID_KEY);
      assert.equal(body.keyLocation, getIndexNowKeyLocation());
      assert.ok(body.host && !body.host.includes("/"), "host must be a bare host");
      assert.ok(body.urlList.every((u) => u.startsWith("https://")));
      assert.ok(body.urlList[0].endsWith("/blogs/post"));
    } finally {
      stub.restore();
    }
  });
});

test("drops robots-disallowed and relative paths, and de-duplicates", async () => {
  await withKey(VALID_KEY, async () => {
    const { submitToIndexNow } = await load();
    const stub = stubFetch();
    try {
      const result = await submitToIndexNow([
        "/keep",
        "/keep",
        "/api/revalidate",
        "not-a-path",
        "",
        null,
      ]);
      assert.equal(result.count, 1);
      assert.equal(stub.calls[0].body.urlList.length, 1);
      assert.ok(stub.calls[0].body.urlList[0].endsWith("/keep"));
    } finally {
      stub.restore();
    }
  });
});

test("no usable paths means no request at all", async () => {
  await withKey(VALID_KEY, async () => {
    const { submitToIndexNow } = await load();
    const stub = stubFetch();
    try {
      assert.deepEqual(await submitToIndexNow(["/api/x"]), { skipped: "no-urls" });
      assert.deepEqual(await submitToIndexNow([]), { skipped: "no-urls" });
      assert.equal(stub.calls.length, 0);
    } finally {
      stub.restore();
    }
  });
});

test("a network failure is reported, never thrown — a publish must not fail", async () => {
  await withKey(VALID_KEY, async () => {
    const { submitToIndexNow } = await load();
    const stub = stubFetch(() => {
      throw new Error("ECONNRESET");
    });
    try {
      const result = await submitToIndexNow(["/a"]);
      assert.equal(result.ok, false);
      assert.equal(result.error, "network");
    } finally {
      stub.restore();
    }
  });
});

test("a non-2xx response is surfaced without throwing", async () => {
  await withKey(VALID_KEY, async () => {
    const { submitToIndexNow } = await load();
    const stub = stubFetch(() => ({ ok: false, status: 422 }));
    try {
      const result = await submitToIndexNow(["/a"]);
      assert.equal(result.ok, false);
      assert.equal(result.status, 422);
    } finally {
      stub.restore();
    }
  });
});
