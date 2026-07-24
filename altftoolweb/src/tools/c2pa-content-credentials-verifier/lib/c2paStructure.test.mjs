import assert from "node:assert/strict";
import test from "node:test";

import {
  C2PA_STRUCTURE_LIMITS,
  buildC2paStructureReport,
  inspectC2paStructureBytes,
  validateC2paStructureFile,
} from "./c2paStructure.mjs";

const encoder = new TextEncoder();
const UUIDS = {
  store: "6332706100110010800000aa00389b71",
  standardManifest: "63326d6100110010800000aa00389b71",
  assertionStore: "6332617300110010800000aa00389b71",
  claim: "6332636c00110010800000aa00389b71",
  signature: "6332637300110010800000aa00389b71",
};
const BMFF_C2PA_UUID = "d8fec3d61b0e483c92975828877ec481";

function bytesFromHex(value) {
  return Uint8Array.from(
    value.match(/.{2}/gu).map((pair) => Number.parseInt(pair, 16)),
  );
}

function u32(value) {
  return Uint8Array.from([
    Math.floor(value / 0x1000000) & 0xff,
    Math.floor(value / 0x10000) & 0xff,
    Math.floor(value / 0x100) & 0xff,
    value & 0xff,
  ]);
}

function concat(...parts) {
  const length = parts.reduce((total, part) => total + part.byteLength, 0);
  const output = new Uint8Array(length);
  let cursor = 0;
  for (const part of parts) {
    output.set(part, cursor);
    cursor += part.byteLength;
  }
  return output;
}

function box(type, ...content) {
  const body = concat(...content);
  return concat(u32(body.byteLength + 8), encoder.encode(type), body);
}

function jumd(uuid, label, terminated = true, toggles = 0x03) {
  return box(
    "jumd",
    bytesFromHex(uuid),
    Uint8Array.of(toggles),
    encoder.encode(label),
    terminated ? Uint8Array.of(0) : new Uint8Array(),
  );
}

function superbox(uuid, label, ...children) {
  return box("jumb", jumd(uuid, label), ...children);
}

function sampleStore() {
  const assertions = superbox(
    UUIDS.assertionStore,
    "c2pa.assertions",
    superbox(
      "11111111111111111111111111111111",
      "example.assertion",
      box("cbor", Uint8Array.of(0xa0)),
    ),
  );
  const claim = superbox(
    UUIDS.claim,
    "c2pa.claim.v2",
    box("cbor", Uint8Array.of(0xa0)),
  );
  const signature = superbox(
    UUIDS.signature,
    "c2pa.signature",
    box("cbor", Uint8Array.of(0x84)),
  );
  const manifest = superbox(
    UUIDS.standardManifest,
    "contentauth:urn:uuid:test",
    assertions,
    claim,
    signature,
  );
  return superbox(UUIDS.store, "c2pa", manifest);
}

function jpegWithJumbf(store, splitAt = 0) {
  const header = store.subarray(0, 8);
  const body = store.subarray(8);
  const split =
    splitAt > 0 && splitAt < body.byteLength ? splitAt : body.byteLength;
  const fragments = [body.subarray(0, split)];
  if (split < body.byteLength) fragments.push(body.subarray(split));
  const segments = fragments.map((fragment, index) => {
    const payload = concat(
      Uint8Array.of(0x4a, 0x50, 0x02, 0x11),
      u32(index + 1),
      header,
      fragment,
    );
    const length = payload.byteLength + 2;
    return concat(
      Uint8Array.of(0xff, 0xeb, (length >> 8) & 0xff, length & 0xff),
      payload,
    );
  });
  return concat(
    Uint8Array.of(0xff, 0xd8),
    ...segments,
    Uint8Array.of(0xff, 0xda, 0x00, 0x02),
  );
}

function pngChunk(type, data = new Uint8Array()) {
  return concat(u32(data.byteLength), encoder.encode(type), data, u32(0));
}

function pngWithStore(store) {
  return concat(
    Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
    pngChunk("IHDR", new Uint8Array(13)),
    pngChunk("caBX", store),
    pngChunk("IEND"),
  );
}

