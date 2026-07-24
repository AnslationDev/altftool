import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSnapshotCertificate,
  canonicalJson,
  detectScreenshotMediaType,
  normalizeObservedAt,
  normalizeSourceUrl,
  prepareCertificatePayload,
  serializeCertificate,
  sha256Bytes,
  snapshotCertificateLimits,
} from "./snapshotCertificate.mjs";

const SCREENSHOT_SHA256 = "a".repeat(64);

function validInput(overrides = {}) {
  return {
    sourceUrl: "https://example.com/article?id=7",
    title: "Example article",
    observedAt: "2026-07-24T14:30:15+05:30",
    notes: "Visible notice was present.",
    screenshot: {
      filename: "capture.png",
      mediaType: "image/png",
      sizeBytes: 1_024,
      sha256: SCREENSHOT_SHA256,
    },
    ...overrides,
  };
}

test("normalizes HTTP and HTTPS URLs without fetching them", () => {
  assert.deepEqual(normalizeSourceUrl(" HTTPS://Example.COM:443/a?b=1&utm_source=test "), {
    ok: true,
    value: "https://example.com/a?b=1&utm_source=test",
  });
  assert.equal(normalizeSourceUrl("file:///private/screenshot.png").ok, false);
  assert.equal(normalizeSourceUrl("https://name:secret@example.com/").ok, false);
  assert.equal(
    normalizeSourceUrl(
      `https://example.com/${"x".repeat(snapshotCertificateLimits.maxUrlCharacters)}`,
    ).ok,
    false,
  );
});

test("rejects URL fragments because they may contain private application state", () => {
  assert.equal(normalizeSourceUrl("https://example.com/page#access_token=secret").ok, false);
  assert.equal(normalizeSourceUrl("https://example.com/page#").ok, false);
  assert.match(
    normalizeSourceUrl("https://example.com/page#section").error,
    /fragment/iu,
  );
});

test("rejects likely secret query keys while allowing ordinary query parameters", () => {
  const blocked = [
    "https://example.com/?token=secret",
    "https://example.com/?access_token=secret",
    "https://example.com/?auth_token=secret",
    "https://example.com/?csrf-token=secret",
    "https://example.com/?apiKey=secret",
    "https://example.com/?session_id=secret",
    "https://example.com/?code=oauth-code",
    "https://example.com/?X-Amz-Signature=signed",
    "https://example.com/?client_secret=secret",
  ];
  blocked.forEach((url) => assert.equal(normalizeSourceUrl(url).ok, false, url));

  assert.deepEqual(
    normalizeSourceUrl(
      "https://example.com/search?q=access_token&category=security&page=2",
    ),
    {
      ok: true,
      value:
        "https://example.com/search?q=access_token&category=security&page=2",
    },
  );
});

test("requires an unambiguous observation time and converts it to UTC", () => {
  assert.deepEqual(normalizeObservedAt("2026-07-24T14:30:15+05:30"), {
    ok: true,
    declared: "2026-07-24T14:30:15+05:30",
    utc: "2026-07-24T09:00:15.000Z",
  });
  assert.equal(normalizeObservedAt("2026-07-24T14:30").ok, false);
  assert.equal(normalizeObservedAt("2026-02-30T14:30:00Z").ok, false);
  assert.equal(normalizeObservedAt("2026-07-24T14:30:00+14:30").ok, false);
});

test("detects supported screenshot formats by file signature", () => {
  assert.equal(
    detectScreenshotMediaType(
      Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ),
    "image/png",
  );
  assert.equal(
    detectScreenshotMediaType(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])),
    "image/jpeg",
  );
  assert.equal(
    detectScreenshotMediaType(
      Uint8Array.from([
        0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50,
      ]),
    ),
    "image/webp",
  );
  assert.equal(detectScreenshotMediaType(new Uint8Array([1, 2, 3])), null);
});

