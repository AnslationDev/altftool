const FRANKFURTER_V1_BASE_URL = "https://api.frankfurter.dev/v1";
const ENDPOINT_PATTERN = /^(?:latest|\d{4}-\d{2}-\d{2}(?:\.\.\d{4}-\d{2}-\d{2})?)$/;
const CURRENCY_PATTERN = /^[A-Z]{3}$/;

export function buildFrankfurterV1Url(endpoint, { base, quote }) {
  const normalizedEndpoint = String(endpoint || "");
  const normalizedBase = String(base || "").toUpperCase();
  const normalizedQuote = String(quote || "").toUpperCase();

  if (!ENDPOINT_PATTERN.test(normalizedEndpoint)) {
    throw new TypeError("Invalid Frankfurter endpoint.");
  }
  if (!CURRENCY_PATTERN.test(normalizedBase) || !CURRENCY_PATTERN.test(normalizedQuote)) {
    throw new TypeError("Invalid currency code.");
  }

  const url = new URL(`${FRANKFURTER_V1_BASE_URL}/${normalizedEndpoint}`);
  url.searchParams.set("base", normalizedBase);
  url.searchParams.set("symbols", normalizedQuote);
  return url;
}
