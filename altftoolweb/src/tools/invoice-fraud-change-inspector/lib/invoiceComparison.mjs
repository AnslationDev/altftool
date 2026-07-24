const DEFAULT_LIMITS = Object.freeze({
  maxDepth: 10,
  maxEntries: 5_000,
  maxLineItems: 20,
  maxSourceCharacters: 250_000,
});

export const INVOICE_FIELDS = Object.freeze([
  {
    key: "invoiceNumber",
    label: "Invoice number",
    group: "identity",
    aliases: ["invoice number", "invoice no", "invoice id", "invoice reference"],
  },
  {
    key: "invoiceDate",
    label: "Invoice date",
    group: "identity",
    aliases: ["invoice date", "issue date", "issued date"],
  },
  {
    key: "vendor",
    label: "Vendor or supplier",
    group: "identity",
    aliases: ["vendor", "vendor name", "supplier", "supplier name", "seller"],
  },
  {
    key: "taxId",
    label: "Tax ID / GSTIN / VAT",
    group: "identity",
    aliases: ["tax id", "tax number", "gstin", "gst number", "vat id", "vat number", "tin"],
  },
  {
    key: "bankAccount",
    label: "Bank account",
    group: "payment-routing",
    aliases: [
      "bank account",
      "bank account number",
      "account number",
      "account no",
      "beneficiary account",
    ],
  },
  {
    key: "iban",
    label: "IBAN",
    group: "payment-routing",
    aliases: ["iban"],
  },
  {
    key: "upiId",
    label: "UPI ID / VPA",
    group: "payment-routing",
    aliases: ["upi", "upi id", "upi vpa", "vpa"],
  },
  {
    key: "currency",
    label: "Currency",
    group: "amounts",
    aliases: ["currency", "currency code"],
  },
  {
    key: "subtotal",
    label: "Subtotal",
    group: "amounts",
    aliases: ["subtotal", "sub total", "net amount"],
  },
  {
    key: "taxAmount",
    label: "Tax amount",
    group: "amounts",
    aliases: ["tax amount", "gst amount", "vat amount", "tax total", "total tax"],
  },
  {
    key: "total",
    label: "Invoice total",
    group: "amounts",
    aliases: ["grand total", "invoice total", "total amount", "amount due", "total"],
  },
  {
    key: "lineItemCount",
    label: "Line-item count",
    group: "line-items",
    aliases: ["line item count", "item count"],
  },
  {
    key: "lineSummary",
    label: "Line summary",
    group: "line-items",
    aliases: ["line summary", "item summary", "description summary"],
  },
]);

