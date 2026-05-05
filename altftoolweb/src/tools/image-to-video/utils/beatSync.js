export function analyzeTaps(taps) {
  if (taps.length < 2) return { bpm: 0, avgInterval: 0 };

  const intervals = [];
  for (let i = 1; i < taps.length; i++) {
    intervals.push(taps[i] - taps[i - 1]);
  }

  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const bpm = Math.round(60000 / avgInterval);

  return { bpm, avgInterval };
}

export function tapsToSlideDurations(taps, slideCount) {
  if (taps.length < 2) return null; // not enough taps

  const durations = [];
  for (let i = 1; i < taps.length; i++) {
    durations.push((taps[i] - taps[i - 1]) / 1000); 
  }

  // Pad or trim to match slide count
  const result = [];
  for (let i = 0; i < slideCount; i++) {
    result.push(durations[i] ?? durations[durations.length - 1]);
  }

  return result;
}

export function applyBeatsToSlides(slides, taps) {
  const durations = tapsToSlideDurations(taps, slides.length);
  if (!durations) return slides;

  return slides.map((slide, i) => ({
    ...slide,
    duration: parseFloat(durations[i].toFixed(2)),
  }));
}