const KNOWN_PARAMETERS = {
  pa: "Payee UPI ID",
  pn: "Payee name",
  am: "Amount",
  mam: "Minimum amount",
  cu: "Currency",
  tn: "Transaction note",
  tr: "Transaction reference",
  tid: "Transaction ID",
  mc: "Merchant category code",
  mid: "Merchant ID",
  msid: "Merchant store ID",
  mtid: "Merchant terminal ID",
  mode: "Initiation mode",
  orgid: "Originating organization ID",
  purpose: "Purpose code",
  url: "Reference URL",
  sign: "Payload signature",
};

const VPA_PATTERN = /^[a-z0-9][a-z0-9._-]{1,255}@[a-z0-9][a-z0-9.-]{1,63}$/i;
const AMOUNT_PATTERN = /^\d+(?:\.\d{1,2})?$/;
const HIDDEN_UNICODE_PATTERN = /[\u200b-\u200f\u202a-\u202e\u2060\u2066-\u2069\ufeff]/u;

function message(code, tone, title, detail) {
  return { code, tone, title, detail };
}

function deriveAction(url) {
  const candidate = url.hostname || url.pathname.replace(/^\/+/, "").split("/")[0];
  return candidate.trim().toLowerCase();
}

function actionDetails(action) {
  if (action === "collect" || action === "request") {
    return {
      kind: "collect",
      label: "Collect request",
      tone: "danger",
      explanation:
        "Approving this request can debit money from your account. Receiving money never requires a UPI PIN.",
    };
  }

  if (action === "pay") {
    return {
      kind: "pay",
      label: "Pay intent",
      tone: "warning",
      explanation:
        "Approving this intent sends money to the displayed payee. Confirm the payee and amount inside your trusted UPI app.",
    };
  }

  if (action === "mandate") {
    return {
      kind: "mandate",
      label: "Mandate / autopay intent",
      tone: "danger",
      explanation:
        "Approving a mandate may authorize future or recurring debits. Review amount, frequency and end date in your trusted UPI app.",
    };
  }

  return {
    kind: "unknown",
    label: action ? `Unknown action: ${action}` : "Missing UPI action",
    tone: "danger",
    explanation:
      "This action is not recognized by the decoder. Do not continue unless your trusted bank or UPI app explains it clearly.",
  };
}

function parseAmount(rawAmount) {
  if (!rawAmount) return { state: "missing", value: null };
  if (!AMOUNT_PATTERN.test(rawAmount)) return { state: "invalid", value: null };

  const value = Number(rawAmount);
  if (!Number.isFinite(value) || value <= 0) return { state: "invalid", value: null };

  return { state: "valid", value };
}

