export const PDF_OPERATION_TIMEOUTS = Object.freeze({
  documentMilliseconds: 45_000,
  loadingMilliseconds: 15_000,
  getPageMilliseconds: 8_000,
  streamReadMilliseconds: 5_000,
  textContentMilliseconds: 10_000,
  cleanupMilliseconds: 1_500,
  cancellationPollMilliseconds: 100,
});

const DEFAULT_TIMERS = Object.freeze({
  set(callback, milliseconds) {
    return setTimeout(callback, milliseconds);
  },
  clear(timer) {
    clearTimeout(timer);
  },
});

function positiveMilliseconds(value, fallback) {
  const milliseconds = Math.floor(Number(value));
  return Number.isFinite(milliseconds) && milliseconds > 0
    ? milliseconds
    : fallback;
}

function currentTime() {
  return globalThis.performance?.now?.() ?? Date.now();
}

function continuationAllowed(shouldContinue) {
  try {
    return shouldContinue();
  } catch {
    return false;
  }
}

function startIgnoredCleanup(cleanup, value) {
  if (typeof cleanup !== "function") return;
  try {
    Promise.resolve(cleanup(value)).catch(() => {});
  } catch {
    // The original timeout or cancellation remains the useful failure.
  }
}

export class PdfOperationTimeoutError extends Error {
  constructor(message) {
    super(message);
    this.name = "PdfOperationTimeoutError";
    this.code = "PDF_OPERATION_TIMEOUT";
  }
}

export class PdfOperationCancelledError extends Error {
  constructor(message = "PDF extraction was cancelled.") {
    super(message);
    this.name = "PdfOperationCancelledError";
    this.code = "PDF_OPERATION_CANCELLED";
  }
}

/**
 * Race one PDF.js operation against a timeout and cooperative cancellation.
 * Timer functions are injectable so timeout and cleanup behavior can be tested
 * without relying on elapsed wall-clock time.
 */
export function racePdfOperation(
  operation,
  {
    label = "PDF operation",
    timeoutMilliseconds,
    timeoutMessage,
    cancellationMessage = "PDF extraction was cancelled.",
    shouldContinue = () => true,
    onInterrupt,
    onLateResolve,
    cancellationPollMilliseconds = PDF_OPERATION_TIMEOUTS.cancellationPollMilliseconds,
    timers = DEFAULT_TIMERS,
  } = {},
) {
  if (typeof operation !== "function") {
    return Promise.reject(
      new TypeError("A PDF operation function is required."),
    );
  }

  const timeout = positiveMilliseconds(
    timeoutMilliseconds,
    PDF_OPERATION_TIMEOUTS.streamReadMilliseconds,
  );
  const pollInterval = positiveMilliseconds(
    cancellationPollMilliseconds,
    PDF_OPERATION_TIMEOUTS.cancellationPollMilliseconds,
  );

  return new Promise((resolve, reject) => {
    let settled = false;
    let interrupted = false;
    let timeoutTimer = null;
    let cancellationTimer = null;

    const clearTimers = () => {
      if (timeoutTimer !== null) {
        timers.clear(timeoutTimer);
        timeoutTimer = null;
      }
      if (cancellationTimer !== null) {
        timers.clear(cancellationTimer);
        cancellationTimer = null;
      }
    };

    const interrupt = (error, resolvedValue) => {
      if (settled) return;
      settled = true;
      interrupted = true;
      clearTimers();
      startIgnoredCleanup(onInterrupt);
      if (resolvedValue !== undefined) {
        startIgnoredCleanup(onLateResolve, resolvedValue);
      }
      reject(error);
    };

    const checkCancellation = () => {
      cancellationTimer = null;
      if (settled) return;
      if (!continuationAllowed(shouldContinue)) {
        interrupt(new PdfOperationCancelledError(cancellationMessage));
        return;
      }
      cancellationTimer = timers.set(checkCancellation, pollInterval);
    };

    if (!continuationAllowed(shouldContinue)) {
      interrupt(new PdfOperationCancelledError(cancellationMessage));
      return;
    }

    timeoutTimer = timers.set(
      () =>
        interrupt(
          new PdfOperationTimeoutError(
            timeoutMessage ||
              `${label} exceeded its time limit and was stopped.`,
          ),
        ),
      timeout,
    );
    cancellationTimer = timers.set(checkCancellation, pollInterval);

    let operationPromise;
    try {
      operationPromise = Promise.resolve(operation());
    } catch (error) {
      settled = true;
      clearTimers();
      reject(error);
      return;
    }

    operationPromise.then(
      (value) => {
        if (settled) {
          if (interrupted) startIgnoredCleanup(onLateResolve, value);
          return;
        }
        if (!continuationAllowed(shouldContinue)) {
          interrupt(new PdfOperationCancelledError(cancellationMessage), value);
          return;
        }
        settled = true;
        clearTimers();
        resolve(value);
      },
      (error) => {
        if (settled) return;
        settled = true;
        clearTimers();
        reject(error);
      },
    );
  });
}

