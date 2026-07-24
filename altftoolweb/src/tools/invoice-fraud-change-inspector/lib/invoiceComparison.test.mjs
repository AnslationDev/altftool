import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCountsOnlyChangeReport,
  compareInvoiceFields,
  createEmptyInvoiceFields,
  extractInvoiceFields,
} from "./invoiceComparison.mjs";

test("extracts labeled invoice text and a bounded line summary", () => {
  const source = `Invoice Number: INV-1042
Invoice Date: 24 July 2026
Vendor: Example Supplies
GSTIN: 22AAAAA0000A1Z5
Bank Account: 000011112222
IBAN: GB82 WEST 1234 5698 7654 32
UPI ID: billing@examplebank
Currency: INR
Description Qty Amount
Consulting 2 1000
Support 1 500
Subtotal: 1500
Tax Amount: 270
Grand Total: 1770`;
  const result = extractInvoiceFields(source);

  assert.equal(result.format, "text");
  assert.equal(result.fields.invoiceNumber, "INV-1042");
  assert.equal(result.fields.vendor, "Example Supplies");
  assert.equal(result.fields.upiId, "billing@examplebank");
  assert.equal(result.fields.currency, "INR");
  assert.equal(result.fields.lineItemCount, "2");
  assert.match(result.fields.lineSummary, /Consulting/);
});

test("extracts nested JSON aliases and summarizes structured line items", () => {
  const source = JSON.stringify({
    invoice: {
      invoice_no: "A-55",
      issueDate: "2026-07-24",
      supplierName: "Sample Vendor",
      payment: { beneficiaryAccount: "12345678", iban: "DE89370400440532013000" },
      totals: { netAmount: 100, taxTotal: 18, amountDue: 118, currencyCode: "EUR" },
      lineItems: [
        { description: "Design", quantity: 1, amount: 100 },
        { description: "Support", quantity: 2, amount: 18 },
      ],
    },
  });
  const result = extractInvoiceFields(source);

  assert.equal(result.format, "json");
  assert.equal(result.fields.invoiceNumber, "A-55");
  assert.equal(result.fields.vendor, "Sample Vendor");
  assert.equal(result.fields.bankAccount, "12345678");
  assert.equal(result.fields.total, "118");
  assert.equal(result.fields.lineItemCount, "2");
  assert.match(result.fields.lineSummary, /Design/);
});

test("normalizes formatting while flagging observable routing and amount changes", () => {
  const baseline = {
    ...createEmptyInvoiceFields(),
    invoiceNumber: "INV-1",
    bankAccount: "1234 5678",
    currency: "INR",
    subtotal: "1,000.00",
    taxAmount: "180",
    total: "1,180.00",
  };
  const current = {
    ...baseline,
    bankAccount: "9999-0000",
    subtotal: "1000",
    total: "1200",
  };
  const result = compareInvoiceFields(baseline, current, {
    baseline: true,
    current: true,
  });

  assert.equal(
    result.comparisons.find((field) => field.key === "subtotal").state,
    "unchanged",
  );
  assert.equal(
    result.comparisons.find((field) => field.key === "bankAccount").attention,
    "payment-routing",
  );
  assert.equal(result.summary.paymentRoutingChanges, 1);
  assert.equal(result.summary.changed, 2);
});

test("distinguishes added, removed and unavailable fields", () => {
  const baseline = {
    ...createEmptyInvoiceFields(),
    vendor: "Vendor A",
    taxId: "TAX-1",
  };
  const current = {
    ...createEmptyInvoiceFields(),
    vendor: "Vendor A",
    upiId: "pay@example",
  };
  const result = compareInvoiceFields(baseline, current);

  assert.equal(
    result.comparisons.find((field) => field.key === "taxId").state,
    "removed",
  );
  assert.equal(
    result.comparisons.find((field) => field.key === "upiId").state,
    "added",
  );
  assert.equal(
    result.comparisons.find((field) => field.key === "iban").state,
    "unavailable",
  );
});

test("creates a counts-only report without raw sensitive invoice values", () => {
  const baseline = {
    ...createEmptyInvoiceFields(),
    invoiceNumber: "SECRET-INVOICE-42",
    vendor: "Private Vendor Name",
    bankAccount: "000011112222",
    upiId: "private.person@examplebank",
    lineSummary: "Confidential consulting engagement",
  };
  const current = {
    ...baseline,
    bankAccount: "999988887777",
    upiId: "changed.person@examplebank",
  };
  const comparison = compareInvoiceFields(baseline, current, {
    baseline: true,
    current: false,
  });
  const report = buildCountsOnlyChangeReport(
    comparison,
    "2026-07-24T00:00:00.000Z",
  );

  assert.ok(report.includes("paymentRoutingChanges"));
  assert.ok(report.includes("2026-07-24T00:00:00.000Z"));
  assert.ok(!report.includes("SECRET-INVOICE-42"));
  assert.ok(!report.includes("Private Vendor Name"));
  assert.ok(!report.includes("000011112222"));
  assert.ok(!report.includes("private.person"));
  assert.ok(!report.includes("Confidential consulting"));
});

test("bounds oversized and deeply nested extraction", () => {
  const oversized = extractInvoiceFields("x".repeat(101), {
    maxSourceCharacters: 100,
  });
  const nested = extractInvoiceFields(
    JSON.stringify({ a: { b: { c: { invoiceNumber: "INV-1" } } } }),
    { maxDepth: 1 },
  );

  assert.equal(oversized.format, "too-large");
  assert.match(oversized.warnings[0], /safe extraction limit/i);
  assert.match(nested.warnings[0], /safe depth limit/i);
});
