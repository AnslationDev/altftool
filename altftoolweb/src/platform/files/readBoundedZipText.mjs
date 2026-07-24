function positiveSafeInteger(value, fallback) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : fallback;
}

/**
 * Stream one JSZip entry into text while enforcing the actual inflated byte
 * count. Central-directory sizes are useful preflight hints, but they are not
 * trusted as the runtime memory boundary.
 */
export function readBoundedZipText(
  entry,
  { maximumBytes, shouldContinue = () => true, label = "ZIP entry" } = {},
) {
  const limit = positiveSafeInteger(maximumBytes, 0);
  if (
    !entry ||
    entry.dir ||
    typeof entry.internalStream !== "function" ||
    !limit
  ) {
    return Promise.reject(new Error(`${label} cannot be streamed safely.`));
  }

  return new Promise((resolve, reject) => {
    const decoder = new TextDecoder("utf-8");
    const helper = entry.internalStream("uint8array");
    let settled = false;
    let inflatedBytes = 0;
    let text = "";

    const fail = (cause) => {
      if (settled) return;
      settled = true;
      helper.pause();
      text = "";
      reject(
        cause instanceof Error
          ? cause
          : new Error(`${label} could not be decompressed safely.`),
      );
    };

    helper
      .on("data", (chunk) => {
        if (settled) return;
        if (!shouldContinue()) {
          fail(new Error("Archive inspection was cancelled."));
          return;
        }
        const bytes =
          chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk || 0);
        inflatedBytes += bytes.byteLength;
        if (!Number.isSafeInteger(inflatedBytes) || inflatedBytes > limit) {
          fail(
            new Error(
              `${label} exceeds the ${limit.toLocaleString("en-US")}-byte expanded-content limit.`,
            ),
          );
          return;
        }
        text += decoder.decode(bytes, { stream: true });
      })
      .on("error", fail)
      .on("end", () => {
        if (settled) return;
        try {
          text += decoder.decode();
          settled = true;
          resolve({ text, inflatedBytes });
        } catch (error) {
          fail(error);
        }
      })
      .resume();
  });
}