function bmffWithStore(store, purpose = "manifest") {
  const ftyp = box("ftyp", encoder.encode("isom"), u32(0));
  const uuid = box(
    "uuid",
    bytesFromHex(BMFF_C2PA_UUID),
    new Uint8Array(4),
    encoder.encode(purpose),
    Uint8Array.of(0),
    new Uint8Array(8),
    store,
  );
  return concat(ftyp, uuid, box("mdat"));
}

test("validates bounded supported extensions and MIME pairs", () => {
  assert.equal(
    validateC2paStructureFile({
      name: "asset.JPG",
      size: 120,
      type: "image/jpeg",
    }).ok,
    true,
  );
  assert.equal(
    validateC2paStructureFile({
      name: "asset.mp4",
      size: 120,
      type: "image/jpeg",
    }).ok,
    false,
  );
  assert.equal(
    validateC2paStructureFile({ name: "asset.exe", size: 120 }).ok,
    false,
  );
  assert.equal(
    validateC2paStructureFile({ name: "asset.png", size: 0 }).ok,
    false,
  );
  assert.equal(
    validateC2paStructureFile({
      name: "asset.png",
      size: C2PA_STRUCTURE_LIMITS.fileBytes + 1,
    }).ok,
    false,
  );
});

test("inspects one- and multi-segment JPEG APP11 JUMBF stores", () => {
  const store = sampleStore();
  for (const jpeg of [jpegWithJumbf(store), jpegWithJumbf(store, 40)]) {
    const result = inspectC2paStructureBytes(jpeg, {
      fileSize: jpeg.byteLength,
      expectedGroup: "jpeg",
    });
    assert.equal(result.ok, true);
    assert.equal(result.format, "JPEG");
    assert.equal(result.summary.manifestStoreCandidates, 1);
    assert.equal(result.summary.manifestBoxes, 1);
    assert.equal(result.summary.assertionStores, 1);
    assert.equal(result.summary.claimBoxes, 1);
    assert.equal(result.summary.signatureBoxes, 1);
    assert.equal(result.verification.cryptographicSignatureVerified, false);
  }
});

test("rejects out-of-order and oversized JPEG fragment declarations safely", () => {
  const store = sampleStore();
  const outOfOrder = jpegWithJumbf(store, 40);
  const sequenceOffset = 2 + 4 + 4;
  outOfOrder.set(u32(3), sequenceOffset);
  const result = inspectC2paStructureBytes(outOfOrder, {
    expectedGroup: "jpeg",
  });
  assert.equal(result.ok, true);
  assert.equal(result.summary.manifestStoreCandidates, 0);
  assert.ok(result.summary.structuralIssues > 0);

  const oversized = jpegWithJumbf(store);
  const boxLengthOffset = 2 + 4 + 8;
  oversized.set(u32(C2PA_STRUCTURE_LIMITS.manifestBytes + 1), boxLengthOffset);
  const oversizedResult = inspectC2paStructureBytes(oversized, {
    expectedGroup: "jpeg",
  });
  assert.equal(oversizedResult.summary.manifestStoreCandidates, 0);
  assert.equal(oversizedResult.container.oversizedCandidates, 1);
});

test("inspects PNG caBX without claiming CRC validation", () => {
  const png = pngWithStore(sampleStore());
  const result = inspectC2paStructureBytes(png, {
    fileSize: png.byteLength,
    expectedGroup: "png",
  });
  assert.equal(result.ok, true);
  assert.equal(result.container.caBxChunks, 1);
  assert.equal(result.container.crcValidated, false);
  assert.equal(result.summary.expectedComponentSets, 1);
  assert.equal(result.verification.assetBindingVerified, false);
});

test("bounds truncated and forged PNG chunks", () => {
  const truncated = concat(
    Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
    u32(0xffffffff),
    encoder.encode("caBX"),
    new Uint8Array(4),
  );
  const result = inspectC2paStructureBytes(truncated, {
    expectedGroup: "png",
  });
  assert.equal(result.ok, true);
  assert.equal(result.summary.manifestStoreCandidates, 0);
  assert.ok(result.summary.structuralIssues >= 1);

  const fake = concat(
    Uint8Array.of(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a),
    pngChunk("IHDR", new Uint8Array(13)),
    pngChunk("tEXt", sampleStore()),
    pngChunk("IEND"),
  );
  const fakeResult = inspectC2paStructureBytes(fake, {
    expectedGroup: "png",
  });
  assert.equal(fakeResult.summary.manifestStoreCandidates, 0);
});

