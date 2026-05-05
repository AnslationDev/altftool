

/**

 * @param {Object} signals - all collected fingerprint data
 * @returns {Object} - uniqueness estimate
 */
export function estimateUniqueness(signals) {
 
  let probability = 1.0;

  // Canvas — nearly unique per device (research: ~1 in 10,000)
  if (signals.canvas?.rawValue && signals.canvas.rawValue !== "canvas-blocked") {
    probability *= 0.0001;
  }

  // WebGL renderer — unique per GPU model (~1 in 500)
  if (signals.webgl?.renderer && signals.webgl.renderer !== "Blocked") {
    probability *= 0.002;
  }

  // Screen resolution — ~50 common resolutions (~1 in 20)
  if (signals.screen?.screenWidth > 0) {
    probability *= 0.05;
  }

  // Timezone — ~400 timezones but uneven distribution (~1 in 30)
  if (signals.browser?.timezone && signals.browser.timezone !== "Unknown") {
    probability *= 0.033;
  }

  // CPU cores — 6-8 common values (~1 in 5)
  if (signals.device?.cpuCores !== "Unknown") {
    probability *= 0.2;
  }

  // Language combo — highly personal (~1 in 15)
  if (signals.browser?.languages?.length > 0) {
    probability *= 0.067;
  }

  // Fonts — very high entropy when many detected (~1 in 100)
  const fontCount = signals.fonts?.count || 0;
  if (fontCount > 15) {
    probability *= 0.01;
  } else if (fontCount > 5) {
    probability *= 0.05;
  }

  // Audio fingerprint — hardware-level (~1 in 1000)
  if (signals.audio?.rawValue && signals.audio.rawValue !== "audio-blocked") {
    probability *= 0.001;
  }


  const rawOneIn = Math.round(1 / Math.max(probability, 1e-12));

  // Format the number nicely
  const formatNumber = (n) => {
    if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} billion`;
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} million`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)},000`;
    return n.toLocaleString();
  };

  // Uniqueness percentage (how rare is this fingerprint)
  const percentile = Math.min(99.9999, (1 - probability) * 100);

  return {
    oneIn: rawOneIn,
    oneInFormatted: formatNumber(rawOneIn),
    percentile: percentile.toFixed(4),
    isUnique: rawOneIn > 100_000,
    label:
      rawOneIn > 1_000_000
        ? "Extremely Unique"
        : rawOneIn > 100_000
        ? "Highly Unique"
        : rawOneIn > 10_000
        ? "Very Unique"
        : rawOneIn > 1_000
        ? "Moderately Unique"
        : "Common Profile",
  };
}