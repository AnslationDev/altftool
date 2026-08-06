import assert from "node:assert/strict";
import test from "node:test";

import { createIdeasJsonLoader } from "./corpus.js";

test("Ideas JSON loader caches success and evicts a failed read", async () => {
  let calls = 0;
  const loadJson = createIdeasJsonLoader({
    readCorpusFileImpl: async () => {
      calls += 1;
      if (calls === 1) {
        const error = new Error("not copied into compute");
        error.code = "ENOENT";
        throw error;
      }
      return Buffer.from('{"source":"retry"}');
    },
  });

  await assert.rejects(loadJson("manifest.json"), (error) => {
    assert.equal(error.code, "ENOENT");
    assert.equal(error.cause?.message, "not copied into compute");
    return true;
  });

  const recovered = await loadJson("manifest.json");
  assert.deepEqual(recovered, { source: "retry" });
  assert.strictEqual(await loadJson("manifest.json"), recovered);
  assert.equal(calls, 2);
});
