import assert from "node:assert/strict";
import test from "node:test";

import {
  PQ_INVENTORY_LIMITATIONS,
  PQ_INVENTORY_LIMITS,
  buildPostQuantumInventoryReport,
  inventoryPostQuantumReferences,
} from "./postQuantumInventory.mjs";

test("inventories RSA certificate metadata without cryptographic claims", () => {
  const result = inventoryPostQuantumReferences(`Certificate:
  Public Key Algorithm: rsaEncryption
  Signature Algorithm: sha256WithRSAEncryption`);
  assert.equal(result.familyCounts.rsa, 2);
  assert.equal(result.assessment.level, "review");
  assert.match(result.assessment.description, /Confirm their runtime purpose/);
});

test("inventories elliptic-curve aliases and finite-field DSA/DH", () => {
  const result = inventoryPostQuantumReferences(`curve = prime256v1
signature = ECDSA
legacy_signature = DSA
key_exchange = Diffie-Hellman
group = DHE`);
  assert.equal(result.familyCounts["elliptic-curve"], 2);
  assert.equal(result.familyCounts.dsa, 1);
  assert.equal(result.familyCounts["diffie-hellman"], 2);
});

test("does not misclassify ML-DSA as classical DSA", () => {
  const result = inventoryPostQuantumReferences("signature = ML-DSA-65");
  assert.equal(result.familyCounts["ml-dsa"], 1);
  assert.equal(result.familyCounts.dsa, undefined);
});

test("finds TLS cipher-suite context and its observable families", () => {
  const result = inventoryPostQuantumReferences(
    "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384",
  );
  assert.equal(result.familyCounts.tls, 1);
  assert.equal(result.familyCounts["elliptic-curve"], 1);
  assert.equal(result.familyCounts.rsa, 1);
  assert.ok(
    result.questions.some((question) => question.id === "tls-negotiation"),
  );
});

test("recognizes finalized NIST PQC family names and legacy project names", () => {
  const result = inventoryPostQuantumReferences(`ML-KEM-768
CRYSTALS-Kyber
ML-DSA-65
Dilithium3
SLH-DSA
SPHINCS+
FN-DSA
Falcon512
HQC-192`);
  assert.equal(result.familyCounts["ml-kem"], 2);
  assert.equal(result.familyCounts["ml-dsa"], 2);
  assert.equal(result.familyCounts["slh-dsa"], 2);
  assert.equal(result.familyCounts["fn-dsa-falcon"], 2);
  assert.equal(result.familyCounts.hqc, 1);
  assert.equal(result.counts["post-quantum-reference"], 9);
});

test("uses line-level observations without retaining snippets", () => {
  const privateContext = "private-host-name";
  const result = inventoryPostQuantumReferences(
    `${privateContext}: algorithm=RSA`,
  );
  assert.equal(result.observations[0].line, 1);
  assert.equal(result.observations[0].evidence, "[matched reference hidden]");
  assert.doesNotMatch(JSON.stringify(result), new RegExp(privateContext));
});

test("adds family-specific migration questions", () => {
  const result = inventoryPostQuantumReferences("RSA ECDH TLS 1.3 ML-KEM-768");
  const ids = new Set(result.questions.map((question) => question.id));
  assert.ok(ids.has("rsa-surfaces"));
  assert.ok(ids.has("discrete-log-surfaces"));
  assert.ok(ids.has("tls-negotiation"));
  assert.ok(ids.has("pqc-implementation-evidence"));
});

test("returns calibrated empty output for no configured references", () => {
  const result = inventoryPostQuantumReferences(
    "This file contains application settings only.",
  );
  assert.equal(result.stats.observations, 0);
  assert.equal(result.assessment.level, "empty");
  assert.match(result.assessment.description, /does not show/);
});

test("recognizes common algorithm OIDs", () => {
  const result = inventoryPostQuantumReferences(`1.2.840.113549.1.1.1
1.2.840.10040.4.1
1.2.840.113549.1.3.1`);
  assert.equal(result.familyCounts.rsa, 1);
  assert.equal(result.familyCounts.dsa, 1);
  assert.equal(result.familyCounts["diffie-hellman"], 1);
});

test("enforces bounded input size and line count", () => {
  assert.throws(
    () =>
      inventoryPostQuantumReferences(
        "x".repeat(PQ_INVENTORY_LIMITS.maxCharacters + 1),
      ),
    RangeError,
  );
  assert.throws(
    () =>
      inventoryPostQuantumReferences(
        Array.from(
          { length: PQ_INVENTORY_LIMITS.maxLines + 1 },
          () => "line",
        ).join("\n"),
      ),
    RangeError,
  );
});

test("caps observations and marks truncation", () => {
  const result = inventoryPostQuantumReferences(
    Array.from(
      { length: PQ_INVENTORY_LIMITS.maxObservations + 1 },
      () => "RSA",
    ).join("\n"),
  );
  assert.equal(result.observations.length, PQ_INVENTORY_LIMITS.maxObservations);
  assert.equal(
    result.stats.observations,
    PQ_INVENTORY_LIMITS.maxObservations + 1,
  );
  assert.equal(
    result.counts["classical-public-key"],
    PQ_INVENTORY_LIMITS.maxObservations + 1,
  );
  assert.equal(result.truncated, true);
});

test("counts a classical reference after the display cap and avoids a false-clear assessment", () => {
  const result = inventoryPostQuantumReferences(
    [
      ...Array.from(
        { length: PQ_INVENTORY_LIMITS.maxObservations },
        () => "TLS 1.3",
      ),
      "certificate algorithm RSA",
    ].join("\n"),
  );
  assert.equal(result.observations.length, PQ_INVENTORY_LIMITS.maxObservations);
  assert.equal(result.familyCounts.rsa, 1);
  assert.equal(result.counts["classical-public-key"], 1);
  assert.equal(result.assessment.level, "review");
  assert.equal(result.truncated, true);
  assert.ok(
    result.questions.some((question) => question.id === "rsa-surfaces"),
  );
});

test("builds a privacy-safe counts-only report with limitations", () => {
  const result = inventoryPostQuantumReferences(
    "private-customer.example uses RSA",
  );
  const report = buildPostQuantumInventoryReport(result);
  assert.equal(report.tool, "Post-Quantum Migration Inventory");
  assert.deepEqual(report.limitations, [...PQ_INVENTORY_LIMITATIONS]);
  assert.equal(report.familyCounts.rsa, 1);
  assert.doesNotMatch(JSON.stringify(report), /private-customer/);
});

test("rejects non-text input", () => {
  assert.throws(() => inventoryPostQuantumReferences({}), TypeError);
});
