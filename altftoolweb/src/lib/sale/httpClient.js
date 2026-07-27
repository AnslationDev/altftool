import { fromHttpStatus, toSaleApiError } from "./errors.js";

/**
 * Fetch JSON with a timeout, retry-with-backoff, and typed error handling.
 * Built for upstream shopping/location APIs (SerpAPI, RapidAPI, Google Maps).
 *
 * @param {string|URL} url
 * @param {{
 *   method?: string,
 *   headers?: Record<string,string>,
 *   body?: unknown,
 *   timeoutMs?: number,
 *   retries?: number,
 *   retryDelayMs?: number,
 *   provider?: string,
 * }} [options]
 * @returns {Promise<any>} parsed JSON body
 */
export async function fetchWithRetry(url, options = {}) {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 12000,
    retries = 2,
    retryDelayMs = 400,
    provider = "",
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error("Request timed out.")), timeoutMs);

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        const error = fromHttpStatus(res.status, provider, text?.slice(0, 300));

        // Retry on rate-limit / transient server errors only.
        const retriable = res.status === 429 || res.status >= 500;
        if (retriable && attempt < retries) {
          lastError = error;
          await sleep(retryDelayMs * (attempt + 1));
          continue;
        }

        throw error;
      }

      const json = await res.json();
      // console.log(`[SaleAPI${provider ? `:${provider}` : ""}] raw response:`, JSON.stringify(json));

      return json;
    } catch (error) {
      clearTimeout(timeout);
      const normalized = toSaleApiError(error, { provider });

      const retriable = normalized.code === "timeout" || normalized.code === "upstream_error";
      if (retriable && attempt < retries) {
        lastError = normalized;
        await sleep(retryDelayMs * (attempt + 1));
        continue;
      }

      throw normalized;
    }
  }

  throw lastError || toSaleApiError(new Error("Request failed after retries."), { provider });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
