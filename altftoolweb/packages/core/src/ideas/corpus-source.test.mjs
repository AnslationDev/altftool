import assert from "node:assert/strict";
import test from "node:test";

import {
  assertIdeasCorpusAssetPath,
  ideasCorpusAssetUrl,
  readIdeasCorpusFile,
  resolveIdeasDataOrigin,
} from "./corpus-source.js";

const missingFile = async () => {
  const error = new Error("missing");
  error.code = "ENOENT";
  throw error;
};

test("Ideas corpus paths accept generated assets and reject traversal", () => {
  assert.equal(
    assertIdeasCorpusAssetPath("shards/shard-000.json"),
    "shards/shard-000.json",
  );
  assert.throws(
    () => assertIdeasCorpusAssetPath("../secrets.json"),
    /Invalid AltF Ideas corpus/u,
  );
  assert.throws(
    () => assertIdeasCorpusAssetPath("shards\\shard-000.json"),
    /Invalid AltF Ideas corpus/u,
  );
  assert.throws(
    () => assertIdeasCorpusAssetPath("shards//shard-000.json"),
    /Invalid AltF Ideas corpus/u,
  );
});

test("Ideas production origin is canonical, HTTPS and release-pinned", () => {
  assert.equal(resolveIdeasDataOrigin(), "https://www.altftool.com");
  assert.equal(
    ideasCorpusAssetUrl("by-vertical/healthcare.json", {
      env: { ALTFT_RELEASE_COMMIT: "abc123" },
      nodeEnv: "production",
    }),
    "https://www.altftool.com/data/ideas/by-vertical/healthcare.json?v=abc123",
  );
});

test("Ideas data origin requires HTTPS but permits local development servers", () => {
  assert.throws(
    () =>
      resolveIdeasDataOrigin({
        value: "http://127.0.0.1:3000",
        nodeEnv: "production",
      }),
    /Use HTTPS/u,
  );
  assert.throws(
    () =>
      resolveIdeasDataOrigin({
        value: "https://user:secret@example.com",
        nodeEnv: "production",
      }),
    /Use HTTPS/u,
  );
  assert.equal(
    resolveIdeasDataOrigin({
      value: "http://127.0.0.1:3000/",
      nodeEnv: "test",
    }),
    "http://127.0.0.1:3000",
  );
});

test("local Ideas corpus bytes win without a network request", async () => {
  let fetched = false;
  const expected = Buffer.from('{"source":"local"}');
  const actual = await readIdeasCorpusFile("manifest.json", {
    dataDirectory: "/corpus",
    readFileImpl: async (file) => {
      assert.equal(file, "/corpus/manifest.json");
      return expected;
    },
    fetchImpl: async () => {
      fetched = true;
      throw new Error("network should not run");
    },
    nodeEnv: "production",
  });

  assert.deepEqual(actual, expected);
  assert.equal(fetched, false);
});

test("production ENOENT falls back to the public Ideas CDN corpus", async () => {
  const actual = await readIdeasCorpusFile("by-vertical/healthcare.json", {
    readFileImpl: missingFile,
    fetchImpl: async (url, options) => {
      assert.equal(
        url,
        "https://www.altftool.com/data/ideas/by-vertical/healthcare.json?v=release-7",
      );
      assert.equal(options.cache, "force-cache");
      assert.equal(options.redirect, "error");
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => Buffer.from("[]"),
      };
    },
    env: { ALTFT_RELEASE_COMMIT: "release-7" },
    nodeEnv: "production",
  });

  assert.deepEqual(actual, Buffer.from("[]"));
});

test("development stays offline when the Ideas corpus is missing", async () => {
  let fetched = false;
  await assert.rejects(
    readIdeasCorpusFile("manifest.json", {
      readFileImpl: missingFile,
      fetchImpl: async () => {
        fetched = true;
      },
      env: {},
      nodeEnv: "development",
    }),
    { code: "ENOENT" },
  );
  assert.equal(fetched, false);
});

test("local I/O failures do not silently switch the Ideas data source", async () => {
  let fetched = false;
  const denied = new Error("denied");
  denied.code = "EACCES";

  await assert.rejects(
    readIdeasCorpusFile("manifest.json", {
      readFileImpl: async () => {
        throw denied;
      },
      fetchImpl: async () => {
        fetched = true;
      },
      nodeEnv: "production",
    }),
    { code: "EACCES" },
  );
  assert.equal(fetched, false);
});

test("remote Ideas failures keep typed, non-content-bearing errors", async () => {
  await assert.rejects(
    readIdeasCorpusFile("manifest.json", {
      readFileImpl: missingFile,
      fetchImpl: async () => ({ ok: false, status: 404 }),
      env: {},
      nodeEnv: "production",
    }),
    { code: "ENOENT" },
  );

  await assert.rejects(
    readIdeasCorpusFile("manifest.json", {
      readFileImpl: missingFile,
      fetchImpl: async () => {
        throw new Error("connection failed");
      },
      env: {},
      nodeEnv: "production",
    }),
    (error) => error.code === "EREMOTEIO" && error.cause?.message === "connection failed",
  );
});
