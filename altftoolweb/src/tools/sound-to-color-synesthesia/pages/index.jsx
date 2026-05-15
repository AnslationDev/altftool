"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NUM_PARTICLES = 60;

function freqToNote(freq) {
  if (freq <= 0) return null;

  const semitones = Math.round(12 * Math.log2(freq / 440) + 69);
  const note = NOTE_NAMES[((semitones % 12) + 12) % 12];
  const octave = Math.floor(semitones / 12) - 1;
  return { note, octave };
}

function freqToHue(freq) {
  if (freq <= 0) return 215;

  const semitones = 12 * Math.log2(freq / 440) + 69;
  return ((semitones * 30) % 360 + 360) % 360;
}

function amplitudeToSaturation(amp) {
  return Math.min(100, 30 + amp * 70);
}

function amplitudeToLightness(amp) {
  return Math.min(75, 20 + amp * 55);
}

function fmtTime(sec) {
  if (!Number.isFinite(sec)) return "0:00";

  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function initParticles(width, height) {
  return Array.from({ length: NUM_PARTICLES }, (_, index) => ({
    id: index,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    size: Math.random() * 6 + 2,
    hue: Math.random() * 360,
    alpha: Math.random() * 0.5 + 0.2,
    life: Math.random(),
  }));
}

export default function SoundToColorSynesthesia() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animRef = useRef(null);
  const particlesRef = useRef([]);
  const historyRef = useRef([]);
  const audioCtxRef = useRef(null);
  const audioElRef = useRef(null);
  const mediaSrcRef = useRef(null);
  const fileInputRef = useRef(null);
  const drawFrameRef = useRef(null);
  const objectUrlsRef = useRef([]);

  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const [currentColor, setCurrentColor] = useState({ h: 215, s: 70, l: 42 });
  const [currentNote, setCurrentNote] = useState(null);
  const [currentFreq, setCurrentFreq] = useState(0);
  const [amplitude, setAmplitude] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [audioMode, setAudioMode] = useState("file");
  const [dragOver, setDragOver] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const { h, s, l } = currentColor;
  const liveColor = currentFreq > 0 ? `hsl(${h}, ${s}%, ${Math.min(l + 18, 88)}%)` : "var(--primary)";

  useEffect(() => {
    if (audioElRef.current) return;

    audioElRef.current = new Audio();
    audioElRef.current.crossOrigin = "anonymous";
  }, []);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, canvas.offsetWidth * ratio);
    const height = Math.max(1, canvas.offsetHeight * ratio);

    canvas.width = width;
    canvas.height = height;
    overlay.width = width;
    overlay.height = Math.max(1, overlay.offsetHeight * ratio);
    particlesRef.current = initParticles(width, height);
    historyRef.current = [];
  }, []);

  const getDominantFreq = useCallback((analyser) => {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    const sampleRate = audioCtxRef.current?.sampleRate || 44100;
    let maxVal = 0;
    let maxIdx = 0;

    for (let i = 2; i < bufferLength * 0.75; i += 1) {
      if (dataArray[i] > maxVal) {
        maxVal = dataArray[i];
        maxIdx = i;
      }
    }

    return {
      freq: (maxIdx * sampleRate) / analyser.fftSize,
      amp: maxVal / 255,
      dataArray,
      bufferLength,
    };
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !overlay || !analyser) return;

    const ctx = canvas.getContext("2d");
    const octx = overlay.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;
    const { freq, amp, dataArray, bufferLength } = getDominantFreq(analyser);
    const hue = freqToHue(freq);
    const sat = amplitudeToSaturation(amp);
    const lit = amplitudeToLightness(amp);

    setCurrentFreq(Math.round(freq));
    setAmplitude(amp);
    setCurrentColor({ h: hue, s: sat, l: lit });
    if (freq > 50) setCurrentNote(freqToNote(freq));

    historyRef.current.push({ h: hue, s: sat, l: lit, amp });
    if (historyRef.current.length > width) historyRef.current.shift();

    ctx.fillStyle = `hsla(${hue}, ${sat * 0.25}%, 8%, 0.2)`;
    ctx.fillRect(0, 0, width, height);

    if (amp > 0.04) {
      for (let ring = 0; ring < 6; ring += 1) {
        const radius = ((amp * width * 0.45 * (ring + 1)) / 6) * (1 + Math.sin(Date.now() / 400 + ring) * 0.1);
        const alpha = (amp * 0.55 * (6 - ring)) / 6;
        const gradient = ctx.createRadialGradient(width / 2, height / 2, radius * 0.5, width / 2, height / 2, radius);
        gradient.addColorStop(0, `hsla(${hue}, ${sat}%, ${Math.min(lit + 20, 88)}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${(hue + 30) % 360}, ${sat}%, ${lit}%, 0)`);
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    const barCount = 128;
    const angleStep = (Math.PI * 2) / barCount;
    const innerRadius = Math.min(width, height) * 0.12;

    ctx.save();
    ctx.translate(width / 2, height / 2);
    for (let i = 0; i < barCount; i += 1) {
      const val = dataArray[Math.floor((i / barCount) * bufferLength)] / 255;
      const angle = i * angleStep - Math.PI / 2;
      const barLength = val * Math.min(width, height) * 0.28;
      const x1 = Math.cos(angle) * innerRadius;
      const y1 = Math.sin(angle) * innerRadius;
      const x2 = Math.cos(angle) * (innerRadius + barLength);
      const y2 = Math.sin(angle) * (innerRadius + barLength);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `hsla(${(hue + i * 2) % 360}, ${sat}%, ${Math.min(lit + 30, 90)}%, ${0.45 + val * 0.45})`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();

    const timeData = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(timeData);
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${hue}, ${sat}%, 85%, 0.7)`;
    for (let i = 0; i < timeData.length; i += 1) {
      const x = (i / timeData.length) * width;
      const y = height / 2 + ((timeData[i] - 128) / 128) * height * 0.15;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    particlesRef.current = particlesRef.current.map((particle) => {
      const nextParticle = { ...particle };

      nextParticle.x += nextParticle.vx * (1 + amp * 4);
      nextParticle.y += nextParticle.vy * (1 + amp * 4);
      nextParticle.hue += 0.5 + amp * 3;
      nextParticle.life -= 0.003 + amp * 0.008;

      if (nextParticle.life <= 0 || nextParticle.x < 0 || nextParticle.x > width || nextParticle.y < 0 || nextParticle.y > height) {
        nextParticle.x = width / 2 + (Math.random() - 0.5) * 80;
        nextParticle.y = height / 2 + (Math.random() - 0.5) * 80;
        nextParticle.vx = (Math.random() - 0.5) * 2;
        nextParticle.vy = (Math.random() - 0.5) * 2;
        nextParticle.size = Math.random() * 8 + 2;
        nextParticle.hue = hue + (Math.random() - 0.5) * 60;
        nextParticle.alpha = 0.4 + amp * 0.6;
        nextParticle.life = 0.5 + Math.random() * 0.5;
      }

      ctx.beginPath();
      ctx.arc(nextParticle.x, nextParticle.y, nextParticle.size * (0.5 + amp * 1.5), 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${nextParticle.hue % 360}, ${sat}%, ${Math.min(lit + 30, 90)}%, ${nextParticle.alpha * nextParticle.life})`;
      ctx.fill();

      return nextParticle;
    });

    octx.clearRect(0, 0, overlay.width, overlay.height);
    historyRef.current.forEach((item, index) => {
      octx.fillStyle = `hsla(${item.h}, ${item.s}%, ${Math.min(item.l + 10, 88)}%, ${0.3 + item.amp * 0.7})`;
      octx.fillRect(index, 0, 1.5, overlay.height);
    });

    animRef.current = requestAnimationFrame(() => drawFrameRef.current?.());
  }, [getDominantFreq]);

  useEffect(() => {
    drawFrameRef.current = drawFrame;
  }, [drawFrame]);

  const connectStreamToAnalyser = useCallback((stream, smoothingTimeConstant = 0.82) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = smoothingTimeConstant;
    streamRef.current = stream;
    audioCtxRef.current = audioContext;
    analyserRef.current = analyser;
    audioContext.createMediaStreamSource(stream).connect(analyser);

    setupCanvas();
    setListening(true);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(() => drawFrameRef.current?.());
  }, [setupCanvas]);

  const stopListening = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioElRef.current && audioMode === "file") {
      audioElRef.current.pause();
    } else {
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      mediaSrcRef.current = null;
    }

    analyserRef.current = null;
    setListening(false);
    setIsPlaying(false);
    setCurrentNote(null);
    setCurrentFreq(0);
    setAmplitude(0);
    historyRef.current = [];
  }, [audioMode]);

  const startMic = useCallback(async () => {
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      connectStreamToAnalyser(stream);
    } catch (errorEvent) {
      if (errorEvent.name === "NotAllowedError" || errorEvent.name === "PermissionDeniedError") {
        setError("Microphone access denied. Allow microphone access and try again.");
      } else {
        setError(`Microphone failed: ${errorEvent.message}`);
      }
    }
  }, [connectStreamToAnalyser]);

  const startFilePlayer = useCallback(async (idx) => {
    const targetIdx = idx ?? trackIdx;
    setError(null);

    if (playlist.length === 0) {
      setError("Add at least one audio file first.");
      return;
    }

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioContext = audioCtxRef.current;

    if (!audioContext) {
      audioContext = new AudioContext();
      audioCtxRef.current = audioContext;
    } else if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    let analyser = analyserRef.current;
    if (!analyser) {
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      analyserRef.current = analyser;
    }

    const audio = audioElRef.current;
    audio.src = playlist[targetIdx].url;
    audio.load();

    if (!mediaSrcRef.current) {
      const source = audioContext.createMediaElementSource(audio);
      mediaSrcRef.current = source;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    }

    setupCanvas();
    setTrackIdx(targetIdx);
    setListening(true);
    setIsPlaying(true);
    audio.play().catch((errorEvent) => setError(`Playback failed: ${errorEvent.message}`));
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFrame);
  }, [drawFrame, playlist, setupCanvas, trackIdx]);

  useEffect(() => {
    const audio = audioElRef.current;
    if (!audio) return undefined;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onDuration = () => setDuration(audio.duration);
    const onEnd = () => {
      if (playlist.length > 1) {
        startFilePlayer((trackIdx + 1) % playlist.length);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDuration);
    audio.addEventListener("loadedmetadata", onDuration);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDuration);
      audio.removeEventListener("loadedmetadata", onDuration);
      audio.removeEventListener("ended", onEnd);
    };
  }, [playlist.length, startFilePlayer, trackIdx]);

  useEffect(() => () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((track) => track.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    if (audioElRef.current) audioElRef.current.pause();
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function addFiles(files) {
    const audioFiles = Array.from(files);

    if (audioFiles.length === 0) {
      setError("No files selected. Choose an audio file and try again.");
      return;
    }

    setError(null);
    const tracks = audioFiles.map((file) => {
      const url = URL.createObjectURL(file);
      objectUrlsRef.current.push(url);
      return { name: file.name.replace(/\.[^.]+$/, ""), url };
    });

    setPlaylist((current) => [...current, ...tracks]);
  }

  function removeTrack(index) {
    setPlaylist((current) => {
      URL.revokeObjectURL(current[index].url);
      objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== current[index].url);
      return current.filter((_, itemIndex) => itemIndex !== index);
    });

    if (index === trackIdx && isPlaying) stopListening();
  }

  function togglePlayPause() {
    const audio = audioElRef.current;
    if (!audio) return;

    if (!listening) {
      startFilePlayer(trackIdx);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  }

  function seek(event) {
    const audio = audioElRef.current;
    if (!audio || !Number.isFinite(duration)) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
  }

  const modes = [
    { id: "file", label: "My Songs" },
    { id: "mic", label: "Microphone" },
  ];

  return (
    <div className="min-h-screen rounded-xl border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-6 sm:px-6">
        <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-5 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--primary)]">Sound to Color</p>
              <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)] sm:text-3xl">Chromesthesia Visualizer</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-foreground)]">
                Turn live audio, microphone input, or uploaded songs into frequency-driven color, waveform, and particle visuals.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp((value) => !value)}
              className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)]"
            >
              Help
            </button>
          </div>
        </header>

        {showHelp ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--section-highlight)] p-4 text-sm leading-6 text-[var(--muted-foreground)]">
            <span className="font-semibold text-[var(--primary)]">My Songs</span> visualizes local audio files from your device. <span className="font-semibold text-[var(--primary)]">Microphone</span> listens to nearby sound.
          </section>
        ) : null}

        {!listening ? (
          <nav className="flex flex-wrap gap-2">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setAudioMode(mode.id);
                  setError(null);
                }}
                className={`rounded-md border px-4 py-2 text-sm font-semibold transition ${audioMode === mode.id ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]" : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"}`}
              >
                {mode.label}
              </button>
            ))}
          </nav>
        ) : null}

        {audioMode === "file" ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
            <div
              onDrop={(event) => {
                event.preventDefault();
                setDragOver(false);
                addFiles(event.dataTransfer.files);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${dragOver ? "border-[var(--primary)] bg-[var(--section-highlight)]" : "border-[var(--border)] bg-[var(--background)]"}`}
            >
              <p className="text-sm font-semibold text-[var(--foreground)]">Drop songs here or browse files</p>
              <p className="text-xs text-[var(--muted-foreground)]">Select any audio file your browser can play</p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)]"
              >
                Browse Audio
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(event) => {
                  if (event.target.files?.length) addFiles(event.target.files);
                  event.target.value = "";
                }}
                className="hidden"
              />
            </div>

            {playlist.length > 0 ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)]">
                {playlist.map((track, index) => (
                  <button
                    key={track.url}
                    type="button"
                    onClick={() => {
                      if (!listening || trackIdx !== index) startFilePlayer(index);
                    }}
                    className={`flex w-full items-center gap-3 border-b border-[var(--border)] px-4 py-3 text-left last:border-b-0 ${trackIdx === index && listening ? "bg-[var(--section-highlight)]" : "bg-[var(--background)]"}`}
                  >
                    <span className="w-8 shrink-0 text-right text-xs font-semibold text-[var(--primary)]">{trackIdx === index && isPlaying ? "Playing" : index + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-[var(--foreground)]">{track.name}</span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeTrack(index);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.stopPropagation();
                          removeTrack(index);
                        }
                      }}
                      className="rounded-md px-2 py-1 text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    >
                      Remove
                    </span>
                  </button>
                ))}
              </div>
            ) : null}

            {playlist.length > 0 ? (
              <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--background)] p-4">
                <p className="truncate text-center text-sm font-semibold text-[var(--foreground)]">{playlist[trackIdx]?.name || "No track selected"}</p>
                <div onClick={seek} className="mt-4 h-2 cursor-pointer rounded-full bg-[var(--muted)]">
                  <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-xs text-[var(--muted-foreground)]">
                  <span>{fmtTime(currentTime)}</span>
                  <span>{fmtTime(duration)}</span>
                </div>
                <div className="mt-4 flex justify-center gap-3">
                  <ControlButton onClick={() => startFilePlayer((trackIdx - 1 + playlist.length) % playlist.length)} disabled={playlist.length < 2}>Prev</ControlButton>
                  <button type="button" onClick={togglePlayPause} className="rounded-md bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-[var(--primary-foreground)]">
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <ControlButton onClick={() => startFilePlayer((trackIdx + 1) % playlist.length)} disabled={playlist.length < 2}>Next</ControlButton>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {audioMode === "mic" && !listening ? (
          <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 text-center">
            <h2 className="text-base font-semibold text-[var(--foreground)]">Microphone Input</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--muted-foreground)]">Sing, whistle, speak, or play an instrument nearby.</p>
            <button type="button" onClick={startMic} className="mt-4 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]">
              Begin Listening
            </button>
          </section>
        ) : null}

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-[var(--border)] bg-slate-950">
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
            {!listening ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--section-highlight)] px-4 text-center">
                <p className="text-base font-semibold text-[var(--foreground)]">
                  {audioMode === "file" ? (playlist.length > 0 ? "Press Play to visualize" : "Add songs above") : "Awaiting microphone"}
                </p>
                <p className="mt-2 text-sm text-[var(--muted-foreground)]">The visualizer will react to dominant frequency, amplitude, and waveform shape.</p>
              </div>
            ) : null}
          </div>

          {listening ? (
            <div className="mt-4 flex justify-center">
              <button type="button" onClick={stopListening} className="rounded-md border border-[var(--border)] bg-[var(--background)] px-5 py-2 text-sm font-semibold text-[var(--foreground)] hover:border-[var(--primary)]">
                Stop
              </button>
            </div>
          ) : null}
        </section>

        <section className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 md:grid-cols-4">
          <Stat label="Frequency" value={currentFreq > 0 ? `${currentFreq} Hz` : "-"} color={liveColor} />
          <Stat label="Note" value={currentNote ? `${currentNote.note}${currentNote.octave}` : "-"} color={liveColor} />
          <Stat label="Color" value={currentFreq > 0 ? `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)` : "-"} color={liveColor} />
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
            <div className="mx-auto h-8 w-8 rounded-full border border-[var(--border)]" style={{ background: currentFreq > 0 ? `hsl(${h}, ${s}%, ${Math.min(l + 18, 88)}%)` : "var(--muted)" }} />
            <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Live</div>
          </div>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Chromatic History</h2>
          <div className="h-8 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
            <canvas ref={overlayRef} className="h-full w-full" />
          </div>
          {listening ? (
            <div className="mt-4 h-2 rounded-full bg-[var(--muted)]">
              <div className="h-full rounded-full bg-[var(--primary)] transition-all" style={{ width: `${Math.round(amplitude * 100)}%` }} />
            </div>
          ) : null}
        </section>

        {error ? (
          <section className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </section>
        ) : null}

        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
          <h2 className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">Frequency to Color Map</h2>
          <div className="h-3 rounded-full" style={{ background: "linear-gradient(to right, hsl(0,80%,45%), hsl(60,80%,45%), hsl(120,70%,40%), hsl(180,75%,42%), hsl(240,80%,50%), hsl(300,75%,48%), hsl(330,80%,48%))" }} />
          <div className="mt-2 flex justify-between gap-2 text-[10px] text-[var(--muted-foreground)]">
            {["Sub-bass", "Bass", "Mid", "Upper-mid", "Presence", "Air"].map((label) => <span key={label}>{label}</span>)}
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-sm font-bold text-[var(--foreground)]" style={{ color }}>{value}</p>
    </div>
  );
}

function ControlButton({ onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}
