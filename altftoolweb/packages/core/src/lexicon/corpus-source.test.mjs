import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { gzipSync } from "node:zlib";

import {
  assertCorpusAssetPath,
  corpusAssetUrl,
  readCorpusFile,
  resolveCorpusDataOrigin,
} from "./corpus-source.js";

const missingFile = async () => {
  const error = new Error("missing");
  error.code = "ENOENT";
  throw error;
};

test("corpus paths accept generated assets and reject traversal", () => {
  assert.equal(assertCorpusAssetPath("entries/ser.json.gz"), "entries/ser.json.gz");
  assert.throws(() => assertCorpusAssetPath("../secrets.json.gz"), /Invalid AltF Lexicon/);
  assert.throws(() => assertCorpusAssetPath("entries\\ser.json.gz"), /Invalid AltF Lexicon/);
  assert.throws(() => assertCorpusAssetPath("entries//ser.json.gz"), /Invalid AltF Lexicon/);
});

test("production origin is canonical and release-pinned", () => {
  assert.equal(resolveCorpusDataOrigin(), "https://www.altftool.com");
  assert.equal(
    corpusAssetUrl("manifest.json.gz", {
      env: { ALTFT_RELEASE_COMMIT: "abc123" },
      nodeEnv: "production",
    }),
    "https://www.altftool.com/data/lexicon/manifest.json.gz?v=abc123",
  );
});

test("data origin requires HTTPS in production but permits local test servers", () => {
  assert.throws(
    () => resolveCorpusDataOrigin({ value: "http://127.0.0.1:3000", nodeEnv: "production" }),
    /Use HTTPS/,
  );
  assert.equal(
    resolveCorpusDataOrigin({ value: "http://127.0.0.1:3000/", nodeEnv: "test" }),
    "http://127.0.0.1:3000",
  );
});

test("local corpus bytes win without a network request", async () => {
  let fetched = false;
  const expected = Buffer.from("local bytes");
  const actual = await readCorpusFile("manifest.json.gz", {
    dataDirectory: "/corpus",
    readFileImpl: async (file) => {
      assert.equal(file, "/corpus/manifest.json.gz");
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

test("production ENOENT falls back to the public CDN corpus", async () => {
  const actual = await readCorpusFile("entries/ser.json.gz", {
    readFileImpl: missingFile,
    fetchImpl: async (url, options) => {
      assert.equal(
        url,
        "https://www.altftool.com/data/lexicon/entries/ser.json.gz?v=release-7",
      );
      assert.equal(options.cache, "force-cache");
      assert.equal(options.redirect, "error");
      return {
        ok: true,
        status: 200,
        arrayBuffer: async () => Uint8Array.from([0x1f, 0x8b, 0x08]).buffer,
      };
    },
    env: { ALTFT_RELEASE_COMMIT: "release-7" },
    nodeEnv: "production",
  });

  assert.deepEqual(actual, Buffer.from([0x1f, 0x8b, 0x08]));
});

test("development stays offline by default when the corpus is missing", async () => {
  let fetched = false;
  await assert.rejects(
    readCorpusFile("manifest.json.gz", {
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

test("remote 404 keeps optional corpus semantics via ENOENT", async () => {
  await assert.rejects(
    readCorpusFile("collections/not-real.json.gz", {
      readFileImpl: missingFile,
      fetchImpl: async () => ({ ok: false, status: 404 }),
      env: {},
      nodeEnv: "production",
    }),
    { code: "ENOENT" },
  );
});

test("integrated corpus loader parses public CDN gzip bytes", async (context) => {
  const originalCwd = process.cwd();
  const originalNodeEnv = process.env.NODE_ENV;
  const originalOrigin = process.env.ALTFT_LEXICON_DATA_ORIGIN;
  const originalRelease = process.env.ALTFT_RELEASE_COMMIT;
  const emptyRoot = await mkdtemp(path.join(tmpdir(), "altft-lexicon-empty-"));
  const expected = { total: 147_478, source: "remote-test" };
  const payload = gzipSync(JSON.stringify(expected));

  const server = createServer((request, response) => {
    assert.equal(request.url, "/data/lexicon/manifest.json.gz?v=test-release");
    response.writeHead(200, { "Content-Type": "application/gzip" });
    response.end(payload);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();

  context.after(async () => {
    process.chdir(originalCwd);
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalOrigin === undefined) delete process.env.ALTFT_LEXICON_DATA_ORIGIN;
    else process.env.ALTFT_LEXICON_DATA_ORIGIN = originalOrigin;
    if (originalRelease === undefined) delete process.env.ALTFT_RELEASE_COMMIT;
    else process.env.ALTFT_RELEASE_COMMIT = originalRelease;
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
    await rm(emptyRoot, { recursive: true });
  });

  process.chdir(emptyRoot);
  process.env.NODE_ENV = "test";
  process.env.ALTFT_LEXICON_DATA_ORIGIN = `http://127.0.0.1:${address.port}`;
  process.env.ALTFT_RELEASE_COMMIT = "test-release";

  const { getManifest } = await import(`./corpus.js?remote=${Date.now()}`);
  assert.deepEqual(await getManifest(), expected);
});