test("computes the standard SHA-256 digest for bytes", async () => {
  const digest = await sha256Bytes(new TextEncoder().encode("abc"));
  assert.equal(
    digest,
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("canonical JSON sorts nested object keys and preserves array order", () => {
  assert.equal(
    canonicalJson({ z: 1, a: { d: 4, b: 2 }, items: [3, { y: 2, x: 1 }] }),
    '{"a":{"b":2,"d":4},"items":[3,{"x":1,"y":2}],"z":1}',
  );
  assert.throws(() => canonicalJson({ value: Number.NaN }), /non-finite/u);
});

test("prepares bounded metadata counts and explicit local-only processing", () => {
  const result = prepareCertificatePayload(
    validInput({
      title: `  ${"T".repeat(snapshotCertificateLimits.maxTitleCharacters + 10)}  `,
      notes: "First\r\nSecond",
      screenshot: {
        filename: "folder\\capture.png",
        mediaType: "IMAGE/PNG",
        sizeBytes: 1_024,
        sha256: SCREENSHOT_SHA256.toUpperCase(),
      },
    }),
  );

  assert.equal(result.ok, true);
  assert.equal(
    result.payload.source.pageTitle.length,
    snapshotCertificateLimits.maxTitleCharacters,
  );
  assert.equal(result.payload.annotations.notes, "First\nSecond");
  assert.equal(result.payload.screenshot.filename, "capture.png");
  assert.equal(result.payload.source.url, "https://example.com/article?id=7");
  assert.equal(result.payload.processing.networkUsed, false);
  assert.equal(result.payload.processing.sourceUrlFetched, false);
  assert.equal(result.payload.processing.screenshotEmbedded, false);
  assert.equal(result.payload.processing.acceptedFullUrlStoredInManifest, true);
  assert.equal(result.payload.counts.screenshotFilesHashed, 1);
  assert.match(
    result.payload.limitations.join(" "),
    /complete accepted source URL.*stored in the downloaded manifest/iu,
  );
});

test("aggregates invalid metadata and screenshot errors", () => {
  const result = prepareCertificatePayload({
    sourceUrl: "javascript:alert(1)",
    title: " ",
    observedAt: "today",
    screenshot: {
      filename: "",
      mediaType: "image/svg+xml",
      sizeBytes: snapshotCertificateLimits.maxFileBytes + 1,
      sha256: "bad",
    },
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.length >= 6);
  assert.ok(result.errors.some((error) => /HTTP and HTTPS/u.test(error)));
  assert.ok(result.errors.some((error) => /PNG, JPEG, or WebP/u.test(error)));
});

test("builds byte-for-byte deterministic certificates from identical inputs", async () => {
  const first = await buildSnapshotCertificate(validInput());
  const second = await buildSnapshotCertificate(validInput());

  assert.equal(first.ok, true);
  assert.equal(first.serialized, second.serialized);
  assert.equal(
    first.certificate.integrity.payloadSha256,
    second.certificate.integrity.payloadSha256,
  );
  assert.equal(first.certificate.integrity.signed, false);
  assert.equal(first.certificate.integrity.notarized, false);
  assert.equal(first.certificate.integrity.thirdPartyTimestamp, false);
});

test("changing one metadata value changes the certificate payload digest", async () => {
  const first = await buildSnapshotCertificate(validInput());
  const second = await buildSnapshotCertificate(
    validInput({ notes: "Different note." }),
  );

  assert.notEqual(
    first.certificate.integrity.payloadSha256,
    second.certificate.integrity.payloadSha256,
  );
});

test("payload digest covers every field except the integrity object", async () => {
  const result = await buildSnapshotCertificate(validInput());
  const { integrity, ...payload } = result.certificate;
  const recalculated = await sha256Bytes(
    new TextEncoder().encode(canonicalJson(payload)),
  );

  assert.equal(integrity.payloadSha256, recalculated);
  assert.equal(result.canonicalPayload, canonicalJson(payload));
});

test("serialized manifest is deterministic JSON and never embeds screenshot bytes", async () => {
  const result = await buildSnapshotCertificate(validInput());
  const serializedAgain = serializeCertificate(result.certificate);
  const parsed = JSON.parse(serializedAgain);

  assert.equal(serializedAgain, result.serialized);
  assert.equal(parsed.screenshot.sha256, SCREENSHOT_SHA256);
  assert.equal(parsed.processing.contentAnalyzed, false);
  assert.equal("bytes" in parsed.screenshot, false);
  assert.doesNotMatch(serializedAgain, /generatedAt|createdAt/iu);
});

test("fixed limitations reject authenticity, timestamp, and legal claims", async () => {
  const result = await buildSnapshotCertificate(validInput());
  const limitations = result.certificate.limitations.join(" ");

  assert.match(limitations, /not notarization/iu);
  assert.match(limitations, /not independently verified/iu);
  assert.match(limitations, /proof of capture time or content/iu);
  assert.match(limitations, /legal admissibility/iu);
});
