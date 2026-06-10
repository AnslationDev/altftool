import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createSharedSubscriptionRegistry, createTtlCache } from "@altftool/core/cache";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe("core ttl cache", () => {
  it("returns stale last-good data when a refresh fails inside the stale window", async () => {
    const cache = createTtlCache({ ttlMs: 5, maxEntries: 4 });

    const first = await cache.getOrSet(
      "firebase:resource",
      async () => ["fresh"],
      5,
      { returnStaleOnError: true, staleTtlMs: 1000 },
    );
    assert.deepEqual(first, ["fresh"]);

    await wait(12);

    const fallback = await cache.getOrSet(
      "firebase:resource",
      async () => {
        throw new Error("Firestore unavailable");
      },
      5,
      { returnStaleOnError: true, staleTtlMs: 1000 },
    );

    assert.deepEqual(fallback, ["fresh"]);

    const secondFallback = await cache.getOrSet(
      "firebase:resource",
      async () => {
        throw new Error("Firestore still unavailable");
      },
      5,
      { returnStaleOnError: true, staleTtlMs: 1000 },
    );

    assert.deepEqual(secondFallback, ["fresh"]);
  });

  it("still throws refresh errors when stale fallback is disabled", async () => {
    const cache = createTtlCache({ ttlMs: 5, maxEntries: 4 });

    await cache.getOrSet("resource", async () => "ok", 5, { staleTtlMs: 1000 });
    await wait(12);

    await assert.rejects(
      cache.getOrSet(
        "resource",
        async () => {
          throw new Error("network down");
        },
        5,
      ),
      /network down/,
    );
  });

  it("evicts least-recently-used reads and exposes compact stats", () => {
    const cache = createTtlCache({ ttlMs: 1000, maxEntries: 2 });

    cache.set("first", 1);
    cache.set("second", 2);
    assert.equal(cache.get("first"), 1);
    cache.set("third", 3);

    assert.equal(cache.get("second"), undefined);
    assert.equal(cache.get("first"), 1);
    assert.equal(cache.get("third"), 3);
    assert.deepEqual(cache.stats({ includeKeys: true }).keys, ["first", "third"]);
  });
});

describe("shared subscription registry", () => {
  it("shares one upstream listener across subscribers and cleans up after keep-alive", async () => {
    const registry = createSharedSubscriptionRegistry({ keepAliveMs: 5 });
    let starts = 0;
    let cleanups = 0;
    const seen = [];
    const unsubscribeA = registry.subscribe(
      "blogs",
      (emit) => {
        starts += 1;
        emit(["first"]);
        return () => {
          cleanups += 1;
        };
      },
      (value) => seen.push(["a", value]),
    );
    const unsubscribeB = registry.subscribe(
      "blogs",
      () => {
        throw new Error("should reuse existing listener");
      },
      (value) => seen.push(["b", value]),
    );

    await wait(0);
    assert.equal(starts, 1);
    assert.equal(registry.stats().activeListeners, 2);
    assert.deepEqual(seen, [
      ["a", ["first"]],
      ["b", ["first"]],
    ]);

    unsubscribeA();
    unsubscribeB();
    assert.equal(registry.stats().pendingCleanup, 1);

    await wait(12);
    assert.equal(cleanups, 1);
    assert.equal(registry.size(), 0);
  });

  it("prunes idle entries when the subscription registry reaches its memory budget", async () => {
    const registry = createSharedSubscriptionRegistry({ keepAliveMs: 1000, maxEntries: 1 });
    let cleanups = 0;
    const start = () => () => {
      cleanups += 1;
    };

    const unsubscribeA = registry.subscribe("a", start, () => {});
    unsubscribeA();
    assert.equal(registry.size(), 1);

    const unsubscribeB = registry.subscribe("b", start, () => {});

    assert.equal(registry.size(), 1);
    assert.equal(cleanups, 1);
    assert.equal(registry.stats({ includeKeys: true }).entries[0].key, "b");

    unsubscribeB();
    registry.clear();
  });
});
