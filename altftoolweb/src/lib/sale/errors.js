import { MissingEnvError } from "@altftool/core/env";

/**
 * Typed error for every failure surfaced by the Sale Locator service layer.
 * @extends Error
 */
export class SaleApiError extends Error {
  /**
   * @param {string} message
   * @param {{ status?: number, code?: string, provider?: string, cause?: unknown }} [options]
   */
  constructor(message, { status = 500, code = "upstream_error", provider = "", cause } = {}) {
    super(message);
    this.name = "SaleApiError";
    this.status = status;
    this.code = code;
    this.provider = provider;
    if (cause) this.cause = cause;
  }
}

/**
 * Normalise any thrown value (upstream HTTP error, network error, abort, etc.)
 * into a SaleApiError so every caller can rely on `.status` / `.code`.
 *
 * @param {unknown} error
 * @param {{ provider?: string, fallbackMessage?: string }} [options]
 * @returns {SaleApiError}
 */
export function toSaleApiError(error, { provider = "", fallbackMessage = "Request failed." } = {}) {
  if (error instanceof SaleApiError) return error;

  if (error instanceof MissingEnvError) {
    return new SaleApiError(error.message, { status: 500, code: "missing_api_key", provider, cause: error });
  }

  if (error?.name === "AbortError" || /timed? ?out/i.test(error?.message || "")) {
    return new SaleApiError(`${provider ? `[${provider}] ` : ""}Request timed out.`, {
      status: 504,
      code: "timeout",
      provider,
      cause: error,
    });
  }

  const status = Number(error?.status) || 0;
  if (status) return fromHttpStatus(status, provider, error?.message, error);

  return new SaleApiError(error?.message || fallbackMessage, {
    status: 500,
    code: "upstream_error",
    provider,
    cause: error,
  });
}

/**
 * Map an upstream HTTP status code to a typed SaleApiError.
 *
 * @param {number} status
 * @param {string} [provider]
 * @param {string} [message]
 * @param {unknown} [cause]
 * @returns {SaleApiError}
 */
export function fromHttpStatus(status, provider = "", message = "", cause) {
  const prefix = provider ? `[${provider}] ` : "";

  switch (status) {
    case 401:
    case 403:
      return new SaleApiError(`${prefix}${message || "Unauthorized — check the API key."}`, {
        status,
        code: "unauthorized",
        provider,
        cause,
      });
    case 404:
      return new SaleApiError(`${prefix}${message || "Resource not found."}`, {
        status,
        code: "not_found",
        provider,
        cause,
      });
    case 429:
      return new SaleApiError(`${prefix}${message || "Rate limit / quota exceeded."}`, {
        status,
        code: "quota_exceeded",
        provider,
        cause,
      });
    case 408:
    case 504:
      return new SaleApiError(`${prefix}${message || "Request timed out."}`, {
        status,
        code: "timeout",
        provider,
        cause,
      });
    default:
      if (status >= 500) {
        return new SaleApiError(`${prefix}${message || "Upstream service error."}`, {
          status,
          code: "upstream_error",
          provider,
          cause,
        });
      }
      return new SaleApiError(`${prefix}${message || "Request failed."}`, {
        status: status || 500,
        code: "upstream_error",
        provider,
        cause,
      });
  }
}

/**
 * Serialize a SaleApiError (or any error) into a safe JSON-able shape
 * for API route responses.
 *
 * @param {unknown} error
 * @returns {{ message: string, status: number, code: string }}
 */
export function serializeSaleError(error) {
  const normalized = toSaleApiError(error);
  return {
    message: normalized.message,
    status: normalized.status,
    code: normalized.code,
  };
}

// Upstream error bodies (Overpass/Nominatim return raw HTML error pages,
// SerpAPI/RapidAPI can include account/key details) leak into
// SaleApiError.message via the shared http client — every route that
// surfaces an error to the client must map by code to one of these fixed,
// safe messages instead of forwarding serializeSaleError(...).message.
export const FRIENDLY_ERROR_MESSAGES = {
  timeout: "The search took too long to respond. Please try again in a moment.",
  quota_exceeded: "Too many searches right now. Please wait a moment and try again.",
  upstream_error: "Couldn't reach the map data service. Please try again shortly.",
};

export function friendlyMessageFor(code) {
  return FRIENDLY_ERROR_MESSAGES[code] || "Something went wrong. Please try again.";
}
