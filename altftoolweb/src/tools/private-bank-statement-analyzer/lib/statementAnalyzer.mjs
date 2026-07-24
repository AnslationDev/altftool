const DELIMITER_OPTIONS = [",", "\t", ";", "|"];

const CATEGORY_RULES = [
  {
    category: "Housing",
    terms: ["rent", "landlord", "mortgage", "housing society", "maintenance charge"],
  },
  {
    category: "Groceries",
    terms: [
      "grocery",
      "groceries",
      "supermarket",
      "bigbasket",
      "blinkit",
      "zepto",
      "dmart",
      "fresh mart",
    ],
  },
  {
    category: "Dining",
    terms: [
      "restaurant",
      "cafe",
      "coffee",
      "swiggy",
      "zomato",
      "food court",
      "bakery",
      "pizza",
    ],
  },
  {
    category: "Transport",
    terms: [
      "uber",
      "ola",
      "rapido",
      "metro",
      "railway",
      "irctc",
      "petrol",
      "diesel",
      "fuel",
      "parking",
      "toll",
      "fastag",
    ],
  },
  {
    category: "Utilities",
    terms: [
      "electricity",
      "water bill",
      "gas bill",
      "broadband",
      "internet",
      "mobile recharge",
      "telephone",
      "utility",
    ],
  },
  {
    category: "Shopping",
    terms: [
      "amazon",
      "flipkart",
      "myntra",
      "ajio",
      "shopping",
      "retail",
      "store",
      "marketplace",
    ],
  },
  {
    category: "Health",
    terms: [
      "hospital",
      "clinic",
      "pharmacy",
      "medical",
      "doctor",
      "diagnostic",
      "medicine",
      "healthcare",
    ],
  },
  {
    category: "Education",
    terms: [
      "school",
      "college",
      "university",
      "tuition",
      "course",
      "education",
      "books",
      "exam fee",
    ],
  },
  {
    category: "Subscriptions",
    terms: [
      "subscription",
      "netflix",
      "spotify",
      "prime video",
      "youtube premium",
      "apple.com/bill",
      "google storage",
      "membership",
    ],
  },
  {
    category: "Bank fees",
    terms: [
      "bank charge",
      "service charge",
      "late fee",
      "penalty",
      "atm fee",
      "annual fee",
      "sms charge",
      "processing fee",
      "gst on charge",
    ],
  },
  {
    category: "Transfers",
    terms: [
      "upi",
      "neft",
      "rtgs",
      "imps",
      "transfer",
      "wallet",
      "paytm",
      "phonepe",
      "gpay",
    ],
  },
  {
    category: "Cash",
    terms: ["cash withdrawal", "atm withdrawal", "cash deposit", "cash wd"],
  },
  {
    category: "Travel",
    terms: [
      "hotel",
      "airline",
      "flight",
      "booking.com",
      "airbnb",
      "makemytrip",
      "goibibo",
      "travel",
    ],
  },
  {
    category: "Entertainment",
    terms: ["cinema", "movie", "theatre", "gaming", "concert", "bookmyshow"],
  },
  {
    category: "Insurance & tax",
    terms: [
      "insurance",
      "premium",
      "income tax",
      "property tax",
      "professional tax",
      "lic premium",
    ],
  },
];

const INCOME_TERMS = [
  "salary",
  "payroll",
  "interest credit",
  "dividend",
  "refund",
  "cashback",
  "reimbursement",
  "pension",
];

const HEADER_HINTS = {
  date: ["date", "transaction date", "txn date", "value date", "posted date"],
  description: [
    "description",
    "narration",
    "details",
    "transaction details",
    "particulars",
    "merchant",
    "remarks",
  ],
  debit: ["debit", "withdrawal", "withdrawal amount", "paid out", "money out"],
  credit: ["credit", "deposit", "deposit amount", "paid in", "money in"],
  amount: ["amount", "transaction amount", "txn amount", "value"],
};

function normalizeHeader(value) {
  return String(value || "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function countDelimiter(line, delimiter) {
  let count = 0;
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === '"') {
      if (inQuotes && line[index + 1] === '"') index += 1;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && line[index] === delimiter) {
      count += 1;
    }
  }
  return count;
}

export function detectDelimiter(text) {
  const firstLine =
    String(text || "")
      .split(/\r?\n/)
      .find((line) => line.trim()) || "";
  return DELIMITER_OPTIONS.reduce(
    (best, delimiter) => {
      const count = countDelimiter(firstLine, delimiter);
      return count > best.count ? { delimiter, count } : best;
    },
    { delimiter: ",", count: -1 },
  ).delimiter;
}

