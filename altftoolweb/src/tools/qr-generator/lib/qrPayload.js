function text(value) {
  return String(value ?? "");
}

/** Escape the separators defined by the common WiFi QR payload format. */
export function escapeWifiValue(value = "") {
  return text(value).replace(/[\\;,:\"]/g, (character) => `\\${character}`);
}

/** Escape text-valued vCard 3.0 fields without allowing extra injected rows. */
export function escapeVCardValue(value = "") {
  return text(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

/**
 * Build the exact payload rendered by the QR canvas.
 * Returning an explicit error keeps blank forms from silently encoding an
 * unrelated fallback URL and prevents empty UPI payment requests.
 */
export function buildQrPayload({ activeTab, url, wifi, vCard, upi, bulkValue } = {}) {
  if (activeTab === "WIFI") {
    const ssid = text(wifi?.ssid);
    if (!ssid.trim()) return { value: "", error: "Enter a WiFi network name (SSID)." };
    const encryption = ["WPA", "WEP", "nopass"].includes(wifi?.enc) ? wifi.enc : "WPA";
    return {
      value: `WIFI:S:${escapeWifiValue(ssid)};T:${encryption};P:${escapeWifiValue(wifi?.pass)};;`,
      error: "",
    };
  }

  if (activeTab === "vCARD") {
    const firstName = text(vCard?.fn).trim();
    const lastName = text(vCard?.ln).trim();
    const telephone = text(vCard?.tel).trim();
    const email = text(vCard?.email).trim();
    const fullName = [firstName, lastName].filter(Boolean).join(" ");
    if (!fullName && !telephone && !email) {
      return { value: "", error: "Enter a name, phone number, or email for the contact." };
    }
    const rows = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${escapeVCardValue(lastName)};${escapeVCardValue(firstName)};;;`,
      `FN:${escapeVCardValue(fullName || telephone || email)}`,
    ];
    if (telephone) rows.push(`TEL:${escapeVCardValue(telephone)}`);
    if (email) rows.push(`EMAIL:${escapeVCardValue(email)}`);
    rows.push("END:VCARD");
    return { value: rows.join("\r\n"), error: "" };
  }

  if (activeTab === "UPI") {
    const vpa = text(upi?.vpa).trim();
    const name = text(upi?.name).trim();
    const amount = text(upi?.am).trim();
    if (!vpa) return { value: "", error: "Enter the payee UPI ID before generating a payment QR." };
    const query = [`pa=${encodeURIComponent(vpa)}`];
    if (name) query.push(`pn=${encodeURIComponent(name)}`);
    // Do not emit am= with an empty value: amount is intentionally entered by
    // the payer, and some UPI clients reject an empty amount parameter.
    if (amount) query.push(`am=${encodeURIComponent(amount)}`);
    query.push("cu=INR");
    return { value: `upi://pay?${query.join("&")}`, error: "" };
  }

  if (activeTab === "BULK") {
    const value = text(bulkValue).trim();
    return value
      ? { value, error: "" }
      : { value: "", error: "Upload a .csv or .txt file with one QR value per line." };
  }

  const value = text(url).trim();
  return value
    ? { value, error: "" }
    : { value: "", error: "Enter a website URL or text value to encode." };
}
