import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const serviceUrl = new URL(
  "../src/projects/altftool/modules/salelocator/services/sales.service.js",
  import.meta.url,
);
const modalUrl = new URL(
  "../src/projects/altftool/modules/salelocator/components/SalesModal.jsx",
  import.meta.url,
);

test("Sale Locator creates a generated Firestore document from one payload", async () => {
  const [serviceSource, modalSource] = await Promise.all([
    readFile(serviceUrl, "utf8"),
    readFile(modalUrl, "utf8"),
  ]);

  assert.match(
    modalSource,
    /await createSale\(\{\s*\.\.\.payload,[\s\S]*?\}\);/,
    "the create caller should pass one sale payload",
  );

  const createSale = serviceSource.match(
    /export async function createSale\(data\) \{([\s\S]*?)\n\}/,
  );
  assert.ok(createSale, "createSale should accept the payload as its only argument");
  assert.match(createSale[1], /const ref = doc\(salesRef\);/);
  assert.match(createSale[1], /normalizeSale\(data\)/);
  assert.match(createSale[1], /id: ref\.id/);
  assert.match(createSale[1], /return ref\.id/);
});
