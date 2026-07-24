const VPA_PATTERN = /^[a-z0-9][a-z0-9._-]{1,255}@[a-z0-9][a-z0-9.-]{1,63}$/i;
const AMOUNT_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;
const HIDDEN_UNICODE_PATTERN = /[\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/u;
const KNOWN_ACTIONS = new Set(["pay", "collect", "request", "mandate"]);

const FIELD_DEFINITIONS = [
  {
    key: "action",
    label: "Payment action",
    value: (result) => result.action,
    normalize: (value) => String(value).trim().toLowerCase(),
    valid: (value) => KNOWN_ACTIONS.has(String(value).trim().toLowerCase()),
  },
  {
    key: "payeeVpa",
    parameterKey: "pa",
    label: "Payee VPA (pa)",
    value: (result) => result.fields.payeeVpa,
    normalize: (value) => String(value).trim().toLowerCase(),
    valid: (value) => VPA_PATTERN.test(String(value).trim()),
  },
  {
    key: "payeeName",
    parameterKey: "pn",
    label: "Payee name (pn)",
    value: (result) => result.fields.payeeName,
    normalize: (value) =>
      String(value).trim().replace(/\s+/g, " ").toLocaleLowerCase("en"),
  },
  {
    key: "merchantId",
    parameterKey: "mid",
    label: "Merchant / payee ID (mid)",
    value: (result) => result.fields.merchantId,
    normalize: (value) => String(value).trim(),
  },
  {
    key: "amount",
    parameterKey: "am",
    label: "Fixed amount (am)",
    value: (result) => result.fields.amountRaw,
    normalize: (value) => Number(value).toFixed(2),
    valid: (value) =>
      AMOUNT_PATTERN.test(String(value)) &&
      Number.isFinite(Number(value)) &&
      Number(value) > 0,
  },
  {
    key: "currency",
    parameterKey: "cu",
    label: "Currency (cu)",
    value: (result) => result.fields.currency,
    normalize: (value) => String(value).trim().toUpperCase(),
    valid: (value) => CURRENCY_PATTERN.test(String(value).trim().toUpperCase()),
  },
  {
    key: "reference",
    parameterKey: "tr",
    label: "Transaction reference (tr)",
    value: (result) => result.fields.transactionReference,
    normalize: (value) => String(value).trim(),
  },
  {
    key: "transactionId",
    parameterKey: "tid",
    label: "Transaction ID (tid)",
    value: (result) => result.fields.transactionId,
    normalize: (value) => String(value).trim(),
  },
];

function deriveAction(url) {
  return (url.hostname || url.pathname.replace(/^\/+/, "").split("/")[0])
    .trim()
    .toLowerCase();
}

function displayValue(key, raw) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return "Not supplied";
  }
  if (key === "amount") return String(raw);
  return String(raw);
}

export function parseUpiMerchantPayload(input) {
  const rawPayload = String(input ?? "").trim();
  if (!rawPayload) {
    return {
      ok: false,
      empty: true,
      error: "No UPI payload is available for this side.",
      rawPayload,
    };
  }

  let url;
  try {
    url = new URL(rawPayload);
  } catch {
    return {
      ok: false,
      empty: false,
      error: "This text is not a valid URI.",
      rawPayload,
    };
  }

  if (url.protocol.toLowerCase() !== "upi:") {
    return {
      ok: false,
      empty: false,
      error: "Only upi:// payloads are compared. Other links are never opened.",
      rawPayload,
    };
  }

  const action = deriveAction(url);
  const parameters = [...url.searchParams.entries()].map(([key, value]) => ({
    key,
    normalizedKey: key.toLowerCase(),
    value: value.trim(),
  }));
  const valuesByKey = new Map();
  parameters.forEach((parameter) => {
    const values = valuesByKey.get(parameter.normalizedKey) || [];
    values.push(parameter.value);
    valuesByKey.set(parameter.normalizedKey, values);
  });
  const first = (key) => valuesByKey.get(key)?.[0] || "";
  const duplicateKeys = [...valuesByKey.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key]) => key);
  const amountRaw = first("am");
  const amountValid =
    AMOUNT_PATTERN.test(amountRaw) &&
    Number.isFinite(Number(amountRaw)) &&
    Number(amountRaw) > 0;
  const payeeVpa = first("pa");
  const currency = first("cu").toUpperCase();
  const warnings = [];

  if (!KNOWN_ACTIONS.has(action)) {
    warnings.push({
      code: "unknown-action",
      label: "The UPI action is missing or not recognized.",
    });
  }
  if (!payeeVpa || !VPA_PATTERN.test(payeeVpa)) {
    warnings.push({
      code: "invalid-vpa",
      label: "The payee VPA is missing or does not match a typical name@provider form.",
    });
  }
  if (amountRaw && !amountValid) {
    warnings.push({
      code: "invalid-amount",
      label: "The fixed amount is not a positive value with at most two decimal places.",
    });
  }
  if (currency && !CURRENCY_PATTERN.test(currency)) {
    warnings.push({
      code: "invalid-currency",
      label: "The currency is not a three-letter code.",
    });
  }
  if (duplicateKeys.length) {
    warnings.push({
      code: "duplicate-keys",
      label: `Duplicate parameter keys are present: ${duplicateKeys.join(", ")}.`,
    });
  }
  if (
    HIDDEN_UNICODE_PATTERN.test(rawPayload) ||
    parameters.some((parameter) => HIDDEN_UNICODE_PATTERN.test(parameter.value))
  ) {
    warnings.push({
      code: "hidden-unicode",
      label: "Invisible or bidirectional Unicode controls are present.",
    });
  }

  return {
    ok: true,
    empty: false,
    rawPayload,
    action,
    fields: {
      payeeVpa,
      payeeName: first("pn"),
      merchantId: first("mid"),
      amountRaw,
      amount: amountValid ? Number(amountRaw) : null,
      amountState: !amountRaw ? "missing" : amountValid ? "valid" : "invalid",
      currency,
      transactionReference: first("tr"),
      transactionId: first("tid"),
    },
    duplicateKeys,
    warnings,
  };
}