export function decodeUpiPayload(input) {
  const rawPayload = String(input ?? "").trim();

  if (!rawPayload) {
    return {
      ok: false,
      empty: true,
      error: "Paste a UPI URI or the text decoded from a UPI QR code.",
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
      error: "This text is not a valid URI. A UPI payload usually starts with upi://.",
      rawPayload,
    };
  }

  if (url.protocol.toLowerCase() !== "upi:") {
    return {
      ok: false,
      empty: false,
      error: `Unsupported scheme “${url.protocol.replace(":", "") || "unknown"}”. Only upi:// payloads are decoded.`,
      rawPayload,
    };
  }

  const action = deriveAction(url);
  const actionInfo = actionDetails(action);
  const entries = [...url.searchParams.entries()].map(([key, value]) => ({
    key,
    normalizedKey: key.toLowerCase(),
    value,
  }));
  const valuesByKey = new Map();

  for (const entry of entries) {
    const values = valuesByKey.get(entry.normalizedKey) || [];
    values.push(entry.value);
    valuesByKey.set(entry.normalizedKey, values);
  }

  const first = (key) => (valuesByKey.get(key)?.[0] || "").trim();
  const payeeVpa = first("pa");
  const payeeName = first("pn");
  const amountRaw = first("am");
  const minimumAmountRaw = first("mam");
  const currency = first("cu").toUpperCase();
  const amount = parseAmount(amountRaw);
  const minimumAmount = parseAmount(minimumAmountRaw);
  const duplicateKeys = [...valuesByKey.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key]) => key);
  const unknownParameters = entries.filter(
    ({ normalizedKey }) => !KNOWN_PARAMETERS[normalizedKey],
  );
  const warnings = [
    message("action", actionInfo.tone, actionInfo.label, actionInfo.explanation),
  ];

  if (!payeeVpa) {
    warnings.push(
      message(
        "missing-payee",
        "danger",
        "Payee UPI ID is missing",
        "Do not approve a payment until your trusted UPI app shows the intended recipient.",
      ),
    );
  } else if (!VPA_PATTERN.test(payeeVpa)) {
    warnings.push(
      message(
        "invalid-payee",
        "danger",
        "Payee UPI ID looks unusual",
        "The pa value does not match a typical name@provider UPI ID. Verify it independently.",
      ),
    );
  }

  if (!amountRaw) {
    warnings.push(
      message(
        "missing-amount",
        "warning",
        "Amount is not fixed",
        "The amount may be entered later inside the UPI app. Check it carefully before approving.",
      ),
    );
  } else if (amount.state === "invalid") {
    warnings.push(
      message(
        "invalid-amount",
        "danger",
        "Amount is invalid",
        "The am value is not a positive number with at most two decimal places.",
      ),
    );
  }

  if (minimumAmountRaw && minimumAmount.state === "invalid") {
    warnings.push(
      message(
        "invalid-minimum",
        "warning",
        "Minimum amount is invalid",
        "The mam value is not a valid positive amount.",
      ),
    );
  }

  if (
    amount.state === "valid" &&
    minimumAmount.state === "valid" &&
    minimumAmount.value > amount.value
  ) {
    warnings.push(
      message(
        "amount-conflict",
        "danger",
        "Amount fields conflict",
        "The minimum amount is greater than the stated amount. Treat the payload as inconsistent.",
      ),
    );
  }

  if (!currency) {
    warnings.push(
      message(
        "missing-currency",
        "warning",
        "Currency is not supplied",
        "Confirm the currency and debit amount in your trusted UPI app.",
      ),
    );
  } else if (currency !== "INR") {
    warnings.push(
      message(
        "currency",
        "warning",
        `Unexpected currency: ${currency}`,
        "UPI payment payloads normally use INR. Confirm the currency in your trusted UPI app.",
      ),
    );
  }

  if (duplicateKeys.length) {
    warnings.push(
      message(
        "duplicate-parameters",
        "danger",
        "Duplicate fields detected",
        `Multiple values were supplied for: ${duplicateKeys.join(", ")}. Different apps may interpret duplicates differently.`,
      ),
    );
  }

  if (HIDDEN_UNICODE_PATTERN.test(rawPayload)) {
    warnings.push(
      message(
        "hidden-unicode",
        "danger",
        "Hidden text controls detected",
        "The payload contains invisible or bidirectional Unicode controls that can make text misleading.",
      ),
    );
  }

  if (!payeeName) {
    warnings.push(
      message(
        "missing-name",
        "info",
        "Payee name is not supplied",
        "The final recipient name must be checked inside your trusted UPI app.",
      ),
    );
  }

  if (first("sign")) {
    warnings.push(
      message(
        "signature",
        "info",
        "Signature field is present",
        "This decoder only displays the field; it does not cryptographically verify the signer.",
      ),
    );
  }

  if (unknownParameters.length) {
    warnings.push(
      message(
        "unknown-parameters",
        "info",
        "Additional fields are present",
        "Unknown fields are shown below for transparency but are not interpreted.",
      ),
    );
  }

  return {
    ok: true,
    empty: false,
    rawPayload,
    action,
    actionInfo,
    fields: {
      payeeVpa,
      payeeName,
      amountRaw,
      amount: amount.value,
      amountState: amount.state,
      minimumAmountRaw,
      minimumAmount: minimumAmount.value,
      currency,
      note: first("tn"),
      transactionReference: first("tr"),
      transactionId: first("tid"),
      merchantCategory: first("mc"),
      merchantId: first("mid"),
      mode: first("mode"),
      purpose: first("purpose"),
      originatingOrganization: first("orgid"),
      referenceUrl: first("url"),
      hasSignature: Boolean(first("sign")),
    },
    parameters: entries.map(({ key, normalizedKey, value }) => ({
      key,
      value,
      label: KNOWN_PARAMETERS[normalizedKey] || "Unrecognized field",
      known: Boolean(KNOWN_PARAMETERS[normalizedKey]),
    })),
    duplicateKeys,
    unknownParameters,
    warnings,
  };
}

export function buildUpiDecodeReport(result) {
  if (!result?.ok) return result?.error || "No UPI payload decoded.";

  const { fields, actionInfo } = result;
  return [
    "UPI Collect Request Decoder",
    `Action: ${actionInfo.label}`,
    `Payee name: ${fields.payeeName || "Not supplied"}`,
    `Payee UPI ID: ${fields.payeeVpa || "Not supplied"}`,
    `Amount: ${
      fields.amountRaw
        ? `${fields.currency || "Currency not supplied"} ${fields.amountRaw}`
        : "Not fixed"
    }`,
    `Transaction reference: ${fields.transactionReference || "Not supplied"}`,
    `Note: ${fields.note || "Not supplied"}`,
    "",
    "Safety notes:",
    ...result.warnings.map((warning) => `- ${warning.title}: ${warning.detail}`),
    "",
    "This is a local format explanation, not payee verification. Never enter a UPI PIN to receive money.",
  ].join("\n");
}