test("inspects only the official top-level BMFF C2PA uuid shape", () => {
  const bmff = bmffWithStore(sampleStore());
  const result = inspectC2paStructureBytes(bmff, {
    fileSize: bmff.byteLength,
    expectedGroup: "bmff",
  });
  assert.equal(result.ok, true);
  assert.equal(result.container.c2paUuidBoxes, 1);
  assert.equal(result.container.manifestPurposeBoxes, 1);
  assert.equal(result.summary.manifestStoreCandidates, 1);
  assert.equal(result.verification.trustListEvaluated, false);

  const forgedUuid = bmff.slice();
  const uuidOffset = box("ftyp", encoder.encode("isom"), u32(0)).byteLength + 8;
  forgedUuid[uuidOffset] ^= 0xff;
  const forgedResult = inspectC2paStructureBytes(forgedUuid, {
    expectedGroup: "bmff",
  });
  assert.equal(forgedResult.container.c2paUuidBoxes, 0);
  assert.equal(forgedResult.summary.manifestStoreCandidates, 0);
});

test("rejects unsafe extended BMFF sizes and truncated C2PA uuid boxes", () => {
  const unsafe = concat(
    u32(1),
    encoder.encode("ftyp"),
    Uint8Array.of(0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff),
  );
  const result = inspectC2paStructureBytes(unsafe, {
    expectedGroup: "bmff",
  });
  assert.equal(result.ok, false);

  const truncatedUuid = concat(
    box("ftyp", encoder.encode("isom"), u32(0)),
    u32(1000),
    encoder.encode("uuid"),
    bytesFromHex(BMFF_C2PA_UUID),
  );
  const truncatedResult = inspectC2paStructureBytes(truncatedUuid, {
    expectedGroup: "bmff",
  });
  assert.equal(truncatedResult.ok, true);
  assert.ok(truncatedResult.summary.structuralIssues > 0);
});

test("recognizes a standalone store but never treats arbitrary nested boxes as one", () => {
  const store = sampleStore();
  const result = inspectC2paStructureBytes(store, {
    expectedGroup: "jumbf",
  });
  assert.equal(result.ok, true);
  assert.equal(result.summary.manifestStoreCandidates, 1);

  const arbitrary = superbox(UUIDS.signature, "c2pa.signature");
  const arbitraryResult = inspectC2paStructureBytes(arbitrary, {
    expectedGroup: "jumbf",
  });
  assert.equal(arbitraryResult.ok, true);
  assert.equal(arbitraryResult.summary.manifestStoreCandidates, 0);
  assert.equal(arbitraryResult.summary.signatureBoxes, 0);
});

test("reports malformed labels, nested bounds, and trailing non-padding bytes", () => {
  const malformedRoot = box(
    "jumb",
    jumd(UUIDS.store, "c2pa", false),
    box("jumb", u32(9999), encoder.encode("free")),
  );
  const result = inspectC2paStructureBytes(malformedRoot, {
    expectedGroup: "jumbf",
  });
  assert.equal(result.ok, true);
  assert.equal(result.summary.manifestStoreCandidates, 0);

  const storeWithTrailing = concat(sampleStore(), Uint8Array.of(1, 2, 3));
  const trailingResult = inspectC2paStructureBytes(storeWithTrailing, {
    expectedGroup: "jumbf",
  });
  assert.equal(trailingResult.summary.manifestStoreCandidates, 1);
  assert.ok(trailingResult.summary.structuralIssues > 0);
});

test("accepts bounded UTF-8 labels and flags forbidden labels or toggles", () => {
  const unicodeStore = superbox(
    UUIDS.store,
    "c2pa",
    superbox("44444444444444444444444444444444", "撮影由来"),
  );
  const unicodeResult = inspectC2paStructureBytes(unicodeStore, {
    expectedGroup: "jumbf",
  });
  assert.equal(unicodeResult.stores[0].structurallyReadable, true);

  const forbiddenStore = box(
    "jumb",
    jumd(UUIDS.store, "c2pa"),
    box("jumb", jumd("44444444444444444444444444444444", "bad/label")),
  );
  const forbiddenResult = inspectC2paStructureBytes(forbiddenStore, {
    expectedGroup: "jumbf",
  });
  assert.match(forbiddenResult.stores[0].issues.join(" "), /forbidden/iu);

  const missingRequestable = box("jumb", jumd(UUIDS.store, "c2pa", true, 0x02));
  const toggleResult = inspectC2paStructureBytes(missingRequestable, {
    expectedGroup: "jumbf",
  });
  assert.match(toggleResult.stores[0].issues.join(" "), /toggles/iu);
});

