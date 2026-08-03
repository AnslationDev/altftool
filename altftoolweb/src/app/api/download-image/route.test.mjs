import assert from "node:assert/strict";
import test from "node:test";

import { GET } from "./route.js";

function requestFor(url, filename = "pin.jpg") {
  const requestUrl = new URL("https://www.altftool.com/api/download-image");
  requestUrl.searchParams.set("url", url);
  requestUrl.searchParams.set("filename", filename);
  return new Request(requestUrl);
}

test("download proxy rejects private, non-HTTPS and unapproved targets before fetching", async () => {
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    throw new Error("blocked requests must never reach fetch");
  };

  try {
    for (const target of [
      "http://images.unsplash.com/photo.jpg",
      "https://127.0.0.1/private",
      "https://169.254.169.254/latest/meta-data",
      "https://example.com/image.jpg",
    ]) {
      const response = await GET(requestFor(target));
      assert.equal(response.status, 400);
    }
    assert.equal(calls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("download proxy returns only bounded images from the approved host", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).hostname, "images.unsplash.com");
    assert.equal(options.redirect, "error");
    return new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "content-type": "image/jpeg" },
    });
  };

  try {
    const response = await GET(
      requestFor("https://images.unsplash.com/photo-123?w=800", "../../unsafe name.jpg"),
    );
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "image/jpeg");
    assert.equal(response.headers.get("content-length"), "3");
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.equal(
      response.headers.get("content-disposition"),
      'attachment; filename="unsafe-name.jpg"',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("download proxy rejects oversized and non-image responses", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response("not an image", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    assert.equal(
      (await GET(requestFor("https://images.unsplash.com/not-an-image"))).status,
      415,
    );

    globalThis.fetch = async () =>
      new Response(new Uint8Array([1]), {
        status: 200,
        headers: {
          "content-length": String(12 * 1024 * 1024 + 1),
          "content-type": "image/jpeg",
        },
      });
    assert.equal(
      (await GET(requestFor("https://images.unsplash.com/too-large"))).status,
      413,
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