export function createPdfCleanup(cleanup) {
  let cleanupPromise;
  return () => {
    if (!cleanupPromise) {
      try {
        cleanupPromise = Promise.resolve(cleanup()).catch(() => {});
      } catch {
        cleanupPromise = Promise.resolve();
      }
    }
    return cleanupPromise;
  };
}

export function createPdfOperationGuard({
  documentTimeoutMilliseconds = PDF_OPERATION_TIMEOUTS.documentMilliseconds,
  shouldContinue = () => true,
  now = currentTime,
  timers = DEFAULT_TIMERS,
  cancellationPollMilliseconds = PDF_OPERATION_TIMEOUTS.cancellationPollMilliseconds,
} = {}) {
  const documentTimeout = positiveMilliseconds(
    documentTimeoutMilliseconds,
    PDF_OPERATION_TIMEOUTS.documentMilliseconds,
  );
  const deadline = now() + documentTimeout;

  const run = (
    operation,
    {
      label = "PDF operation",
      timeoutMilliseconds = PDF_OPERATION_TIMEOUTS.streamReadMilliseconds,
      onInterrupt,
      onLateResolve,
      cancellationMessage,
    } = {},
  ) => {
    const remaining = Math.floor(deadline - now());
    if (remaining <= 0) {
      startIgnoredCleanup(onInterrupt);
      return Promise.reject(
        new PdfOperationTimeoutError(
          "PDF extraction reached its overall time limit and was stopped.",
        ),
      );
    }

    const operationTimeout = positiveMilliseconds(
      timeoutMilliseconds,
      PDF_OPERATION_TIMEOUTS.streamReadMilliseconds,
    );
    const documentLimited = remaining <= operationTimeout;
    return racePdfOperation(operation, {
      label,
      timeoutMilliseconds: Math.min(remaining, operationTimeout),
      timeoutMessage: documentLimited
        ? "PDF extraction reached its overall time limit and was stopped."
        : `${label} exceeded its time limit and was stopped.`,
      cancellationMessage,
      shouldContinue,
      onInterrupt,
      onLateResolve,
      cancellationPollMilliseconds,
      timers,
    });
  };

  const settleCleanup = async (cleanup) => {
    if (typeof cleanup !== "function") return;
    try {
      await racePdfOperation(cleanup, {
        label: "PDF cleanup",
        timeoutMilliseconds: PDF_OPERATION_TIMEOUTS.cleanupMilliseconds,
        shouldContinue: () => true,
        cancellationPollMilliseconds:
          PDF_OPERATION_TIMEOUTS.cleanupMilliseconds + 1,
        timers,
      });
    } catch {
      // Cleanup was started and is allowed to finish in the background.
    }
  };

  return {
    run,
    settleCleanup,
    remainingMilliseconds() {
      return Math.max(0, Math.floor(deadline - now()));
    },
  };
}