export function parseDelimitedText(text, requestedDelimiter = "auto") {
  const source = String(text || "").replace(/^\uFEFF/, "");
  if (!source.trim()) {
    return { headers: [], rows: [], delimiter: ",", warnings: ["No data was provided."] };
  }
  const delimiter =
    requestedDelimiter === "auto" ? detectDelimiter(source) : requestedDelimiter;
  if (!DELIMITER_OPTIONS.includes(delimiter)) {
    throw new TypeError("Unsupported delimiter.");
  }

  const matrix = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"') {
      if (inQuotes && source[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (character === delimiter && !inQuotes) {
      row.push(field.trim());
      field = "";
    } else if ((character === "\n" || character === "\r") && !inQuotes) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) matrix.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  row.push(field.trim());
  if (row.some((cell) => cell !== "")) matrix.push(row);

  if (!matrix.length) {
    return { headers: [], rows: [], delimiter, warnings: ["No rows were found."] };
  }

  const seen = new Map();
  const headers = matrix[0].map((header, index) => {
    const base = header || `Column ${index + 1}`;
    const count = seen.get(base) || 0;
    seen.set(base, count + 1);
    return count ? `${base} (${count + 1})` : base;
  });
  const warnings = [];
  const rows = matrix.slice(1).map((cells, index) => {
    if (cells.length !== headers.length) {
      warnings.push(
        `Row ${index + 2} has ${cells.length} columns; expected ${headers.length}.`,
      );
    }
    return headers.reduce((record, header, columnIndex) => {
      record[header] = cells[columnIndex] ?? "";
      return record;
    }, {});
  });

  if (inQuotes) warnings.push("The final quoted field appears to be incomplete.");
  return { headers, rows, delimiter, warnings };
}

export function suggestMapping(headers) {
  const normalized = headers.map((header) => ({
    original: header,
    normalized: normalizeHeader(header),
  }));
  const result = {};

  Object.entries(HEADER_HINTS).forEach(([field, hints]) => {
    const exact = normalized.find((header) => hints.includes(header.normalized));
    const partial = normalized.find((header) =>
      hints.some(
        (hint) =>
          header.normalized.includes(hint) ||
          (hint.length > 5 && hint.includes(header.normalized)),
      ),
    );
    result[field] = exact?.original || partial?.original || "";
  });
  if (result.amount === result.debit || result.amount === result.credit) {
    result.amount = "";
  }
  return result;
}

export function parseMoney(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  let text = String(value ?? "").trim();
  if (!text || /^[-—–]$/.test(text)) return 0;
  const isParenthesized = /^\(.*\)$/.test(text);
  const isDebit = /\bdr\.?$/i.test(text);
  const isCredit = /\bcr\.?$/i.test(text);
  text = text
    .replace(/\b(?:dr|cr)\.?$/i, "")
    .replace(/[₹$€£,\s]/g, "")
    .replace(/[^\d.+-]/g, "");
  if (!text || !/[0-9]/.test(text)) return null;
  const parsed = Number(text);
  if (!Number.isFinite(parsed)) return null;
  if (isParenthesized || isDebit) return -Math.abs(parsed);
  if (isCredit) return Math.abs(parsed);
  return parsed;
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function validDateParts(year, month, day) {
  const candidate = new Date(Date.UTC(year, month - 1, day));
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  );
}

export function parseStatementDate(value, order = "DMY") {
  const text = String(value || "").trim();
  if (!text) return null;
  const isoMatch = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  let year;
  let month;
  let day;

  if (isoMatch) {
    [, year, month, day] = isoMatch.map(Number);
  } else {
    const match = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2}|\d{4})$/);
    if (!match) return null;
    const first = Number(match[1]);
    const second = Number(match[2]);
    year = Number(match[3]);
    if (year < 100) year += year >= 70 ? 1900 : 2000;
    if (order === "MDY") {
      month = first;
      day = second;
    } else {
      day = first;
      month = second;
    }
  }

  if (!validDateParts(year, month, day)) return null;
  return `${year}-${pad(month)}-${pad(day)}`;
}

function includesTerm(description, terms) {
  const padded = ` ${description.replace(/[^a-z0-9]+/g, " ").trim()} `;
  return terms.some((term) => padded.includes(` ${term} `));
}

