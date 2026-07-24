import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeTransactions,
  buildAggregateSummaryCsv,
  buildSignalCountsCsv,
  categorizeTransaction,
  detectDelimiter,
  normalizeTransactions,
  parseDelimitedText,
  parseMoney,
  parseStatementDate,
  suggestMapping,
} from "./statementAnalyzer.mjs";

test("CSV parser handles quoted delimiters and duplicate headers", () => {
  const parsed = parseDelimitedText(
    'Date,Description,Amount,Amount\n01/01/2026,"Cafe, Central",-450,-450\n',
  );
  assert.deepEqual(parsed.headers, ["Date", "Description", "Amount", "Amount (2)"]);
  assert.equal(parsed.rows[0].Description, "Cafe, Central");
  assert.equal(parsed.rows[0]["Amount (2)"], "-450");
  assert.equal(detectDelimiter("Date\tDetails\tDebit"), "\t");
});

test("mapping suggestions use common bank statement headings", () => {
  assert.deepEqual(
    suggestMapping(["Txn Date", "Narration", "Withdrawal Amount", "Deposit Amount"]),
    {
      date: "Txn Date",
      description: "Narration",
      debit: "Withdrawal Amount",
      credit: "Deposit Amount",
      amount: "",
    },
  );
});

test("money parser supports symbols, grouping, parentheses, and DR/CR", () => {
  assert.equal(parseMoney("₹1,234.50"), 1234.5);
  assert.equal(parseMoney("(250.00)"), -250);
  assert.equal(parseMoney("99.90 DR"), -99.9);
  assert.equal(parseMoney("99.90 CR"), 99.9);
  assert.equal(parseMoney("not money"), null);
});

test("date parser is explicit about ambiguous day and month ordering", () => {
  assert.equal(parseStatementDate("03/04/2026", "DMY"), "2026-04-03");
  assert.equal(parseStatementDate("03/04/2026", "MDY"), "2026-03-04");
  assert.equal(parseStatementDate("2026-12-31", "DMY"), "2026-12-31");
  assert.equal(parseStatementDate("31/02/2026", "DMY"), null);
});

test("deterministic categories depend only on description and direction", () => {
  assert.equal(categorizeTransaction("SWIGGY ORDER 123", "outflow"), "Dining");
  assert.equal(categorizeTransaction("MONTHLY SALARY", "inflow"), "Income");
  assert.equal(categorizeTransaction("UNKNOWN MERCHANT", "outflow"), "Other");
});

test("normalization supports debit and credit columns while reporting skipped rows", () => {
  const rows = [
    { Date: "01/01/2026", Narration: "Salary", Debit: "", Credit: "50,000" },
    { Date: "02/01/2026", Narration: "Rent", Debit: "15,000", Credit: "" },
    { Date: "03/01/2026", Narration: "", Debit: "100", Credit: "" },
  ];
  const result = normalizeTransactions(rows, {
    date: "Date",
    description: "Narration",
    debit: "Debit",
    credit: "Credit",
    amount: "",
  });
  assert.equal(result.transactions.length, 2);
  assert.equal(result.transactions[0].inflow, 50000);
  assert.equal(result.transactions[1].outflow, 15000);
  assert.equal(result.skipped[0].reason, "Missing description");
});

test("analysis totals, categories, months, and review signals are deterministic", () => {
  const transactions = [
    ["2026-01-01", "Cafe", 100],
    ["2026-01-01", "Cafe", 100],
    ["2026-01-05", "Grocery", 120],
    ["2026-02-05", "Grocery", 130],
    ["2026-03-05", "Rent", 5000],
    ["2026-03-06", "Fuel", 110],
  ].map(([date, description, outflow], index) => ({
    id: `row-${index}`,
    date,
    dateRaw: date,
    description,
    inflow: 0,
    outflow,
    net: -outflow,
    direction: "outflow",
    category: categorizeTransaction(description, "outflow"),
  }));
  const analysis = analyzeTransactions(transactions);
  assert.equal(analysis.transactionCount, 6);
  assert.equal(analysis.totals.outflow, 5560);
  assert.equal(analysis.possibleDuplicateGroupCount, 1);
  assert.ok(analysis.signals.some((signal) => signal.type === "unusually-large"));
  assert.equal(analysis.months.length, 3);
});

test("download exports contain aggregate counts but no raw descriptions", () => {
  const analysis = analyzeTransactions([
    {
      id: "row-2",
      date: "2026-01-01",
      dateRaw: "01/01/2026",
      description: "PRIVATE MERCHANT NAME",
      inflow: 0,
      outflow: 200,
      net: -200,
      direction: "outflow",
      category: "Other",
    },
  ]);
  const summary = buildAggregateSummaryCsv(analysis, {
    skippedCount: 2,
    invalidDateCount: 1,
  });
  const signals = buildSignalCountsCsv(analysis);
  assert.match(summary, /Analysed transactions,1/);
  assert.match(signals, /possible-duplicate,0/);
  assert.doesNotMatch(`${summary}${signals}`, /PRIVATE MERCHANT NAME/);
});