test("stops at explicit JUMBF depth and box-count budgets", () => {
  let deeplyNested = box("cbor", Uint8Array.of(0xa0));
  for (let index = 0; index < C2PA_STRUCTURE_LIMITS.depth + 2; index += 1) {
    deeplyNested = superbox(
      "33333333333333333333333333333333",
      `bounded-${index}`,
      deeplyNested,
    );
  }
  const deepStore = superbox(UUIDS.store, "c2pa", deeplyNested);
  const deepResult = inspectC2paStructureBytes(deepStore, {
    expectedGroup: "jumbf",
  });
  assert.equal(deepResult.ok, true);
  assert.ok(deepResult.summary.structuralIssues > 0);
  assert.match(deepResult.stores[0].issues.join(" "), /depth/iu);

  const manyChildren = Array.from(
    { length: C2PA_STRUCTURE_LIMITS.boxes + 1 },
    () => box("free"),
  );
  const wideStore = superbox(UUIDS.store, "c2pa", ...manyChildren);
  const wideResult = inspectC2paStructureBytes(wideStore, {
    expectedGroup: "jumbf",
  });
  assert.equal(wideResult.ok, true);
  assert.ok(wideResult.stores[0].boxesInspected <= C2PA_STRUCTURE_LIMITS.boxes);
  assert.match(wideResult.stores[0].issues.join(" "), /box count/iu);
});

test("observes compressed manifest content without decompressing or validating it", () => {
  const compressedManifest = superbox(
    UUIDS.standardManifest,
    "urn:c2pa:compressed-test",
    box("brob", encoder.encode("not decoded by this inspector")),
  );
  const store = superbox(UUIDS.store, "c2pa", compressedManifest);
  const result = inspectC2paStructureBytes(store, {
    expectedGroup: "jumbf",
  });
  assert.equal(result.ok, true);
  assert.equal(result.summary.compressedContentBoxes, 1);
  assert.equal(result.summary.claimBoxes, 0);
  assert.equal(result.verification.cryptographicSignatureVerified, false);
});

test("rejects signature mismatches and declared-size mismatches before inspection", () => {
  const jpeg = jpegWithJumbf(sampleStore());
  assert.equal(
    inspectC2paStructureBytes(jpeg, { expectedGroup: "png" }).ok,
    false,
  );
  assert.equal(
    inspectC2paStructureBytes(jpeg, {
      fileSize: jpeg.byteLength + 1,
      expectedGroup: "jpeg",
    }).ok,
    false,
  );
  assert.equal(
    inspectC2paStructureBytes(encoder.encode("not media")).ok,
    false,
  );
});

test("counts-only report excludes filename, bytes, raw labels, and private values", () => {
  const privateLabel = "private-person-name@example.test";
  const privateAssertion = superbox(
    "22222222222222222222222222222222",
    privateLabel,
    box("cbor", encoder.encode("secret-private-value")),
  );
  const manifest = superbox(
    UUIDS.standardManifest,
    "urn:c2pa:private",
    superbox(UUIDS.assertionStore, "c2pa.assertions", privateAssertion),
    superbox(UUIDS.claim, "c2pa.claim.v2", box("cbor", Uint8Array.of(0xa0))),
    superbox(
      UUIDS.signature,
      "c2pa.signature",
      box("cbor", Uint8Array.of(0x84)),
    ),
  );
  const store = superbox(UUIDS.store, "c2pa", manifest);
  const result = inspectC2paStructureBytes(store, {
    expectedGroup: "jumbf",
  });
  const report = buildC2paStructureReport(result);
  const serialized = JSON.stringify(report);
  assert.equal(report.scope.filenameIncluded, false);
  assert.equal(report.scope.mediaBytesIncluded, false);
  assert.equal(report.scope.rawManifestIncluded, false);
  assert.equal(report.scope.cryptographicVerificationPerformed, false);
  assert.ok(!serialized.includes(privateLabel));
  assert.ok(!serialized.includes("secret-private-value"));
  assert.ok(!serialized.includes("urn:c2pa:private"));
});