export function categorizeTransaction(description, direction = "outflow") {
  const normalized = String(description || "").toLowerCase();
  if (direction === "inflow" && includesTerm(normalized, INCOME_TERMS)) return "Income";
  return (
    CATEGORY_RULES.find((rule) => includesTerm(normalized, rule.terms))?.category ||
    (direction === "inflow" ? "Other inflow" : "Other")
  );
}

export function normalizeTransactions(
  rows,
  mapping,
  {
    dateOrder = "DMY",
    amountDirection = "negative-outflow",
  } = {},
) {
  const transactions = [];
  const skipped = [];

  rows.forEach((row, index) => {
    const sourceRow = index + 2;
    const description = String(row[mapping.description] || "").trim();
    const dateRaw = String(row[mapping.date] || "").trim();
    const date = parseStatementDate(dateRaw, dateOrder);
    let inflow = 0;
    let outflow = 0;
    let invalidAmount = false;

    if (mapping.amount) {
      const amount = parseMoney(row[mapping.amount]);
      if (amount === null) invalidAmount = true;
      else if (amountDirection === "positive-outflow") {
        if (amount > 0) outflow = amount;
        else inflow = Math.abs(amount);
      } else if (amount < 0) {
        outflow = Math.abs(amount);
      } else {
        inflow = amount;
      }
    } else {
      const debit = parseMoney(row[mapping.debit]);
      const credit = parseMoney(row[mapping.credit]);
      if (debit === null || credit === null) invalidAmount = true;
      else {
        outflow = Math.abs(debit);
        inflow = Math.abs(credit);
      }
    }

    if (!description || invalidAmount || (inflow === 0 && outflow === 0)) {
      skipped.push({
        sourceRow,
        reason: !description
          ? "Missing description"
          : invalidAmount
            ? "Unreadable amount"
            : "Zero-value transaction",
      });
      return;
    }

    const direction = outflow > 0 ? "outflow" : "inflow";
    transactions.push({
      id: `row-${sourceRow}`,
      sourceRow,
      date,
      dateRaw,
      description,
      inflow,
      outflow,
      net: inflow - outflow,
      direction,
      category: categorizeTransaction(description, direction),
    });
  });

  return {
    transactions,
    skipped,
    invalidDateCount: transactions.filter((transaction) => !transaction.date).length,
  };
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function median(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function normalizeDescription(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b(?:ref|reference|txn|transaction|utr)[:#\s-]*[a-z0-9-]+\b/g, " ")
    .replace(/\d{5,}/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function analyzeTransactions(transactions) {
  const totals = transactions.reduce(
    (result, transaction) => {
      result.inflow += transaction.inflow;
      result.outflow += transaction.outflow;
      return result;
    },
    { inflow: 0, outflow: 0 },
  );
  totals.inflow = roundMoney(totals.inflow);
  totals.outflow = roundMoney(totals.outflow);
  totals.net = roundMoney(totals.inflow - totals.outflow);

  const categoryMap = new Map();
  transactions
    .filter((transaction) => transaction.outflow > 0)
    .forEach((transaction) => {
      const current = categoryMap.get(transaction.category) || {
        category: transaction.category,
        count: 0,
        outflow: 0,
      };
      current.count += 1;
      current.outflow += transaction.outflow;
      categoryMap.set(transaction.category, current);
    });
  const categories = [...categoryMap.values()]
    .map((item) => ({
      ...item,
      outflow: roundMoney(item.outflow),
      share: totals.outflow ? item.outflow / totals.outflow : 0,
    }))
    .sort((left, right) => right.outflow - left.outflow);

  const monthMap = new Map();
  transactions
    .filter((transaction) => transaction.date)
    .forEach((transaction) => {
      const month = transaction.date.slice(0, 7);
      const current = monthMap.get(month) || {
        month,
        count: 0,
        inflow: 0,
        outflow: 0,
      };
      current.count += 1;
      current.inflow += transaction.inflow;
      current.outflow += transaction.outflow;
      monthMap.set(month, current);
    });
  const months = [...monthMap.values()]
    .map((item) => ({
      ...item,
      inflow: roundMoney(item.inflow),
      outflow: roundMoney(item.outflow),
      net: roundMoney(item.inflow - item.outflow),
    }))
    .sort((left, right) => left.month.localeCompare(right.month));

  const signals = [];
  const duplicateGroups = new Map();
  transactions.forEach((transaction) => {
    const amount = transaction.outflow || transaction.inflow;
    const key = [
      transaction.date || transaction.dateRaw,
      normalizeDescription(transaction.description),
      transaction.direction,
      amount.toFixed(2),
    ].join("|");
    const group = duplicateGroups.get(key) || [];
    group.push(transaction);
    duplicateGroups.set(key, group);
  });
  duplicateGroups.forEach((group) => {
    if (group.length < 2) return;
    signals.push({
      id: `duplicate-${group[0].id}`,
      type: "possible-duplicate",
      level: "review",
      title: "Possible duplicate entries",
      detail: `${group.length} rows share the same date, normalized description, direction, and amount.`,
      transactionIds: group.map((transaction) => transaction.id),
      amount: group[0].outflow || group[0].inflow,
    });
  });

  const outflows = transactions
    .filter((transaction) => transaction.outflow > 0)
    .map((transaction) => transaction.outflow);
  if (outflows.length >= 5) {
    const baseline = median(outflows);
    const largeThreshold = Math.max(baseline * 4, totals.outflow / outflows.length * 3);
    transactions
      .filter((transaction) => transaction.outflow > largeThreshold)
      .forEach((transaction) => {
        signals.push({
          id: `large-${transaction.id}`,
          type: "unusually-large",
          level: "review",
          title: "Large outflow relative to this file",
          detail:
            "This outflow is above a deterministic threshold based on the other outflows in the imported rows.",
          transactionIds: [transaction.id],
          amount: transaction.outflow,
        });
      });
  }

  if (months.length >= 3) {
    const typicalMonth = median(months.map((month) => month.outflow));
    months
      .filter(
        (month) =>
          typicalMonth > 0 &&
          month.outflow > typicalMonth * 1.75 &&
          month.outflow > totals.outflow / months.length,
      )
      .forEach((month) => {
        signals.push({
          id: `month-${month.month}`,
          type: "monthly-spike",
          level: "review",
          title: "Higher-spend month",
          detail: `${month.month} has more than 1.75× the median monthly outflow in this import.`,
          transactionIds: [],
          amount: month.outflow,
        });
      });
  }

  return {
    transactionCount: transactions.length,
    totals,
    categories,
    months,
    signals,
    possibleDuplicateGroupCount: signals.filter(
      (signal) => signal.type === "possible-duplicate",
    ).length,
    unusualReviewCount: signals.filter(
      (signal) => signal.type !== "possible-duplicate",
    ).length,
  };
}

export function buildAggregateSummaryCsv(analysis, quality = {}) {
  const rows = [
    ["Section", "Metric", "Count or amount"],
    ["Overview", "Analysed transactions", analysis.transactionCount],
    ["Overview", "Total inflow", analysis.totals.inflow.toFixed(2)],
    ["Overview", "Total outflow", analysis.totals.outflow.toFixed(2)],
    ["Overview", "Net movement", analysis.totals.net.toFixed(2)],
    ["Review", "Possible duplicate groups", analysis.possibleDuplicateGroupCount],
    ["Review", "Other review signals", analysis.unusualReviewCount],
    ["Quality", "Skipped rows", quality.skippedCount || 0],
    ["Quality", "Rows with unreadable dates", quality.invalidDateCount || 0],
    ...analysis.categories.map((category) => [
      "Outflow category",
      category.category,
      category.outflow.toFixed(2),
    ]),
    ...analysis.months.map((month) => [
      "Monthly outflow",
      month.month,
      month.outflow.toFixed(2),
    ]),
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}

export function buildSignalCountsCsv(analysis) {
  const counts = analysis.signals.reduce((result, signal) => {
    result[signal.type] = (result[signal.type] || 0) + 1;
    return result;
  }, {});
  const rows = [
    ["Signal type", "Count", "Interpretation"],
    [
      "possible-duplicate",
      counts["possible-duplicate"] || 0,
      "Rows matched deterministic fields; verify against the original statement.",
    ],
    [
      "unusually-large",
      counts["unusually-large"] || 0,
      "Outflow exceeded this file's deterministic size threshold; not evidence of fraud.",
    ],
    [
      "monthly-spike",
      counts["monthly-spike"] || 0,
      "Monthly outflow exceeded 1.75 times this file's median; context may explain it.",
    ],
  ];
  return rows.map((row) => row.map(csvEscape).join(",")).join("\n");
}
