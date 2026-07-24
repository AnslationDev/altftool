import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  ResilientFetchError,
  fetchJsonWithRetry,
} from "../altftoolweb/src/lib/server/resilientJsonFetch.js";

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("resilient JSON fetch", () => {
  it("retries transient HTTP responses and returns the successful payload", async () => {
    let calls = 0;
    const delays = [];
    const payload = await fetchJsonWithRetry(
      "https://example.test/data",
      { timeoutMs: 1_000, maxAttempts: 3, baseDelayMs: 10 },
      {
        fetchImpl: async () => {
          calls += 1;
          return calls === 1
            ? jsonResponse({ error: "busy" }, 503)
            : jsonResponse({ ok: true });
        },
        sleepImpl: async (delay) => delays.push(delay),
        random: () => 0.5,
      },
    );

    assert.deepEqual(payload, { ok: true });
    assert.equal(calls, 2);
    assert.deepEqual(delays, [10]);
  });

  it("does not retry permanent client errors", async () => {
    let calls = 0;

    await assert.rejects(
      fetchJsonWithRetry(
        "https://example.test/private",
        { timeoutMs: 1_000, maxAttempts: 3 },
        {
          fetchImpl: async () => {
            calls += 1;
            return jsonResponse({ error: "forbidden" }, 403);
          },
        },
      ),
      (error) =>
        error instanceof ResilientFetchError &&
        error.status === 403 &&
        error.transient === false,
    );
    assert.equal(calls, 1);
  });

  it("enforces one total deadline across all attempts", async () => {
    let calls = 0;

    await assert.rejects(
      fetchJsonWithRetry(
        "https://example.test/slow",
        { timeoutMs: 25, maxAttempts: 3, baseDelayMs: 1 },
        {
          fetchImpl: (_url, { signal }) =>
            new Promise((_resolve, reject) => {
              calls += 1;
              signal.addEventListener(
                "abort",
                () => reject(new DOMException("aborted", "AbortError")),
                { once: true },
              );
            }),
        },
      ),
      (error) =>
        error instanceof ResilientFetchError &&
        error.code === "timeout" &&
        error.transient === true,
    );
    assert.equal(calls, 1);
  });

  it("propagates caller cancellation without retrying", async () => {
    const controller = new AbortController();
    let calls = 0;

    const request = fetchJsonWithRetry(
      "https://example.test/cancelled",
      { timeoutMs: 1_000, maxAttempts: 3, signal: controller.signal },
      {
        fetchImpl: (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            calls += 1;
            signal.addEventListener(
              "abort",
              () => reject(new DOMException("aborted", "AbortError")),
              { once: true },
            );
          }),
      },
    );
    controller.abort(new Error("cancelled by test"));

    await assert.rejects(
      request,
      (error) =>
        error instanceof ResilientFetchError &&
        error.code === "aborted" &&
        error.transient === false,
    );
    assert.equal(calls, 1);
  });
});