function compareField(definition, trusted, current) {
  const trustedRaw = definition.value(trusted);
  const currentRaw = definition.value(current);
  const hasDuplicate =
    definition.parameterKey &&
    (trusted.duplicateKeys.includes(definition.parameterKey) ||
      current.duplicateKeys.includes(definition.parameterKey));
  if (hasDuplicate || HIDDEN_UNICODE_PATTERN.test(String(trustedRaw ?? "")) ||
    HIDDEN_UNICODE_PATTERN.test(String(currentRaw ?? ""))) {
    return {
      key: definition.key,
      label: definition.label,
      state: "not-checkable",
      trustedDisplay: displayValue(definition.key, trustedRaw),
      currentDisplay: displayValue(definition.key, currentRaw),
      detail: hasDuplicate
        ? "A duplicate parameter makes this field ambiguous."
        : "Invisible text controls make this field unsafe to compare visually.",
    };
  }
  const trustedMissing =
    trustedRaw === undefined || trustedRaw === null || String(trustedRaw).trim() === "";
  const currentMissing =
    currentRaw === undefined || currentRaw === null || String(currentRaw).trim() === "";

  if (trustedMissing && currentMissing) {
    return {
      key: definition.key,
      label: definition.label,
      state: "not-checkable",
      trustedDisplay: "Not supplied",
      currentDisplay: "Not supplied",
      detail: "Neither payload supplies this optional field.",
    };
  }

  if (trustedMissing !== currentMissing) {
    return {
      key: definition.key,
      label: definition.label,
      state: "mismatch",
      trustedDisplay: displayValue(definition.key, trustedRaw),
      currentDisplay: displayValue(definition.key, currentRaw),
      detail: "This field is present on only one side.",
    };
  }

  const trustedValid = definition.valid ? definition.valid(trustedRaw) : true;
  const currentValid = definition.valid ? definition.valid(currentRaw) : true;
  if (!trustedValid && !currentValid) {
    return {
      key: definition.key,
      label: definition.label,
      state: "not-checkable",
      trustedDisplay: displayValue(definition.key, trustedRaw),
      currentDisplay: displayValue(definition.key, currentRaw),
      detail: "Both values are present but invalid for deterministic comparison.",
    };
  }
  if (trustedValid !== currentValid) {
    return {
      key: definition.key,
      label: definition.label,
      state: "mismatch",
      trustedDisplay: displayValue(definition.key, trustedRaw),
      currentDisplay: displayValue(definition.key, currentRaw),
      detail: "One value is invalid for this field.",
    };
  }

  const trustedNormalized = definition.normalize(trustedRaw);
  const currentNormalized = definition.normalize(currentRaw);
  const state = trustedNormalized === currentNormalized ? "match" : "mismatch";
  return {
    key: definition.key,
    label: definition.label,
    state,
    trustedDisplay: displayValue(definition.key, trustedRaw),
    currentDisplay: displayValue(definition.key, currentRaw),
    detail:
      state === "match"
        ? "Values match under the documented normalization."
        : "Values differ under the documented normalization.",
  };
}

export function compareMerchantPayloads(trustedResult, currentResult) {
  if (!trustedResult?.ok || !currentResult?.ok) {
    return {
      state: "not-checkable",
      rows: [],
      matchCount: 0,
      mismatchCount: 0,
      notCheckableCount: FIELD_DEFINITIONS.length,
      reason:
        "Both sides need one readable UPI payload before field comparison is possible.",
    };
  }

  const rows = FIELD_DEFINITIONS.map((definition) =>
    compareField(definition, trustedResult, currentResult),
  );
  const matchCount = rows.filter((row) => row.state === "match").length;
  const mismatchCount = rows.filter((row) => row.state === "mismatch").length;
  const notCheckableCount = rows.filter((row) => row.state === "not-checkable").length;
  const state =
    mismatchCount > 0 ? "mismatch" : matchCount > 0 ? "match" : "not-checkable";

  return {
    state,
    rows,
    matchCount,
    mismatchCount,
    notCheckableCount,
    reason:
      state === "mismatch"
        ? "At least one selected field differs."
        : state === "match"
          ? "No difference was found in the comparable selected fields."
          : "No selected field had two valid values to compare.",
  };
}

export function buildCountsOnlyComparisonReport(
  comparison,
  trustedResult,
  currentResult,
  sourceStates = {},
) {
  const rows = [
    ["Metric", "Value"],
    ["Comparison state", comparison.state],
    ["Matching fields", comparison.matchCount],
    ["Mismatching fields", comparison.mismatchCount],
    ["Not-checkable fields", comparison.notCheckableCount],
    ["Trusted payload readable", trustedResult?.ok ? "yes" : "no"],
    ["Current payload readable", currentResult?.ok ? "yes" : "no"],
    ["Trusted payload warnings", trustedResult?.warnings?.length || 0],
    ["Current payload warnings", currentResult?.warnings?.length || 0],
    ["Trusted image decode state", sourceStates.trusted || "not-used"],
    ["Current image decode state", sourceStates.current || "not-used"],
  ];
  return rows
    .map((row) =>
      row
        .map((value) => {
          const text = String(value ?? "");
          return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        })
        .join(","),
    )
    .join("\n");
}
