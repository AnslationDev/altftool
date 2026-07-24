const DEFAULT_RETRY_STATUSES = new Set([408, 425, 429]);

export class ResilientFetchError extends Error {
  constructor(message, { cause, status, code, transient = false } = {}) {
    super(message, cause ? { cause } : undefined);
    this.name = "ResilientFetchError";
    this.status = status;
    this.code = code;
    this.transient = transient;
  }
}

function isRetryStatus(status) {
  return DEFAULT_RETRY_STATUSES.has(status) || status >= 500;
}

function isAbortError(error) {
  return error?.name === "AbortError" || error?.code === "ABORT_ERR";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function retryDelay(attempt, baseDelayMs, maxDelayMs, random) {
  const exponential = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
  const jitter = 0.75 + random() * 0.5;
  return Math.max(0, Math.round(exponential * jitter));
}

/**
 * Fetch and decode JSON within one total deadline. Transient HTTP/network
 * failures retry with jitter; caller aborts and permanent 4xx responses do not.
 */
export async function fetchJsonWithRetry(
  url,
  {
    label = "Upstream request",
    timeoutMs = 8_000,
    maxAttempts = 3,
    baseDelayMs = 120,
    maxDelayMs = 800,
    signal,
    ...requestInit
  } = {},
  {
    fetchImpl = globalThis.fetch,
    sleepImpl = sleep,
    random = Math.random,
    now = Date.now,
  } = {},
) {
  const attempts = Math.max(1, Number(maxAttempts) || 1);
  const deadlineMs = Math.max(1, Number(timeoutMs) || 1);
  const startedAt = now();
  let lastError = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const remainingMs = deadlineMs - (now() - startedAt);
    if (remainingMs <= 0) break;

    const controller = new AbortController();
    const abortFromCaller = () => controller.abort(signal?.reason);
    if (signal?.aborted) {
      throw new ResilientFetchError(`${label} aborted by caller`, {
        cause: signal.reason,
        code: "aborted",
      });
    }
    signal?.addEventListener("abort", abortFromCaller, { once: true });
    const timeout = setTimeout(
      () => controller.abort(new Error(`${label} deadline exceeded`)),
      remainingMs,
    );

    try {
      const response = await fetchImpl(url, {
        ...requestInit,
        signal: controller.signal,
      });

      if (!response.ok) {
        const error = new ResilientFetchError(
          `${label} failed: ${response.status}`,
          {
            status: response.status,
            code: "http_error",
            transient: isRetryStatus(response.status),
          },
        );

        if (!error.transient || attempt === attempts - 1) throw error;
        lastError = error;
      } else {
        try {
          return await response.json();
        } catch (error) {
          throw new ResilientFetchError(`${label} returned invalid JSON`, {
            cause: error,
            code: "invalid_json",
          });
        }
      }
    } catch (error) {
      if (signal?.aborted) {
        throw new ResilientFetchError(`${label} aborted by caller`, {
          cause: signal.reason || error,
          code: "aborted",
        });
      }

      if (isAbortError(error) || controller.signal.aborted) {
        lastError = new ResilientFetchError(
          `${label} timed out after ${deadlineMs}ms`,
          {
            cause: error,
            code: "timeout",
            transient: true,
          },
        );
      } else if (error instanceof ResilientFetchError) {
        if (!error.transient) throw error;
        lastError = error;
      } else {
        lastError = new ResilientFetchError(`${label} failed`, {
          cause: error,
          code: "network_error",
          transient: true,
        });
      }
    } finally {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abortFromCaller);
    }

    if (attempt === attempts - 1) break;
    const remainingAfterAttempt = deadlineMs - (now() - startedAt);
    if (remainingAfterAttempt <= 0) break;
    const delayMs = Math.min(
      retryDelay(attempt, baseDelayMs, maxDelayMs, random),
      remainingAfterAttempt,
    );
    if (delayMs > 0) await sleepImpl(delayMs);
  }

  throw (
    lastError ||
    new ResilientFetchError(`${label} timed out after ${deadlineMs}ms`, {
      code: "timeout",
      transient: true,
    })
  );
}