const AMOUNT_FIELDS = new Set(["subtotal", "taxAmount", "total"]);
const TEXT_PATTERNS = {
  invoiceNumber: [
    /(?:invoice\s*(?:number|no\.?|#)|invoice\s*id|invoice\s*reference)\s*[:#-]\s*(.+)$/i,
  ],
  invoiceDate: [/(?:invoice\s*date|issue\s*date|issued\s*date)\s*[:#-]\s*(.+)$/i],
  vendor: [
    /(?:vendor|vendor\s*name|supplier|supplier\s*name|seller|billed\s*by)\s*[:#-]\s*(.+)$/i,
  ],
  taxId: [
    /(?:tax\s*(?:id|number)|gstin|gst\s*number|vat\s*(?:id|number)|tin)\s*[:#-]\s*(.+)$/i,
  ],
  bankAccount: [
    /(?:bank\s*account(?:\s*number)?|account\s*(?:number|no\.?)|beneficiary\s*account)\s*[:#-]\s*(.+)$/i,
  ],
  iban: [/\biban\s*[:#-]?\s*([a-z]{2}\d{2}[a-z0-9 ]{10,34})\b/i],
  upiId: [
    /\b(?:upi(?:\s*id|\s*vpa)?|vpa)\s*[:#-]?\s*([a-z0-9._-]{2,}@[a-z0-9.-]{2,})\b/i,
  ],
  currency: [/(?:currency|currency\s*code)\s*[:#-]\s*([a-z]{3})\b/i],
  subtotal: [/(?:subtotal|sub\s*total|net\s*amount)\s*[:#-]?\s*(.+)$/i],
  taxAmount: [
    /(?:tax\s*amount|gst\s*amount|vat\s*amount|tax\s*total|total\s*tax)\s*[:#-]?\s*(.+)$/i,
  ],
  total: [
    /(?:grand\s*total|invoice\s*total|total\s*amount|amount\s*due)\s*[:#-]?\s*(.+)$/i,
  ],
};

function isObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeKey(value) {
  return String(value ?? "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanExtractedValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

export function createEmptyInvoiceFields() {
  return Object.fromEntries(INVOICE_FIELDS.map((field) => [field.key, ""]));
}

function aliasMap() {
  return new Map(
    INVOICE_FIELDS.flatMap((field) =>
      field.aliases.map((alias) => [normalizeKey(alias), field.key]),
    ),
  );
}

function summarizeLineItems(items, maxLineItems) {
  if (!Array.isArray(items)) return { count: "", summary: "", truncated: false };
  const summaries = [];
  items.slice(0, maxLineItems).forEach((item) => {
    if (typeof item === "string" || typeof item === "number") {
      const value = cleanExtractedValue(item);
      if (value) summaries.push(value);
      return;
    }
    if (!isObject(item)) return;

    const descriptionKey = Object.keys(item).find((key) =>
      ["description", "item", "item name", "name", "product", "service"].includes(
        normalizeKey(key),
      ),
    );
    const quantityKey = Object.keys(item).find((key) =>
      ["qty", "quantity"].includes(normalizeKey(key)),
    );
    const amountKey = Object.keys(item).find((key) =>
      ["amount", "line amount", "line total", "price", "total"].includes(
        normalizeKey(key),
      ),
    );
    const parts = [
      cleanExtractedValue(item[descriptionKey]),
      quantityKey ? `qty ${cleanExtractedValue(item[quantityKey])}` : "",
      amountKey ? `amount ${cleanExtractedValue(item[amountKey])}` : "",
    ].filter(Boolean);
    if (parts.length) summaries.push(parts.join(" · "));
  });

  return {
    count: String(items.length),
    summary: summaries.join("\n").slice(0, 4_000),
    truncated: items.length > maxLineItems,
  };
}

function extractFromJson(parsed, limits) {
  const fields = createEmptyInvoiceFields();
  const aliases = aliasMap();
  const lineItemAliases = new Set([
    "invoice items",
    "items",
    "line items",
    "lines",
    "products",
    "services",
  ]);
  const warnings = [];
  let entryCount = 0;
  let stopped = false;

  function stop(reason) {
    if (!stopped) warnings.push(reason);
    stopped = true;
  }

  function walk(value, depth) {
    if (stopped || value === null || value === undefined) return;
    if (depth > limits.maxDepth) {
      stop(`JSON extraction stopped at the safe depth limit of ${limits.maxDepth}.`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => walk(entry, depth + 1));
      return;
    }
    if (!isObject(value)) return;

    Object.entries(value).forEach(([key, nested]) => {
      if (stopped) return;
      entryCount += 1;
      if (entryCount > limits.maxEntries) {
        stop(
          `JSON extraction stopped at the safe field limit of ${limits.maxEntries.toLocaleString("en-US")}.`,
        );
        return;
      }

      const normalized = normalizeKey(key);
      const fieldKey = aliases.get(normalized);
      if (fieldKey && !fields[fieldKey]) {
        fields[fieldKey] = cleanExtractedValue(nested);
      }

      if (lineItemAliases.has(normalized) && Array.isArray(nested)) {
        const lineItems = summarizeLineItems(nested, limits.maxLineItems);
        if (!fields.lineItemCount) fields.lineItemCount = lineItems.count;
        if (!fields.lineSummary) fields.lineSummary = lineItems.summary;
        if (lineItems.truncated) {
          warnings.push(
            `Only the first ${limits.maxLineItems} line items were included in the editable summary.`,
          );
        }
      }

      if (Array.isArray(nested) || isObject(nested)) walk(nested, depth + 1);
    });
  }

  walk(parsed, 0);
  return { fields, warnings };
}

function firstTextMatch(lines, patterns) {
  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);
      const value = cleanExtractedValue(match?.[1]);
      if (value) return value;
    }
  }
  return "";
}

function extractTextLineSummary(lines, maxLineItems) {
  const headerIndex = lines.findIndex((line) => {
    const normalized = normalizeKey(line);
    return (
      normalized.includes("description") &&
      ["amount", "price", "qty", "quantity", "total"].some((term) =>
        normalized.includes(term),
      )
    );
  });

  if (headerIndex < 0) return { count: "", summary: "", truncated: false };
  const candidates = [];
  for (let index = headerIndex + 1; index < lines.length; index += 1) {
    const line = cleanExtractedValue(lines[index]);
    if (!line) continue;
    const normalized = normalizeKey(line);
    if (
      /^(subtotal|sub total|tax amount|gst amount|vat amount|grand total|invoice total|total amount|amount due)\b/.test(
        normalized,
      )
    ) {
      break;
    }
    candidates.push(line);
    if (candidates.length > maxLineItems) break;
  }

  return {
    count: candidates.length ? String(Math.min(candidates.length, maxLineItems)) : "",
    summary: candidates.slice(0, maxLineItems).join("\n").slice(0, 4_000),
    truncated: candidates.length > maxLineItems,
  };
}

function extractFromText(source, limits) {
  const fields = createEmptyInvoiceFields();
  const lines = String(source)
    .split(/\r\n|\n|\r/)
    .map((line) => line.trim())
    .filter(Boolean);

  Object.entries(TEXT_PATTERNS).forEach(([key, patterns]) => {
    fields[key] = firstTextMatch(lines, patterns);
  });

  if (!fields.currency) {
    const code = source.match(/\b(INR|USD|EUR|GBP|AED|CAD|AUD|SGD|JPY|CNY)\b/i)?.[1];
    if (code) fields.currency = code.toUpperCase();
    else if (source.includes("₹")) fields.currency = "INR";
    else if (source.includes("€")) fields.currency = "EUR";
    else if (source.includes("£")) fields.currency = "GBP";
  }

  const lineItems = extractTextLineSummary(lines, limits.maxLineItems);
  fields.lineItemCount = lineItems.count;
  fields.lineSummary = lineItems.summary;

  return {
    fields,
    warnings: lineItems.truncated
      ? [
          `Only the first ${limits.maxLineItems} detected text lines were included in the editable line summary.`,
        ]
      : [],
  };
}

export function extractInvoiceFields(source, options = {}) {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const text = String(source ?? "");
  if (!text.trim()) {
    return {
      fields: createEmptyInvoiceFields(),
      format: "empty",
      warnings: ["Paste invoice text or JSON before extracting fields."],
    };
  }
  if (text.length > limits.maxSourceCharacters) {
    return {
      fields: createEmptyInvoiceFields(),
      format: "too-large",
      warnings: [
        `Input exceeds the safe extraction limit of ${limits.maxSourceCharacters.toLocaleString("en-US")} characters.`,
      ],
    };
  }

  const trimmed = text.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const extracted = extractFromJson(JSON.parse(trimmed), limits);
      return { ...extracted, format: "json" };
    } catch {
      const extracted = extractFromText(text, limits);
      return {
        ...extracted,
        format: "text",
        warnings: [
          "Input looked like JSON but could not be parsed; label-based text extraction was used instead.",
          ...extracted.warnings,
        ],
      };
    }
  }

  return { ...extractFromText(text, limits), format: "text" };
}

function hasValue(value) {
  return String(value ?? "").trim().length > 0;
}

function normalizeTextValue(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function normalizeCompactValue(value) {
  return normalizeTextValue(value).replace(/[^a-z0-9]/g, "");
}

function parseMoney(value) {
  const match = String(value ?? "").match(/[-+]?\d[\d ,.]*\d|[-+]?\d/);
  if (!match) return null;
  let candidate = match[0].replace(/\s+/g, "");

  if (candidate.includes(".") && candidate.includes(",")) {
    candidate = candidate.replace(/,/g, "");
  } else if (candidate.includes(",")) {
    const commaCount = (candidate.match(/,/g) || []).length;
    const decimalComma = commaCount === 1 && /,\d{1,2}$/.test(candidate);
    candidate = decimalComma
      ? candidate.replace(",", ".")
      : candidate.replace(/,/g, "");
  }

  const number = Number(candidate);
  return Number.isFinite(number) ? number : null;
}

function valuesEqual(fieldKey, baseline, current) {
  if (AMOUNT_FIELDS.has(fieldKey)) {
    const baselineNumber = parseMoney(baseline);
    const currentNumber = parseMoney(current);
    if (baselineNumber !== null && currentNumber !== null) {
      return Math.abs(baselineNumber - currentNumber) < 0.000001;
    }
  }

  if (["bankAccount", "iban", "taxId", "upiId"].includes(fieldKey)) {
    return normalizeCompactValue(baseline) === normalizeCompactValue(current);
  }
  return normalizeTextValue(baseline) === normalizeTextValue(current);
}

export function compareInvoiceFields(
  baselineFields,
  currentFields,
  reviewStatus = { baseline: false, current: false },
) {
  const comparisons = INVOICE_FIELDS.map((field) => {
    const baseline = String(baselineFields?.[field.key] ?? "");
    const current = String(currentFields?.[field.key] ?? "");
    const baselinePresent = hasValue(baseline);
    const currentPresent = hasValue(current);
    let state = "unavailable";

    if (baselinePresent && currentPresent) {
      state = valuesEqual(field.key, baseline, current) ? "unchanged" : "changed";
    } else if (baselinePresent) {
      state = "removed";
    } else if (currentPresent) {
      state = "added";
    }

    const observableChange = ["added", "changed", "removed"].includes(state);
    return {
      attention:
        observableChange && field.group === "payment-routing"
          ? "payment-routing"
          : observableChange
            ? "review"
            : "none",
      group: field.group,
      key: field.key,
      label: field.label,
      state,
    };
  });

  const stateCount = (state) =>
    comparisons.filter((comparison) => comparison.state === state).length;

  return {
    comparisons,
    reviewStatus: {
      baseline: Boolean(reviewStatus.baseline),
      current: Boolean(reviewStatus.current),
    },
    summary: {
      added: stateCount("added"),
      changed: stateCount("changed"),
      comparedFields: comparisons.length,
      paymentRoutingChanges: comparisons.filter(
        (comparison) => comparison.attention === "payment-routing",
      ).length,
      removed: stateCount("removed"),
      unchanged: stateCount("unchanged"),
      unavailable: stateCount("unavailable"),
    },
  };
}

export function buildCountsOnlyChangeReport(
  comparison,
  generatedAt = new Date().toISOString(),
) {
  const groups = ["identity", "payment-routing", "amounts", "line-items"];
  const states = ["added", "changed", "removed", "unchanged", "unavailable"];
  const countsByGroup = Object.fromEntries(
    groups.map((group) => [
      group,
      Object.fromEntries(
        states.map((state) => [
          state,
          comparison.comparisons.filter(
            (entry) => entry.group === group && entry.state === state,
          ).length,
        ]),
      ),
    ]),
  );

  return JSON.stringify(
    {
      reportType: "ALTFTool invoice observable-change counts",
      generatedAt,
      interpretation:
        "This report records observable field-count differences only. A change is not proof of fraud, intent, identity or payment legitimacy.",
      reviewStatus: comparison.reviewStatus,
      summary: comparison.summary,
      countsByGroup,
      privacyNotice:
        "Raw invoice text, invoice values, account details, tax identifiers, UPI IDs, line descriptions and filenames are excluded.",
      limitations: [
        "Label and key extraction is heuristic and should be manually confirmed against the original invoices.",
        "Text extraction cannot verify document authenticity, signatures, senders, metadata, logos or visual tampering.",
        "Scanned or image-only PDFs require OCR outside this tool; OCR text can contain recognition errors.",
        "Currency symbols, date formats, locale-specific numbers and line layouts can be ambiguous.",
        "Verify payment-detail changes through a known independent contact channel before acting.",
      ],
    },
    null,
    2,
  );
}
