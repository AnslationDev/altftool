import assert from "node:assert/strict";
import test from "node:test";

import {
  BANK_STATEMENT_PRESETS,
  REDACTION_MODES,
  SENSITIVE_PATTERNS,
  buildExportPlan,
  buildOutputName,
  calculatePrivacyScore,
  createPresetRectangle,
  formatBytes,
  getRasterScale,
  moveRectangle,
  projectRectangle,
  rectangleFromPoints,
  updateRectangleBounds,
} from "./redactorModel.mjs";

test("all eight manual presets create bounded normalized rectangles", () => {
  const expected = [
    "name",
    "address",
    "account",
    "ifsc",
    "iban",
    "cards",
    "balances",
    "transactions",
  ];

  assert.deepEqual(Object.keys(BANK_STATEMENT_PRESETS), expected);
  expected.forEach((key, index) => {
    const rectangle = createPresetRectangle(key, `mask-${index}`);
    assert.equal(rectangle.presetKey, key);
    assert.ok(rectangle.x >= 0 && rectangle.y >= 0);
    assert.ok(rectangle.x + rectangle.width <= 1);
    assert.ok(rectangle.y + rectangle.height <= 1);
  });
});

test("drawing, moving, and resizing stay within page bounds", () => {
  const drawn = rectangleFromPoints(
    { x: 0.9, y: 0.8 },
    { x: 0.2, y: 0.1 },
    "custom",
  );
  assert.ok(Math.abs(drawn.x - 0.2) < Number.EPSILON);
  assert.ok(Math.abs(drawn.y - 0.1) < Number.EPSILON);
  assert.ok(Math.abs(drawn.width - 0.7) < Number.EPSILON);
  assert.ok(Math.abs(drawn.height - 0.7) < Number.EPSILON);

  const moved = moveRectangle(drawn, 0.8, 0.8);
  assert.ok(moved.x + moved.width <= 1);
  assert.ok(moved.y + moved.height <= 1);

  const resized = updateRectangleBounds(moved, {
    x: -5,
    y: -3,
    width: 2,
    height: 4,
  });
  assert.deepEqual(
    {
      x: resized.x,
      y: resized.y,
      width: resized.width,
      height: resized.height,
    },
    { x: 0, y: 0, width: 1, height: 1 },
  );
});

test("projection covers fractional mask edges on a raster canvas", () => {
  const projected = projectRectangle(
    { x: 0.101, y: 0.202, width: 0.333, height: 0.224 },
    1000,
    500,
  );
  assert.deepEqual(projected, {
    x: 101,
    y: 101,
    width: 334,
    height: 113,
  });
});

test("raster scale honors DPI and maximum edge", () => {
  assert.equal(
    getRasterScale({ width: 612, height: 792, rasterDpi: 144 }),
    2,
  );
  assert.equal(
    getRasterScale({
      width: 4000,
      height: 8000,
      rasterDpi: 216,
      maxEdge: 6000,
    }),
    0.75,
  );
});

test("export plan drops unusable masks and describes flattened output", () => {
  const plan = buildExportPlan({
    sourceType: "pdf",
    rasterDpi: 999,
    pages: [
      {
        pageNumber: 1,
        rectangles: [
          createPresetRectangle("account", "account-1"),
          { id: "point", x: 0.4, y: 0.4, width: 0, height: 0 },
        ],
      },
      { pageNumber: 2, rectangles: [] },
    ],
  });

  assert.equal(plan.outputType, "application/pdf");
  assert.equal(plan.rasterDpi, 216);
  assert.equal(plan.totalPages, 2);
  assert.equal(plan.totalRedactions, 1);
  assert.deepEqual(plan.pagesWithoutRedactions, [2]);
  assert.equal(plan.shouldFlatten, true);
  assert.equal(plan.retainsSourceText, false);
  assert.equal(plan.retainsSourceObjects, false);
});

test("output names are sanitized and match the raster type", () => {
  assert.equal(
    buildOutputName("My Bank Statement (July).pdf", "pdf"),
    "My-Bank-Statement-July-redacted.pdf",
  );
  assert.equal(buildOutputName("नमस्ते.png", "image"), "bank-statement-redacted.png");
});

test("sensitive data pattern regexes match IFSC, PAN, UPI, and Card patterns", () => {
  const ifscPattern = SENSITIVE_PATTERNS.find((p) => p.key === "ifsc");
  assert.ok(ifscPattern.regex.test("SBIN0001234"));

  const panPattern = SENSITIVE_PATTERNS.find((p) => p.key === "pan_card");
  assert.ok(panPattern.regex.test("ABCDE1234F"));

  const upiPattern = SENSITIVE_PATTERNS.find((p) => p.key === "upi_id");
  assert.ok(upiPattern.regex.test("user@okaxis"));
});

test("privacy score calculation computes score and recommendations accurately", () => {
  const scoreClean = calculatePrivacyScore([], []);
  assert.equal(scoreClean.score, 100);

  const detected = [
    { id: "1", severity: "high", status: "detected" },
    { id: "2", severity: "medium", status: "detected" },
  ];
  const scoreExposed = calculatePrivacyScore(detected, []);
  assert.ok(scoreExposed.score < 100);
  assert.equal(scoreExposed.unhandledHighRisk, undefined);

  const redacted = [
    { id: "1", severity: "high", status: "redacted" },
    { id: "2", severity: "medium", status: "redacted" },
  ];
  const scoreCovered = calculatePrivacyScore(redacted, [{ id: "mask-1" }, { id: "mask-2" }]);
  assert.equal(scoreCovered.score, 100);
});

test("formatBytes formats byte numbers into human-readable strings", () => {
  assert.equal(formatBytes(0), "0 B");
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(2048), "2.0 KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
});
