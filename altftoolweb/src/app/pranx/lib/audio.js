function getPranxAudioContext() {
  if (typeof window === "undefined") return null;
  const BrowserAudioContext = window.AudioContext || window.webkitAudioContext;
  if (!BrowserAudioContext) return null;

  if (!window.__pranxAudioContext) {
    window.__pranxAudioContext = new BrowserAudioContext();
  }

  const context = window.__pranxAudioContext;
  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }
  return context;
}

function playTone({ frequency = 440, endFrequency, type = "sine", gain = 0.04, duration = 0.12, delay = 0 }) {
  try {
    const context = getPranxAudioContext();
    if (!context) return;

    const oscillator = context.createOscillator();
    const volume = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(20, frequency), start);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), end);
    }

    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    volume.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(volume);
    volume.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  } catch {
    // Browsers can block audio before a user gesture; the visual effect continues.
  }
}

function playNoise({ gain = 0.035, duration = 0.12, filter = 1800, delay = 0 }) {
  try {
    const context = getPranxAudioContext();
    if (!context) return;

    const sampleRate = context.sampleRate;
    const frameCount = Math.max(1, Math.floor(sampleRate * duration));
    const buffer = context.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      data[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    }

    const source = context.createBufferSource();
    const band = context.createBiquadFilter();
    const volume = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;

    band.type = "bandpass";
    band.frequency.setValueAtTime(filter, start);
    band.Q.setValueAtTime(6, start);
    volume.gain.setValueAtTime(0.0001, start);
    volume.gain.exponentialRampToValueAtTime(gain, start + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, end);

    source.buffer = buffer;
    source.connect(band);
    band.connect(volume);
    volume.connect(context.destination);
    source.start(start);
    source.stop(end + 0.02);
  } catch {
    // Keep effects non-blocking.
  }
}

export function playPranxSound(kind, seed = 0) {
  const pitch = Math.abs(seed) % 480;

  if (kind === "scroll") {
    playTone({ type: "square", frequency: 180 + pitch, endFrequency: 260 + pitch, duration: 0.045, gain: 0.018 });
    return;
  }

  if (kind === "glitch") {
    playNoise({ filter: 1300 + pitch, duration: 0.1, gain: 0.03 });
    playTone({ type: "sawtooth", frequency: 140 + pitch / 5, endFrequency: 720 + pitch / 3, duration: 0.12, gain: 0.022 });
    return;
  }

  if (kind === "jurassic-alert") {
    playNoise({ filter: 900 + pitch, duration: 0.16, gain: 0.045 });
    playTone({ type: "square", frequency: 520, endFrequency: 390, duration: 0.18, gain: 0.04 });
    playTone({ type: "sawtooth", frequency: 260, endFrequency: 720, duration: 0.2, gain: 0.026, delay: 0.16 });
    playTone({ type: "square", frequency: 610, endFrequency: 450, duration: 0.14, gain: 0.032, delay: 0.36 });
    return;
  }

  if (kind === "mosquito") {
    playTone({ type: "sine", frequency: 720, endFrequency: 980, duration: 0.18, gain: 0.016 });
    playTone({ type: "triangle", frequency: 940, endFrequency: 690, duration: 0.18, gain: 0.012, delay: 0.16 });
    return;
  }

  if (kind === "welcome") {
    playTone({ type: "sine", frequency: 523.25, duration: 0.13, gain: 0.035 });
    playTone({ type: "sine", frequency: 659.25, duration: 0.13, gain: 0.032, delay: 0.1 });
    playTone({ type: "sine", frequency: 783.99, duration: 0.18, gain: 0.03, delay: 0.2 });
    return;
  }

  if (kind === "joke") {
    playTone({ type: "triangle", frequency: 330, endFrequency: 520, duration: 0.08, gain: 0.03 });
    playTone({ type: "square", frequency: 760, duration: 0.045, gain: 0.018, delay: 0.07 });
    return;
  }

  if (kind === "toggle-off") {
    playTone({ type: "triangle", frequency: 420, endFrequency: 220, duration: 0.1, gain: 0.026 });
    return;
  }

  playTone({ type: "triangle", frequency: 520, endFrequency: 760, duration: 0.1, gain: 0.028 });
  playTone({ type: "sine", frequency: 880, duration: 0.08, gain: 0.022, delay: 0.08 });
}
