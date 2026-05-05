

/**
 * Calculates the tracking risk score (0-100)
 * @param {Object} signals - all collected fingerprint data
 * @returns {Object} - score, level, breakdown
 */
export function calculateRiskScore(signals) {
  let score = 0;
  const breakdown = [];

 

  // Canvas fingerprint — strongest single signal
  const canvasScore = signals.canvas?.rawValue &&
    signals.canvas.rawValue !== "canvas-blocked" ? 20 : 0;
  score += canvasScore;
  breakdown.push({ name: "Canvas Fingerprint", score: canvasScore, max: 20 });

  // WebGL — GPU identity, very unique
  const webglScore = signals.webgl?.renderer &&
    signals.webgl.renderer !== "Blocked" &&
    signals.webgl.renderer !== "Not supported" ? 15 : 0;
  score += webglScore;
  breakdown.push({ name: "WebGL / GPU", score: webglScore, max: 15 });

  // Audio fingerprint — hardware-level unique
  const audioScore = signals.audio?.rawValue &&
    signals.audio.rawValue !== "audio-blocked" &&
    signals.audio.rawValue !== "audio-not-supported" ? 10 : 0;
  score += audioScore;
  breakdown.push({ name: "Audio Fingerprint", score: audioScore, max: 10 });

  // Fonts — high entropy, personal to each user
  const fontCount = signals.fonts?.count || 0;
  const fontScore = fontCount > 20 ? 10 : fontCount > 10 ? 7 : fontCount > 0 ? 4 : 0;
  score += fontScore;
  breakdown.push({ name: "Font Detection", score: fontScore, max: 10 });



  // Timezone — reveals location
  const timezoneScore = signals.browser?.timezone &&
    signals.browser.timezone !== "Unknown" ? 8 : 0;
  score += timezoneScore;
  breakdown.push({ name: "Timezone", score: timezoneScore, max: 8 });

  // Screen resolution — very stable signal
  const screenScore = signals.screen?.screenWidth > 0 ? 8 : 0;
  score += screenScore;
  breakdown.push({ name: "Screen Resolution", score: screenScore, max: 8 });

  // CPU cores + memory combo
  const hardwareScore =
    (signals.device?.cpuCores !== "Unknown" ? 4 : 0) +
    (signals.device?.deviceMemory !== "Unknown" ? 3 : 0);
  score += hardwareScore;
  breakdown.push({ name: "CPU + Memory", score: hardwareScore, max: 7 });



  // Languages reveal region + preference
  const langScore = signals.browser?.languages?.length > 1 ? 5 : 2;
  score += langScore;
  breakdown.push({ name: "Languages", score: langScore, max: 5 });

  // Touch support distinguishes device class
  const touchScore = signals.device?.touchPoints !== undefined ? 3 : 0;
  score += touchScore;
  breakdown.push({ name: "Touch Points", score: touchScore, max: 3 });

  // Storage availability pattern (incognito detection)
  const storageScore =
    signals.storage?.localStorage &&
    signals.storage?.indexedDB ? 4 : 2;
  score += storageScore;
  breakdown.push({ name: "Storage Profile", score: storageScore, max: 4 });

  // Media devices reveal hardware setup
  const mediaScore =
    (signals.media?.hasCamera ? 2 : 0) +
    (signals.media?.hasMicrophone ? 2 : 0);
  score += mediaScore;
  breakdown.push({ name: "Media Devices", score: mediaScore, max: 4 });


  const dntPenalty = signals.browser?.doNotTrack === "Enabled" ? 3 : 0;
  score += dntPenalty;
  breakdown.push({ name: "DNT Penalty", score: dntPenalty, max: 3 });

  // Cap at 100
  score = Math.min(Math.round(score), 100);

  // Determine risk level
  let level, color, description;
  if (score < 30) {
    level = "Low";
    color = "green";
    description = "Your browser exposes few unique signals. Tracking risk is minimal.";
  } else if (score < 70) {
    level = "Medium";
    color = "yellow";
    description = "Your browser exposes several trackable signals. You can be identified with moderate confidence.";
  } else {
    level = "High";
    color = "red";
    description = "Your browser has a highly unique fingerprint. Trackers can identify you with high confidence.";
  }

  return { score, level, color, description, breakdown };
}