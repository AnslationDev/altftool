import assert from "node:assert/strict";
import test from "node:test";

import {
  PdfOperationCancelledError,
  PdfOperationTimeoutError,
  createPdfCleanup,
  createPdfOperationGuard,
  racePdfOperation,
} from "./boundedPdfOperations.mjs";

function manualTimers() {
  let nextId = 1;
  const scheduled = new Map();
  const cleared = [];

  return {
    api: {
      set(callback, milliseconds) {
        const id = nextId;
        nextId += 1;
        scheduled.set(id, { callback, milliseconds });
        return id;
      },
      clear(id) {
        cleared.push(id);
        scheduled.delete(id);
      },
    },
    cleared,
    get size() {
      return scheduled.size;
    },
    runDelay(milliseconds) {
      const entry = [...scheduled.entries()].find(
        ([, timer]) => timer.milliseconds === milliseconds,
      );
      assert.ok(entry, `Expected a ${milliseconds} ms timer.`);
      const [id, timer] = entry;
      scheduled.delete(id);
      timer.callback();
    },
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

test("times out a pending PDF operation and cleans up a late result", async () => {
  const timers = manualTimers();
  const operation = deferred();
  let interruptions = 0;
  const lateResults = [];
  const pending = racePdfOperation(() => operation.promise, {
    label: "PDF loading",
    timeoutMilliseconds: 500,
    timers: timers.api,
    onInterrupt: () => {
      interruptions += 1;
    },
    onLateResolve: (value) => {
      lateResults.push(value);
    },
  });

  timers.runDelay(500);
  await assert.rejects(
    pending,
    (error) =>
      error instanceof PdfOperationTimeoutError &&
      error.code === "PDF_OPERATION_TIMEOUT" &&
      /PDF loading/iu.test(error.message),
  );
  assert.equal(interruptions, 1);
  assert.equal(timers.size, 0);

  operation.resolve("late PDF document");
  await Promise.resolve();
  assert.deepEqual(lateResults, ["late PDF document"]);
});

test("polls cooperative cancellation and interrupts the pending operation", async () => {
  const timers = manualTimers();
  const operation = deferred();
  let shouldContinue = true;
  let interruptions = 0;
  const pending = racePdfOperation(() => operation.promise, {
    timeoutMilliseconds: 1_000,
    cancellationPollMilliseconds: 25,
    shouldContinue: () => shouldContinue,
    timers: timers.api,
    onInterrupt: () => {
      interruptions += 1;
    },
  });

  shouldContinue = false;
  timers.runDelay(25);
  await assert.rejects(
    pending,
    (error) =>
      error instanceof PdfOperationCancelledError &&
      error.code === "PDF_OPERATION_CANCELLED",
  );
  assert.equal(interruptions, 1);
  assert.equal(timers.size, 0);
});

test("clears timeout and cancellation timers after successful work", async () => {
  const timers = manualTimers();
  const result = await racePdfOperation(() => Promise.resolve("done"), {
    timeoutMilliseconds: 200,
    cancellationPollMilliseconds: 20,
    timers: timers.api,
  });

  assert.equal(result, "done");
  assert.equal(timers.size, 0);
  assert.equal(timers.cleared.length, 2);
});

test("uses the remaining document budget as the operation timeout", async () => {
  const timers = manualTimers();
  const operation = deferred();
  let now = 1_000;
  const guard = createPdfOperationGuard({
    documentTimeoutMilliseconds: 1_000,
    now: () => now,
    timers: timers.api,
  });
  now = 1_850;

  const pending = guard.run(() => operation.promise, {
    label: "PDF page loading",
    timeoutMilliseconds: 800,
  });
  timers.runDelay(150);

  await assert.rejects(
    pending,
    (error) =>
      error instanceof PdfOperationTimeoutError &&
      /overall time limit/iu.test(error.message),
  );
  assert.equal(guard.remainingMilliseconds(), 150);
});

test("starts an asynchronous PDF cleanup at most once", async () => {
  const cleanupResult = deferred();
  let cleanupCalls = 0;
  const cleanup = createPdfCleanup(() => {
    cleanupCalls += 1;
    return cleanupResult.promise;
  });

  const first = cleanup();
  const second = cleanup();
  assert.equal(first, second);
  assert.equal(cleanupCalls, 1);

  cleanupResult.resolve();
  await first;
});
