"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  UploadCloud, X, Play, Pause, Loader2, AlertTriangle,
  Scissors, Settings2, Download, Wand2, Copy, Trash2, ChevronLeft, ChevronRight,
  ZoomIn, ZoomOut, Film, AudioLines,
} from "lucide-react";

// ---------------------------------------------------------------------------
// constants / helpers
// ---------------------------------------------------------------------------

let uid = 0;
const nextId = (p) => `${p}-${Date.now()}-${uid++}`;
const PEAK_COLUMNS = 600;

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const cs = Math.floor((sec % 1) * 100);
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  const ss = String(s).padStart(2, "0");
  const base = h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
  return `${base}.${String(cs).padStart(2, "0")}`;
}
function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const QUALITY_PRESETS = {
  low: { label: "Low", sub: "64 kbps", bitrate: 64000 },
  medium: { label: "Medium", sub: "128 kbps", bitrate: 128000 },
  high: { label: "High", sub: "192 kbps", bitrate: 192000 },
  max: { label: "Max", sub: "256 kbps", bitrate: 256000 },
};
const CAPTURE_MIME_CANDIDATES = ["audio/webm;codecs=opus", "audio/webm"];
const FORMAT_CANDIDATES = {
  webm: ["audio/webm;codecs=opus", "audio/webm"],
  ogg: ["audio/ogg;codecs=opus", "audio/ogg"],
};
function pickMimeType(format) {
  const list = FORMAT_CANDIDATES[format] || FORMAT_CANDIDATES.webm;
  if (typeof MediaRecorder === "undefined") return list[0];
  return list.find((t) => MediaRecorder.isTypeSupported(t)) || list[0];
}
function pickCaptureMime() {
  if (typeof MediaRecorder === "undefined") return CAPTURE_MIME_CANDIDATES[0];
  return CAPTURE_MIME_CANDIDATES.find((t) => MediaRecorder.isTypeSupported(t)) || CAPTURE_MIME_CANDIDATES[0];
}
function extForMime(mime) {
  if (!mime) return "wav";
  if (mime.includes("wav")) return "wav";
  if (mime.includes("ogg")) return "ogg";
  return "webm";
}
function checkBrowserSupport() {
  if (typeof window === "undefined") return { ok: false, reason: "" };
  const hasRecorder = "MediaRecorder" in window;
  const hasAudioCtx = "AudioContext" in window || "webkitAudioContext" in window;
  const hasOffline = "OfflineAudioContext" in window || "webkitOfflineAudioContext" in window;
  if (!hasRecorder || !hasAudioCtx || !hasOffline) {
    return { ok: false, reason: "This browser is missing the Web Audio / MediaRecorder APIs. Try the latest Chrome or Edge." };
  }
  return { ok: true, reason: "" };
}

function computePeaks(buffer, columns) {
  const data = buffer.getChannelData(0);
  const samplesPerCol = Math.max(1, Math.floor(data.length / columns));
  const peaks = new Float32Array(columns * 2);
  for (let i = 0; i < columns; i++) {
    const start = i * samplesPerCol;
    const end = Math.min(data.length, start + samplesPerCol);
    let min = 0, max = 0;
    for (let j = start; j < end; j++) {
      const v = data[j];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    peaks[i * 2] = min;
    peaks[i * 2 + 1] = max;
  }
  return peaks;
}

function audioBufferToWav(buffer) {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const numFrames = buffer.length;
  const dataSize = numFrames * blockAlign;
  const out = new ArrayBuffer(44 + dataSize);
  const view = new DataView(out);
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeStr(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeStr(36, "data");
  view.setUint32(40, dataSize, true);
  const channels = [];
  for (let c = 0; c < numChannels; c++) channels.push(buffer.getChannelData(c));
  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = Math.max(-1, Math.min(1, channels[c][i]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, sample, true);
      offset += 2;
    }
  }
  return new Blob([view], { type: "audio/wav" });
}

// timeline math -------------------------------------------------------------

const clipDur = (c) => Math.max(0, c.outPoint - c.inPoint);
const timelineDuration = (tl) => tl.reduce((acc, c) => acc + clipDur(c), 0);

function findClipAtTime(tl, t) {
  let acc = 0;
  for (let i = 0; i < tl.length; i++) {
    const d = clipDur(tl[i]);
    if (t >= acc + 0.02 && t <= acc + d - 0.02) return { index: i, localOffset: t - acc, clipStart: acc };
    acc += d;
  }
  return null;
}

function computeInsertionIndex(clips, pxPerSec, localX) {
  let cursor = 0;
  for (let i = 0; i < clips.length; i++) {
    const w = clipDur(clips[i]) * pxPerSec;
    if (localX < cursor + w / 2) return i;
    cursor += w;
  }
  return clips.length;
}
function insertionOffsetPx(clips, pxPerSec, insertIndex) {
  let cursor = 0;
  for (let i = 0; i < insertIndex && i < clips.length; i++) cursor += clipDur(clips[i]) * pxPerSec;
  return cursor;
}

// The fade envelope's gain value at clip-relative time `t` (0..dur).
function fadeGainAt(t, dur, fadeIn, fadeOut, gain) {
  const base = Math.max(0, gain);
  const fi = Math.min(fadeIn, dur / 2);
  const fo = Math.min(fadeOut, dur / 2);
  if (fi > 0 && t < fi) return 0.0001 + (base - 0.0001) * (t / fi);
  if (fo > 0 && t > dur - fo) return base - (base - 0.0001) * ((t - (dur - fo)) / fo);
  return base;
}

// Apply a fade/gain envelope to a GainNode for playback (or render) that
// starts at clip-relative time `offset` (0 for the clip's true start) and
// runs to the end of the clip — so scrubbing into the middle of a clip still
// picks up whatever fade-in/fade-out is already in progress at that point,
// instead of jumping straight to flat gain.
function applyFadeAutomation(gainParam, startCtxTime, dur, fadeIn, fadeOut, gain, offset = 0) {
  const base = Math.max(0, gain);
  const fi = Math.min(fadeIn, dur / 2);
  const fo = Math.min(fadeOut, dur / 2);
  gainParam.cancelScheduledValues(startCtxTime);
  gainParam.setValueAtTime(fadeGainAt(offset, dur, fadeIn, fadeOut, gain), startCtxTime);
  if (fi > 0 && offset < fi) {
    gainParam.linearRampToValueAtTime(base, startCtxTime + (fi - offset));
  }
  if (fo > 0) {
    if (offset < dur - fo) {
      gainParam.setValueAtTime(base, startCtxTime + (dur - fo - offset));
    }
    gainParam.linearRampToValueAtTime(0.0001, startCtxTime + (dur - offset));
  }
}

async function renderTimelineToBuffer(timeline, sources) {
  const total = timelineDuration(timeline);
  if (total <= 0) return null;
  // Derive sample rate / channel count only from sources actually referenced
  // by the timeline (and only those that finished decoding), not the whole
  // media pool — a source still decoding/extracting or one that failed has
  // audioBuffer === null, and mixing it into this calculation either throws
  // or picks a sample rate unrelated to what's really on the timeline.
  const usedSourceIds = new Set(timeline.map((clip) => clip.sourceId));
  const readyUsedSources = sources.filter((s) => usedSourceIds.has(s.id) && s.audioBuffer);
  if (readyUsedSources.length === 0) return null;
  const sr = readyUsedSources[0].audioBuffer.sampleRate || 44100;
  const channels = Math.max(1, ...readyUsedSources.map((s) => s.audioBuffer.numberOfChannels));
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const offline = new OfflineCtx(channels, Math.max(1, Math.ceil(total * sr)), sr);
  let cursor = 0;
  for (const clip of timeline) {
    const dur = clipDur(clip);
    if (dur <= 0) continue;
    const source = sources.find((s) => s.id === clip.sourceId);
    if (!source || !source.audioBuffer) {
      // Leave a silent gap instead of shifting every later clip earlier.
      cursor += dur;
      continue;
    }
    const srcNode = offline.createBufferSource();
    srcNode.buffer = source.audioBuffer;
    const gainNode = offline.createGain();
    srcNode.connect(gainNode);
    gainNode.connect(offline.destination);
    applyFadeAutomation(gainNode.gain, cursor, dur, clip.fadeIn, clip.fadeOut, clip.gain);
    srcNode.start(cursor, clip.inPoint, dur);
    cursor += dur;
  }
  return offline.startRendering();
}

// ---------------------------------------------------------------------------
// Live oscilloscope — shown while a video's audio is being captured
// ---------------------------------------------------------------------------

function Scope({ analyser, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (!active || !analyser) { rafRef.current = requestAnimationFrame(draw); return; }
      const bufferLength = analyser.fftSize;
      const data = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(data);
      ctx.lineWidth = 2 * dpr;
      ctx.strokeStyle = "#F5A93F";
      ctx.shadowColor = "rgba(245,169,63,0.55)";
      ctx.shadowBlur = 6 * dpr;
      ctx.beginPath();
      const slice = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = data[i] / 128.0;
        const y = (v * h) / 2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += slice;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [active, analyser]);
  return <canvas ref={canvasRef} className="scope-canvas" />;
}

// ---------------------------------------------------------------------------
// Pool waveform — small static preview for a source in the media pool
// ---------------------------------------------------------------------------

function PoolWaveform({ peaks }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const w = canvas.width, h = canvas.height, mid = h / 2;
    ctx.clearRect(0, 0, w, h);
    const cols = peaks.length / 2;
    const colW = w / cols;
    ctx.fillStyle = "rgba(140,163,166,0.55)";
    for (let i = 0; i < cols; i++) {
      const min = peaks[i * 2], max = peaks[i * 2 + 1];
      const y1 = mid + min * mid * 0.9;
      const y2 = mid + max * mid * 0.9;
      ctx.fillRect(i * colW, y2, Math.max(1, colW - 0.5 * dpr), Math.max(1, y1 - y2));
    }
  }, [peaks]);
  return <canvas ref={canvasRef} className="pool-wave-canvas" />;
}

// ---------------------------------------------------------------------------
// Timeline clip block — waveform slice, trim handles, drag-to-reorder
// ---------------------------------------------------------------------------

function TimelineClip({
  clip, source, index, isLast, pxPerSec, selected, isTrimmingThis, isDraggingThis, isRemoving,
  onSelect, onTrim, onTrimStart, onTrimEnd, onDragStart, onDragMove, onDragEnd,
}) {
  const canvasRef = useRef(null);
  const dragEdge = useRef(null);
  const dragStart = useRef({ x: 0, val: 0 });
  const bodyDrag = useRef({ active: false, moved: false, startX: 0 });
  const width = Math.max(28, clipDur(clip) * pxPerSec);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !source?.peaks) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, width * dpr);
    canvas.height = 76 * dpr;
    const w = canvas.width, h = canvas.height, mid = h / 2;
    ctx.clearRect(0, 0, w, h);
    const totalCols = source.peaks.length / 2;
    const colStart = Math.floor((clip.inPoint / source.duration) * totalCols);
    const colEnd = Math.max(colStart + 1, Math.floor((clip.outPoint / source.duration) * totalCols));
    const visibleCols = colEnd - colStart;
    const colW = w / visibleCols;
    ctx.fillStyle = selected ? "rgba(63,219,196,0.95)" : "rgba(245,169,63,0.75)";
    for (let i = 0; i < visibleCols; i++) {
      const srcCol = colStart + i;
      const min = source.peaks[srcCol * 2] || 0;
      const max = source.peaks[srcCol * 2 + 1] || 0;
      const y1 = mid + min * mid * 0.92;
      const y2 = mid + max * mid * 0.92;
      ctx.fillRect(i * colW, y2, Math.max(1, colW - 0.4 * dpr), Math.max(1, y1 - y2));
    }
    const dur = clipDur(clip);
    if (clip.fadeIn > 0) {
      const fw = (Math.min(clip.fadeIn, dur / 2) / dur) * w;
      const grad = ctx.createLinearGradient(0, 0, fw, 0);
      grad.addColorStop(0, "rgba(11,17,20,0.85)");
      grad.addColorStop(1, "rgba(11,17,20,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, fw, h);
    }
    if (clip.fadeOut > 0) {
      const fw = (Math.min(clip.fadeOut, dur / 2) / dur) * w;
      const grad = ctx.createLinearGradient(w - fw, 0, w, 0);
      grad.addColorStop(0, "rgba(11,17,20,0)");
      grad.addColorStop(1, "rgba(11,17,20,0.85)");
      ctx.fillStyle = grad;
      ctx.fillRect(w - fw, 0, fw, h);
    }
  }, [clip, source, width, selected]);

  const onPointerDownEdge = (e, edge) => {
    e.stopPropagation();
    dragEdge.current = edge;
    dragStart.current = { x: e.clientX, val: edge === "in" ? clip.inPoint : clip.outPoint };
    onTrimStart(clip.id);
    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
  };
  const onBodyPointerDown = (e) => {
    bodyDrag.current = { active: true, moved: false, startX: e.clientX };
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (dragEdge.current) {
      const dt = (e.clientX - dragStart.current.x) / pxPerSec;
      if (dragEdge.current === "in") {
        const newIn = Math.min(Math.max(0, dragStart.current.val + dt), clip.outPoint - 0.05);
        onTrim(clip.id, newIn, clip.outPoint);
      } else {
        const newOut = Math.max(Math.min(source.duration, dragStart.current.val + dt), clip.inPoint + 0.05);
        onTrim(clip.id, clip.inPoint, newOut);
      }
      return;
    }
    if (bodyDrag.current.active) {
      const dx = e.clientX - bodyDrag.current.startX;
      if (!bodyDrag.current.moved && Math.abs(dx) > 6) {
        bodyDrag.current.moved = true;
        onDragStart(clip.id);
      }
      if (bodyDrag.current.moved) onDragMove(e.clientX);
    }
  };
  const onPointerUp = () => {
    if (dragEdge.current) { dragEdge.current = null; onTrimEnd(); return; }
    if (bodyDrag.current.active) {
      if (bodyDrag.current.moved) onDragEnd();
      else onSelect(clip.id);
      bodyDrag.current = { active: false, moved: false, startX: 0 };
    }
  };

  const classes = ["tl-clip-wrap"];
  if (isRemoving) classes.push("removing");
  if (isDraggingThis) classes.push("dragging");

  return (
    <div className={classes.join(" ")} style={{ width, transition: isTrimmingThis ? "none" : undefined }}>
      <div
        className={`tl-clip ${selected ? "selected" : ""}`}
        onPointerDown={onBodyPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <canvas ref={canvasRef} className="tl-clip-canvas" />
        <div className="tl-clip-label">{index + 1}</div>
        <div className="tl-handle left" onPointerDown={(event) => onPointerDownEdge(event, "in")} />
        <div className="tl-handle right" onPointerDown={(event) => onPointerDownEdge(event, "out")} />
      </div>
      {!isLast && <div className="tl-splice" />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SpliceDeck() {
  const [sources, setSources] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [removingClipIds, setRemovingClipIds] = useState(() => new Set());
  const [selectedClipId, setSelectedClipId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [support] = useState(checkBrowserSupport());
  const [pxPerSec, setPxPerSec] = useState(80);

  const [playheadTime, setPlayheadTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [trimmingClipId, setTrimmingClipId] = useState(null);
  const [reorderClipId, setReorderClipId] = useState(null);
  const [reorderInsertIndex, setReorderInsertIndex] = useState(null);

  const [quality, setQuality] = useState("high");
  const [exportFormat, setExportFormat] = useState("wav");
  const [exportStatus, setExportStatus] = useState("idle"); // idle | rendering | encoding | done | error
  const [exportProgress, setExportProgress] = useState(0);
  const [exportError, setExportError] = useState("");
  const [outputURL, setOutputURL] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [outputMime, setOutputMime] = useState("");
  // Mirrors outputURL for the unmount-cleanup effect below, which only runs
  // once and would otherwise close over the initial (empty) value.
  const outputURLRef = useRef("");
  useEffect(() => {
    outputURLRef.current = outputURL;
  }, [outputURL]);
  const [analysers, setAnalysers] = useState({});

  const videoRefs = useRef({});
  const captureBundles = useRef({});
  const captureWaitTimers = useRef({});
  const fileInputRef = useRef(null);
  const timelineScrollRef = useRef(null);
  const trackRef = useRef(null);

  const playStateRef = useRef(null); // { ctx, nodes, startCtxTime, fromTime }
  const rafRef = useRef(null);
  const actionsRef = useRef({});

  const totalDuration = timelineDuration(timeline);

  useEffect(() => {
    return () => {
      sources.forEach((s) => s.url && URL.revokeObjectURL(s.url));
      stopPlayback();
      if (outputURLRef.current) URL.revokeObjectURL(outputURLRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSource = useCallback((id, patch) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  // -- upload & decode -------------------------------------------------------

  const addFiles = useCallback((fileList) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("video/") || f.type.startsWith("audio/"));
    if (files.length === 0) return;
    const newSources = files.map((file) => ({
      id: nextId("src"),
      file,
      name: file.name,
      size: file.size,
      kind: file.type.startsWith("video/") ? "video" : "audio",
      url: URL.createObjectURL(file),
      duration: 0,
      status: "idle",
      progress: 0,
      error: "",
      audioBuffer: null,
      peaks: null,
    }));
    setSources((prev) => [...prev, ...newSources]);
    newSources.forEach((s) => decodeSource(s));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const decodeSource = useCallback(async (source) => {
    updateSource(source.id, { status: "decoding", progress: 0, error: "" });
    try {
      const buf = await source.file.arrayBuffer();
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const audioBuffer = await ctx.decodeAudioData(buf);
      ctx.close();
      const peaks = computePeaks(audioBuffer, PEAK_COLUMNS);
      updateSource(source.id, { status: "ready", progress: 100, audioBuffer, peaks, duration: audioBuffer.duration });
    } catch (err) {
      if (source.kind === "video") captureFromVideo(source);
      else updateSource(source.id, { status: "error", error: "This audio file could not be decoded." });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateSource]);

  const captureFromVideo = useCallback((source) => {
    updateSource(source.id, { status: "extracting", progress: 0, error: "" });
    // A mutable cancellation token: removeSource() flips `cancelled` and
    // clears the pending timer so this metadata-wait poll stops instead of
    // rescheduling itself forever once the source (and its <video> ref) is
    // gone or never finishes loading metadata.
    const waitState = { cancelled: false, timer: null };
    captureWaitTimers.current[source.id] = waitState;
    const wait = () => {
      if (waitState.cancelled) return;
      const video = videoRefs.current[source.id];
      if (!video || !video.duration) {
        waitState.timer = setTimeout(wait, 60);
        return;
      }
      if (captureWaitTimers.current[source.id] === waitState) delete captureWaitTimers.current[source.id];
      try {
        let bundle = captureBundles.current[source.id];
        if (!bundle) {
          const AC = window.AudioContext || window.webkitAudioContext;
          const audioCtx = new AC();
          const sourceNode = audioCtx.createMediaElementSource(video);
          bundle = { audioCtx, sourceNode };
          captureBundles.current[source.id] = bundle;
        }
        const { audioCtx, sourceNode } = bundle;
        audioCtx.resume();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 1024;
        const dest = audioCtx.createMediaStreamDestination();
        sourceNode.connect(analyser);
        analyser.connect(dest);
        setAnalysers((current) => ({ ...current, [source.id]: analyser }));

        const mimeType = pickCaptureMime();
        const recorder = new MediaRecorder(dest.stream, { mimeType, audioBitsPerSecond: 256000 });
        const chunks = [];
        recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };

        const cleanup = () => {
          video.ontimeupdate = null;
          video.onended = null;
          analyser.disconnect();
          setAnalysers((current) => {
            const next = { ...current };
            delete next[source.id];
            return next;
          });
        };
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: mimeType });
          if (blob.size < 300) { updateSource(source.id, { status: "error", error: "No audio track found in this video." }); return; }
          try {
            const arrayBuf = await blob.arrayBuffer();
            const DecodeAC = window.AudioContext || window.webkitAudioContext;
            const decodeCtx = new DecodeAC();
            const audioBuffer = await decodeCtx.decodeAudioData(arrayBuf);
            decodeCtx.close();
            const peaks = computePeaks(audioBuffer, PEAK_COLUMNS);
            updateSource(source.id, { status: "ready", progress: 100, audioBuffer, peaks, duration: audioBuffer.duration });
          } catch (err) {
            updateSource(source.id, { status: "error", error: "Could not decode the captured audio." });
          }
        };
        const finish = () => { cleanup(); video.pause(); if (recorder.state !== "inactive") recorder.stop(); };
        video.ontimeupdate = () => {
          updateSource(source.id, { progress: Math.min(100, (video.currentTime / video.duration) * 100) });
          if (video.currentTime >= video.duration - 0.05) finish();
        };
        video.onended = finish;
        video.muted = false;
        video.currentTime = 0;
        const begin = () => { recorder.start(250); video.play().catch(() => updateSource(source.id, { status: "error", error: "Playback was blocked by the browser." })); };
        if (video.currentTime < 0.05) begin();
        else video.onseeked = () => { video.onseeked = null; begin(); };
      } catch (err) {
        updateSource(source.id, { status: "error", error: err && err.message ? err.message : "Extraction failed." });
      }
    };
    wait();
  }, [updateSource]);

  const removeSource = (id) => {
    setSources((prev) => {
      const s = prev.find((x) => x.id === id);
      if (s && s.url) URL.revokeObjectURL(s.url);
      return prev.filter((x) => x.id !== id);
    });
    setTimeline((prev) => prev.filter((c) => c.sourceId !== id));
    delete videoRefs.current[id];
    const pendingWait = captureWaitTimers.current[id];
    if (pendingWait) {
      pendingWait.cancelled = true;
      if (pendingWait.timer) clearTimeout(pendingWait.timer);
      delete captureWaitTimers.current[id];
    }
    const bundle = captureBundles.current[id];
    if (bundle && bundle.audioCtx) bundle.audioCtx.close().catch(() => {});
    delete captureBundles.current[id];
    setAnalysers((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  // -- timeline editing -------------------------------------------------------

  const addToTimeline = (sourceId) => {
    const source = sources.find((s) => s.id === sourceId);
    if (!source || !source.audioBuffer) return;
    const clip = { id: nextId("clip"), sourceId, inPoint: 0, outPoint: source.audioBuffer.duration, fadeIn: 0, fadeOut: 0, gain: 1 };
    setTimeline((prev) => [...prev, clip]);
    setSelectedClipId(clip.id);
    requestAnimationFrame(() => {
      if (timelineScrollRef.current) timelineScrollRef.current.scrollTo({ left: timelineScrollRef.current.scrollWidth, behavior: "smooth" });
    });
  };

  const trimClip = (clipId, newIn, newOut) => {
    setTimeline((prev) => prev.map((c) => (c.id === clipId ? { ...c, inPoint: newIn, outPoint: newOut } : c)));
  };
  const patchClip = (clipId, patch) => {
    setTimeline((prev) => prev.map((c) => (c.id === clipId ? { ...c, ...patch } : c)));
  };
  const deleteClip = (clipId) => {
    if (!timeline.some((c) => c.id === clipId)) return;
    setSelectedClipId((cur) => (cur === clipId ? null : cur));
    setRemovingClipIds((prev) => new Set(prev).add(clipId));
    setTimeout(() => {
      setTimeline((prev) => prev.filter((c) => c.id !== clipId));
      setRemovingClipIds((prev) => { const n = new Set(prev); n.delete(clipId); return n; });
    }, 190);
  };
  const duplicateClip = (clipId) => {
    setTimeline((prev) => {
      const idx = prev.findIndex((c) => c.id === clipId);
      if (idx === -1) return prev;
      const copy = { ...prev[idx], id: nextId("clip") };
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
  };
  const moveClip = (clipId, dir) => {
    setTimeline((prev) => {
      const idx = prev.findIndex((c) => c.id === clipId);
      const swapWith = idx + dir;
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      return next;
    });
  };
  const splitAtPlayhead = () => {
    const hit = findClipAtTime(timeline, playheadTime);
    if (!hit) return;
    const clip = timeline[hit.index];
    const cutSourceTime = clip.inPoint + hit.localOffset;
    const first = { ...clip, outPoint: cutSourceTime, fadeOut: 0 };
    const second = { ...clip, id: nextId("clip"), inPoint: cutSourceTime, fadeIn: 0 };
    setTimeline((prev) => {
      const next = [...prev];
      next.splice(hit.index, 1, first, second);
      return next;
    });
    setSelectedClipId(second.id);
  };
  const clearTimeline = () => {
    if (timeline.length === 0) return;
    if (!window.confirm("Clear the entire timeline? This removes every clip, trim, split and fade you've set up.")) return;
    setTimeline([]);
    setSelectedClipId(null);
    stopPlayback();
    setPlayheadTime(0);
  };

  // -- drag to reorder ---------------------------------------------------------

  const handleClipDragStart = (clipId) => { setReorderClipId(clipId); };
  const handleClipDragMove = (clientX) => {
    if (!trackRef.current || !reorderClipId) return;
    const rect = trackRef.current.getBoundingClientRect();
    const localX = clientX - rect.left;
    const others = timeline.filter((c) => c.id !== reorderClipId);
    setReorderInsertIndex(computeInsertionIndex(others, pxPerSec, localX));
  };
  const handleClipDragEnd = () => {
    setTimeline((prev) => {
      if (!reorderClipId || reorderInsertIndex === null) return prev;
      const dragged = prev.find((c) => c.id === reorderClipId);
      if (!dragged) return prev;
      const others = prev.filter((c) => c.id !== reorderClipId);
      others.splice(reorderInsertIndex, 0, dragged);
      return others;
    });
    setReorderClipId(null);
    setReorderInsertIndex(null);
  };

  // -- playback ---------------------------------------------------------------

  const stopPlayback = () => {
    const st = playStateRef.current;
    if (st) {
      st.nodes.forEach((n) => { try { n.stop(); } catch (e) {} });
      if (st.ctx) st.ctx.close().catch(() => {});
    }
    playStateRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsPlaying(false);
  };

  const playFrom = (fromTime) => {
    stopPlayback();
    if (timeline.length === 0) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    const ctx = new AC();
    const startCtxTime = ctx.currentTime + 0.06;
    let cursor = 0;
    const nodes = [];
    for (const clip of timeline) {
      const dur = clipDur(clip);
      const clipStart = cursor;
      const clipEnd = cursor + dur;
      cursor = clipEnd;
      if (clipEnd <= fromTime + 0.01) continue;
      const source = sources.find((s) => s.id === clip.sourceId);
      if (!source) continue;
      const offsetInClip = Math.max(0, fromTime - clipStart);
      const playDur = dur - offsetInClip;
      if (playDur <= 0.005) continue;
      const when = startCtxTime + Math.max(0, clipStart - fromTime);
      const srcNode = ctx.createBufferSource();
      srcNode.buffer = source.audioBuffer;
      const gainNode = ctx.createGain();
      srcNode.connect(gainNode);
      gainNode.connect(ctx.destination);
      applyFadeAutomation(gainNode.gain, when, dur, clip.fadeIn, clip.fadeOut, clip.gain, offsetInClip);
      srcNode.start(when, clip.inPoint + offsetInClip, playDur);
      nodes.push(srcNode);
    }
    playStateRef.current = { ctx, nodes, startCtxTime, fromTime };
    setIsPlaying(true);
    const tick = () => {
      const st = playStateRef.current;
      if (!st) return;
      const t = st.ctx.currentTime - st.startCtxTime + st.fromTime;
      if (t >= totalDuration) { setPlayheadTime(totalDuration); stopPlayback(); return; }
      setPlayheadTime(Math.max(0, t));
      const el = timelineScrollRef.current;
      if (el) {
        const px = Math.max(0, t) * pxPerSec;
        const viewLeft = el.scrollLeft;
        const viewRight = viewLeft + el.clientWidth;
        if (px < viewLeft + 30 || px > viewRight - 60) el.scrollLeft = Math.max(0, px - el.clientWidth * 0.25);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const togglePlay = () => {
    if (isPlaying) { stopPlayback(); return; }
    playFrom(playheadTime >= totalDuration - 0.02 ? 0 : playheadTime);
  };
  const seekTo = (t) => {
    const clamped = Math.max(0, Math.min(totalDuration, t));
    setPlayheadTime(clamped);
    if (isPlaying) playFrom(clamped);
  };

  const rulerDrag = useRef(false);
  const seekFromClientX = (clientX, el) => {
    const rect = el.getBoundingClientRect();
    seekTo((clientX - rect.left) / pxPerSec);
  };
  const onRulerPointerDown = (e) => {
    rulerDrag.current = true;
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
    seekFromClientX(e.clientX, e.currentTarget);
  };
  const onRulerPointerMove = (e) => { if (rulerDrag.current) seekFromClientX(e.clientX, e.currentTarget); };
  const onRulerPointerUp = () => { rulerDrag.current = false; };

  // -- keyboard shortcuts -------------------------------------------------

  useEffect(() => {
    actionsRef.current = { togglePlay, deleteClip, seekTo, playheadTime, selectedClipId, totalDuration };
  });
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      const a = actionsRef.current;
      if (e.code === "Space") { e.preventDefault(); a.togglePlay(); }
      else if ((e.key === "Delete" || e.key === "Backspace") && a.selectedClipId) { e.preventDefault(); a.deleteClip(a.selectedClipId); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); a.seekTo(a.playheadTime - (e.shiftKey ? 5 : 1)); }
      else if (e.key === "ArrowRight") { e.preventDefault(); a.seekTo(Math.min(a.totalDuration, a.playheadTime + (e.shiftKey ? 5 : 1))); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // -- export -------------------------------------------------------------

  const finalizeExport = (blob, mime) => {
    setOutputURL((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
    setOutputSize(blob.size);
    setOutputMime(mime);
    setExportStatus("done");
    setExportProgress(100);
  };

  const recordBufferRealtime = (buffer, format) =>
    new Promise((resolve) => {
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const dest = ctx.createMediaStreamDestination();
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.connect(dest);
      const mimeType = pickMimeType(format);
      const recorder = new MediaRecorder(dest.stream, { mimeType, audioBitsPerSecond: QUALITY_PRESETS[quality].bitrate });
      const chunks = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => { finalizeExport(new Blob(chunks, { type: mimeType }), mimeType); ctx.close(); resolve(); };
      const dur = buffer.duration || 0.01;
      const start = performance.now();
      const tick = () => {
        const elapsed = (performance.now() - start) / 1000;
        setExportProgress(Math.min(100, (elapsed / dur) * 100));
        if (elapsed < dur) requestAnimationFrame(tick);
      };
      recorder.start();
      src.start();
      requestAnimationFrame(tick);
      src.onended = () => recorder.stop();
    });

  const runExport = async () => {
    if (timeline.length === 0) return;
    stopPlayback();
    setExportStatus("rendering");
    setExportProgress(0);
    setExportError("");
    try {
      const rendered = await renderTimelineToBuffer(timeline, sources);
      if (!rendered) throw new Error("Nothing to render.");
      if (exportFormat === "wav") finalizeExport(audioBufferToWav(rendered), "audio/wav");
      else { setExportStatus("encoding"); await recordBufferRealtime(rendered, exportFormat); }
    } catch (err) {
      setExportStatus("error");
      setExportError(err && err.message ? err.message : "Export failed. Try again.");
    }
  };

  const downloadOutput = () => {
    if (!outputURL) return;
    const ext = extForMime(outputMime);
    const a = document.createElement("a");
    a.href = outputURL;
    a.download = `splice-deck-mix.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // -- drag & drop upload -------------------------------------------------

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  const selectedClip = timeline.find((c) => c.id === selectedClipId) || null;
  const selectedSource = selectedClip ? sources.find((s) => s.id === selectedClip.sourceId) : null;
  const contentWidth = Math.max(totalDuration * pxPerSec, 60);
  const insertIndicatorPx = reorderClipId !== null && reorderInsertIndex !== null
    ? insertionOffsetPx(timeline.filter((c) => c.id !== reorderClipId), pxPerSec, reorderInsertIndex)
    : null;

  return (
    <div className="w-full min-h-full flex justify-center p-4 sm:p-8" style={{ background: "var(--bg-void)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .sd-root, .sd-root * { box-sizing: border-box; }
        .sd-root {
          --bg-void: #0E1417; --bg-panel: #161F23; --bg-panel-raised: #1C272C; --hairline: #2A3438;
          --amber: #F5A93F; --teal: #3FDBC4; --red: #FF6E62; --text-primary: #ECF3F2; --text-muted: #8CA3A6;
          font-family: 'Inter', sans-serif; color: var(--text-primary);
        }
        .sd-display { font-family: 'Space Grotesk', sans-serif; }
        .sd-mono { font-family: 'JetBrains Mono', monospace; }
        .deck { background: linear-gradient(180deg, var(--bg-panel) 0%, #131B1F 100%); border: 1px solid var(--hairline); border-radius: 20px; box-shadow: 0 30px 60px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.03); }
        .rivet { width: 6px; height: 6px; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #45545a, #0d1315 75%); box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4); }
        .drop-slot { border: 1.5px dashed var(--hairline); border-radius: 14px; background: repeating-linear-gradient(135deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 10px, transparent 10px, transparent 20px), var(--bg-panel-raised); transition: border-color .2s ease, background-color .2s ease, transform .15s ease; }
        .drop-slot.active { border-color: var(--amber); background-color: rgba(245,169,63,0.07); transform: scale(1.004); }
        .pool-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 10px; }
        .pool-card { background: var(--bg-panel-raised); border: 1px solid var(--hairline); border-radius: 12px; padding: 10px; animation: cardEnter .28s cubic-bezier(.16,1,.3,1); transition: border-color .15s ease, transform .15s ease; }
        .pool-card:hover { border-color: rgba(245,169,63,0.35); transform: translateY(-1px); }
        .pool-wave-canvas { width: 100%; height: 34px; display: block; border-radius: 6px; background: #0B1114; }
        .scope-canvas { width: 100%; height: 34px; display: block; border-radius: 6px; background: #0B1114; }
        .btn-primary { background: linear-gradient(180deg, #FFC069 0%, var(--amber) 100%); color: #1A1206; font-weight: 600; border-radius: 10px; transition: filter .15s ease, transform .1s ease; }
        .btn-primary:hover:not(:disabled) { filter: brightness(1.08); }
        .btn-primary:active:not(:disabled) { transform: scale(0.95); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .btn-primary.playing { animation: playPulse 1.8s ease-in-out infinite; }
        .btn-ghost { background: transparent; border: 1px solid var(--hairline); color: var(--text-primary); border-radius: 10px; transition: border-color .15s ease, background-color .15s ease, transform .1s ease; }
        .btn-ghost:hover:not(:disabled) { border-color: var(--teal); background: rgba(63,219,196,0.06); }
        .btn-ghost:active:not(:disabled) { transform: scale(0.96); }
        .btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }
        .btn-icon { border-radius: 8px; color: var(--text-muted); transition: color .15s ease, background-color .15s ease, transform .1s ease; }
        .btn-icon:hover:not(:disabled) { color: var(--text-primary); background: rgba(255,255,255,0.05); }
        .btn-icon:active:not(:disabled) { transform: scale(0.9); }
        .btn-icon:disabled { opacity: 0.3; cursor: not-allowed; }
        .seg { background: var(--bg-panel-raised); border: 1px solid var(--hairline); border-radius: 10px; padding: 2px; display: inline-flex; gap: 2px; }
        .seg-btn { padding: 6px 12px; border-radius: 8px; font-size: 12.5px; font-weight: 500; color: var(--text-muted); transition: background-color .15s ease, color .15s ease; }
        .seg-btn.active { background: var(--hairline); color: var(--text-primary); }
        .seg-btn.small { padding: 5px 9px; font-size: 11.5px; }
        .progress-rail { height: 6px; border-radius: 999px; background: var(--hairline); overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--teal), var(--amber)); border-radius: 999px; transition: width .12s linear; }
        input[type=range].plain { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 999px; background: var(--hairline); width: 100%; }
        input[type=range].plain::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--teal); cursor: pointer; border: 2px solid #0E1417; margin-top: -5px; transition: transform .12s ease; }
        input[type=range].plain:active::-webkit-slider-thumb { transform: scale(1.2); }
        input[type=range].plain::-moz-range-thumb { width: 14px; height: 14px; border-radius: 50%; background: var(--teal); border: 2px solid #0E1417; cursor: pointer; transition: transform .12s ease; }

        .timeline-panel { background: var(--bg-panel-raised); border: 1px solid var(--hairline); border-radius: 14px; }
        .timeline-scroll { overflow-x: auto; position: relative; scrollbar-width: thin; }
        .timeline-content { position: relative; }
        .ruler { position: relative; height: 20px; cursor: pointer; background: repeating-linear-gradient(90deg, var(--hairline) 0, var(--hairline) 1px, transparent 1px, transparent 100%); touch-action: none; }
        .playhead { position: absolute; top: 0; bottom: 0; left: 0; width: 2px; background: var(--red); box-shadow: 0 0 8px rgba(255,110,98,0.7); pointer-events: none; z-index: 8; will-change: transform; }
        .playhead-flag { position: absolute; top: -1px; width: 9px; height: 9px; background: var(--red); border-radius: 2px 2px 2px 0; transform: translateX(-3.5px) rotate(45deg); box-shadow: 0 0 6px rgba(255,110,98,0.8); }

        .tl-track { position: relative; display: flex; align-items: stretch; min-height: 92px; padding: 8px 0; }
        .tl-clip-wrap { display: flex; align-items: stretch; flex-shrink: 0; animation: clipEnter .24s cubic-bezier(.16,1,.3,1); transition: width .16s cubic-bezier(.2,.7,.3,1); }
        .tl-clip-wrap.removing { animation: clipExit .18s ease forwards; pointer-events: none; }
        .tl-clip-wrap.dragging { opacity: 0.5; transform: scale(1.035) translateY(-4px); z-index: 25; filter: drop-shadow(0 10px 18px rgba(0,0,0,0.55)); transition: none; }
        .tl-clip { position: relative; flex: 1; height: 76px; border-radius: 8px; overflow: hidden; background: #0B1114; border: 1.5px solid var(--hairline); cursor: grab; touch-action: none; transition: border-color .15s ease, box-shadow .15s ease; }
        .tl-clip:active { cursor: grabbing; }
        .tl-clip.selected { border-color: var(--teal); box-shadow: 0 0 0 1px var(--teal), 0 0 14px rgba(63,219,196,0.25); }
        .tl-clip-canvas { width: 100%; height: 100%; display: block; pointer-events: none; }
        .tl-clip-label { position: absolute; top: 3px; left: 5px; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: rgba(236,243,242,0.55); background: rgba(0,0,0,0.35); padding: 1px 4px; border-radius: 4px; pointer-events: none; }
        .tl-handle { position: absolute; top: 0; bottom: 0; width: 9px; cursor: ew-resize; background: linear-gradient(180deg, #FFC069, var(--amber)); opacity: 0.88; transition: opacity .15s ease, width .12s ease; }
        .tl-handle:hover { opacity: 1; width: 12px; }
        .tl-handle.left { left: 0; border-radius: 0 4px 4px 0; }
        .tl-handle.right { right: 0; border-radius: 4px 0 0 4px; }
        .tl-splice { width: 10px; flex-shrink: 0; position: relative; }
        .tl-splice::before { content: ""; position: absolute; top: 4px; bottom: 4px; left: 4px; width: 2px; background: repeating-linear-gradient(180deg, var(--amber) 0, var(--amber) 3px, transparent 3px, transparent 6px); opacity: 0.65; }
        .tl-insert-indicator { position: absolute; top: 4px; bottom: 4px; width: 3px; background: var(--teal); box-shadow: 0 0 10px rgba(63,219,196,0.85); border-radius: 2px; z-index: 20; pointer-events: none; }

        .inspector { background: var(--bg-panel); border: 1px solid var(--hairline); border-radius: 12px; animation: panelEnter .2s ease; }
        .chip { display: inline-flex; align-items: center; gap: 5px; padding: 5px 9px; border-radius: 8px; background: var(--bg-panel); border: 1px solid var(--hairline); font-size: 11.5px; color: var(--text-muted); }
        .sd-root :focus-visible { outline: 2px solid var(--teal); outline-offset: 2px; }

        @keyframes cardEnter { from { opacity: 0; transform: translateY(5px) scale(0.98); } to { opacity: 1; transform: none; } }
        @keyframes clipEnter { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes clipExit { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.82); } }
        @keyframes panelEnter { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @keyframes playPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(245,169,63,0.35); } 50% { box-shadow: 0 0 0 6px rgba(245,169,63,0); } }

        @media (prefers-reduced-motion: reduce) {
          .btn-primary, .btn-ghost, .btn-icon, .progress-fill, .tl-clip-wrap, .drop-slot, .pool-card { transition: none !important; animation: none !important; }
        }
      `}</style>

      <div className="sd-root w-full max-w-4xl">
        {sources.filter((s) => s.kind === "video").map((s) => (
          <video key={s.id} ref={(el) => { if (el) videoRefs.current[s.id] = el; }} src={s.url} playsInline
            style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none", zIndex: -1 }} />
        ))}

        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--bg-panel-raised)", border: "1px solid var(--hairline)" }}>
              <Scissors size={16} style={{ color: "var(--amber)" }} />
            </div>
            <div>
              <h1 className="sd-display text-[17px] font-semibold leading-tight">Splice Deck</h1>
              <p className="sd-mono text-[10.5px] tracking-wider uppercase" style={{ color: "var(--text-muted)" }}>
                multi-clip audio editor — cut, splice, mix
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 sd-mono text-[10.5px]" style={{ color: "var(--text-muted)" }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--teal)" }} />
            files never leave this tab
          </div>
        </div>

        {!support.ok && (
          <div className="mb-4 px-4 py-3 rounded-xl flex items-start gap-2.5" style={{ background: "rgba(255,110,98,0.08)", border: "1px solid rgba(255,110,98,0.3)" }}>
            <AlertTriangle size={16} className="mt-0.5 shrink-0" style={{ color: "var(--red)" }} />
            <p className="text-[13px]">{support.reason}</p>
          </div>
        )}

        <div className="deck p-4 sm:p-6">
          <div className="hidden sm:flex justify-between mb-4 px-0.5">
            <div className="flex gap-1.5"><div className="rivet" /><div className="rivet" /></div>
            <div className="sd-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: "var(--text-muted)" }}>client-side editor</div>
          </div>

          {/* ---- media pool ---- */}
          <div
            className={`drop-slot ${dragging ? "active" : ""} px-5 py-6 text-center cursor-pointer`}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
          >
            <input ref={fileInputRef} type="file" accept="video/*,audio/*" multiple className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            <div className="w-11 h-11 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ background: "var(--bg-panel)", border: "1px solid var(--hairline)" }}>
              <UploadCloud size={19} style={{ color: "var(--amber)" }} />
            </div>
            <p className="text-[14px] font-medium">Drop video or audio files here, or click to browse</p>
            <p className="sd-mono text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>MP4 · MOV · WEBM · MP3 · WAV · M4A — upload as many times as you like</p>
          </div>

          {sources.length > 0 && (
            <div className="mt-4">
              <p className="sd-mono text-[10.5px] uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Media pool — {sources.length} file{sources.length === 1 ? "" : "s"}</p>
              <div className="pool-grid">
                {sources.map((s) => (
                    <div key={s.id} className="pool-card">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {s.kind === "video" ? <Film size={12} style={{ color: "var(--text-muted)" }} /> : <AudioLines size={12} style={{ color: "var(--text-muted)" }} />}
                          <p className="text-[12px] font-medium truncate">{s.name}</p>
                        </div>
                        <button className="btn-icon w-6 h-6 flex items-center justify-center shrink-0" onClick={() => removeSource(s.id)} title="Remove" aria-label={`Remove ${s.name} from the media pool`}><X size={13} /></button>
                      </div>

                      {s.status === "decoding" && (
                        <div className="flex items-center gap-2 h-[34px]"><Loader2 size={13} className="animate-spin" style={{ color: "var(--text-muted)" }} /><span className="text-[11px]" style={{ color: "var(--text-muted)" }}>Decoding…</span></div>
                      )}
                      {s.status === "extracting" && <Scope analyser={analysers[s.id] || null} active={true} />}
                      {s.status === "ready" && <PoolWaveform peaks={s.peaks} />}
                      {s.status === "error" && (
                        <div className="flex items-center gap-1.5 h-[34px]" role="alert"><AlertTriangle size={12} style={{ color: "var(--red)" }} /><span className="text-[11px]" style={{ color: "var(--red)" }}>{s.error}</span></div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="sd-mono text-[10.5px]" style={{ color: "var(--text-muted)" }}>{s.duration ? formatTime(s.duration) : "—"} · {formatBytes(s.size)}</span>
                        {s.status === "ready" && (
                          <button className="btn-ghost px-2.5 py-1 text-[11px] font-medium flex items-center gap-1" onClick={() => addToTimeline(s.id)}>
                            <Wand2 size={11} /> Add
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ---- timeline ---- */}
          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <button className={`btn-primary w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isPlaying ? "playing" : ""}`} onClick={togglePlay} disabled={timeline.length === 0} title={isPlaying ? "Pause (Space)" : "Play (Space)"} aria-label={isPlaying ? "Pause (Space)" : "Play (Space)"}>
                {isPlaying ? <Pause size={15} /> : <Play size={15} />}
              </button>
              <span className="sd-mono text-[12px] tabular-nums" style={{ color: "var(--text-muted)" }}>{formatTime(playheadTime)} / {formatTime(totalDuration)}</span>

              <button className="btn-ghost px-3 py-2 text-[12px] font-medium flex items-center gap-1.5" onClick={splitAtPlayhead} disabled={!findClipAtTime(timeline, playheadTime)}>
                <Scissors size={13} /> Split at playhead
              </button>
              <button className="btn-ghost px-3 py-2 text-[12px] font-medium flex items-center gap-1.5" onClick={clearTimeline} disabled={timeline.length === 0}>
                <Trash2 size={13} /> Clear
              </button>

              <div className="ml-auto flex items-center gap-1.5">
                <ZoomOut size={13} style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                <input type="range" className="plain" style={{ width: 90 }} min={20} max={240} step={5} value={pxPerSec} onChange={(e) => setPxPerSec(Number(e.target.value))} aria-label="Timeline zoom" />
                <ZoomIn size={13} style={{ color: "var(--text-muted)" }} aria-hidden="true" />
              </div>
            </div>

            <div className="timeline-panel p-3">
              {timeline.length === 0 ? (
                <p className="text-center sd-mono text-[11px] py-8" style={{ color: "var(--text-muted)" }}>
                  Timeline is empty — add a clip from the media pool above to start splicing.
                </p>
              ) : (
                <div className="timeline-scroll" ref={timelineScrollRef}>
                  <div className="timeline-content" style={{ width: contentWidth }}>
                    <div
                      className="ruler"
                      onPointerDown={onRulerPointerDown}
                      onPointerMove={onRulerPointerMove}
                      onPointerUp={onRulerPointerUp}
                      onPointerCancel={onRulerPointerUp}
                    />
                    <div className="tl-track" ref={trackRef}>
                      {timeline.map((clip, i) => {
                        const source = sources.find((s) => s.id === clip.sourceId);
                        if (!source) return null;
                        return (
                          <TimelineClip
                            key={clip.id}
                            clip={clip}
                            source={source}
                            index={i}
                            isLast={i === timeline.length - 1}
                            pxPerSec={pxPerSec}
                            selected={clip.id === selectedClipId}
                            isTrimmingThis={trimmingClipId === clip.id}
                            isDraggingThis={reorderClipId === clip.id}
                            isRemoving={removingClipIds.has(clip.id)}
                            onSelect={setSelectedClipId}
                            onTrim={trimClip}
                            onTrimStart={setTrimmingClipId}
                            onTrimEnd={() => setTrimmingClipId(null)}
                            onDragStart={handleClipDragStart}
                            onDragMove={handleClipDragMove}
                            onDragEnd={handleClipDragEnd}
                          />
                        );
                      })}
                      {insertIndicatorPx !== null && <div className="tl-insert-indicator" style={{ transform: `translateX(${insertIndicatorPx}px)` }} />}
                    </div>
                    <div className="playhead" style={{ transform: `translateX(${playheadTime * pxPerSec}px)` }}>
                      <div className="playhead-flag" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ---- clip inspector ---- */}
          {selectedClip && selectedSource && (
            <div className="inspector p-4 mt-4" key={selectedClip.id}>
              <div className="flex items-center justify-between mb-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-medium truncate">{selectedSource.name}</p>
                  <p className="sd-mono text-[11px]" style={{ color: "var(--text-muted)" }}>
                    clip {timeline.findIndex((c) => c.id === selectedClip.id) + 1} of {timeline.length} · in {formatTime(selectedClip.inPoint)} · out {formatTime(selectedClip.outPoint)} · {formatTime(clipDur(selectedClip))} long
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button className="btn-icon w-8 h-8 flex items-center justify-center" onClick={() => moveClip(selectedClip.id, -1)} title="Move left" aria-label="Move selected clip left"><ChevronLeft size={15} /></button>
                  <button className="btn-icon w-8 h-8 flex items-center justify-center" onClick={() => moveClip(selectedClip.id, 1)} title="Move right" aria-label="Move selected clip right"><ChevronRight size={15} /></button>
                  <button className="btn-icon w-8 h-8 flex items-center justify-center" onClick={() => duplicateClip(selectedClip.id)} title="Duplicate clip" aria-label="Duplicate selected clip"><Copy size={14} /></button>
                  <button className="btn-icon w-8 h-8 flex items-center justify-center" onClick={() => deleteClip(selectedClip.id)} title="Delete clip (Del)" aria-label="Delete selected clip"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="clip-fade-in" className="text-[11px]" style={{ color: "var(--text-muted)" }}>Fade in · {selectedClip.fadeIn.toFixed(1)}s</label>
                  <input id="clip-fade-in" type="range" className="plain mt-1.5" min={0} max={Math.max(0.1, clipDur(selectedClip) / 2)} step={0.1} value={selectedClip.fadeIn} onChange={(e) => patchClip(selectedClip.id, { fadeIn: Number(e.target.value) })} aria-valuetext={`${selectedClip.fadeIn.toFixed(1)} seconds`} />
                </div>
                <div>
                  <label htmlFor="clip-fade-out" className="text-[11px]" style={{ color: "var(--text-muted)" }}>Fade out · {selectedClip.fadeOut.toFixed(1)}s</label>
                  <input id="clip-fade-out" type="range" className="plain mt-1.5" min={0} max={Math.max(0.1, clipDur(selectedClip) / 2)} step={0.1} value={selectedClip.fadeOut} onChange={(e) => patchClip(selectedClip.id, { fadeOut: Number(e.target.value) })} aria-valuetext={`${selectedClip.fadeOut.toFixed(1)} seconds`} />
                </div>
                <div>
                  <label htmlFor="clip-gain" className="text-[11px]" style={{ color: "var(--text-muted)" }}>Gain · {Math.round(selectedClip.gain * 100)}%</label>
                  <input id="clip-gain" type="range" className="plain mt-1.5" min={0} max={2} step={0.05} value={selectedClip.gain} onChange={(e) => patchClip(selectedClip.id, { gain: Number(e.target.value) })} aria-valuetext={`${Math.round(selectedClip.gain * 100)}%`} />
                </div>
              </div>
              <p className="sd-mono text-[10.5px] mt-3" style={{ color: "var(--text-muted)" }}>
                Drag a clip's amber edges to trim, or drag its body to reorder. Space to play/pause, Del to remove, ← → to nudge the playhead.
              </p>
            </div>
          )}

          {/* ---- export ---- */}
          <div className="flex flex-wrap items-center gap-3 mt-5 pt-5" style={{ borderTop: "1px solid var(--hairline)" }}>
            <div className="flex items-center gap-2">
              <Settings2 size={13} style={{ color: "var(--text-muted)" }} />
              <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>Export as</span>
            </div>
            <div className="seg">
              {["wav", "webm", "ogg"].map((fmt) => (
                <button key={fmt} className={`seg-btn small ${exportFormat === fmt ? "active" : ""}`} onClick={() => setExportFormat(fmt)}>{fmt.toUpperCase()}</button>
              ))}
            </div>
            {exportFormat !== "wav" && (
              <div className="seg">
                {Object.entries(QUALITY_PRESETS).map(([key, p]) => (
                  <button key={key} className={`seg-btn small ${quality === key ? "active" : ""}`} onClick={() => setQuality(key)} title={p.sub}>{p.label}</button>
                ))}
              </div>
            )}
            <div className="ml-auto flex items-center gap-2" aria-live="polite" role="status">
              {(exportStatus === "rendering" || exportStatus === "encoding") ? (
                <div className="flex items-center gap-2.5 w-40">
                  <div className="progress-rail flex-1"><div className="progress-fill" style={{ width: `${exportProgress}%` }} /></div>
                  <span className="sd-mono text-[11px] w-9 text-right" style={{ color: "var(--text-muted)" }}>{Math.round(exportProgress)}%</span>
                </div>
              ) : (
                <button className="btn-primary px-4 py-2.5 text-[12.5px] flex items-center gap-1.5" onClick={runExport} disabled={timeline.length === 0}>
                  <Wand2 size={13} /> Render mix
                </button>
              )}
              {outputURL && exportStatus === "done" && (
                <button className="btn-ghost px-3.5 py-2 text-[12.5px] flex items-center gap-1.5" onClick={downloadOutput}>
                  <Download size={13} /> Download ({formatBytes(outputSize)})
                </button>
              )}
            </div>
          </div>
          {exportStatus === "error" && (
            <div className="mt-3 px-3 py-2 rounded-lg" style={{ background: "rgba(255,110,98,0.08)" }} role="alert">
              <p className="text-[12px]" style={{ color: "var(--red)" }}>{exportError}</p>
            </div>
          )}
        </div>

        <p className="text-center sd-mono text-[10.5px] mt-4" style={{ color: "var(--text-muted)" }}>
          Upload as many video or audio files as you need — each becomes a clip you can trim, split, drag to reorder and
          splice into one continuous mix. Everything runs locally via the Web Audio API. No upload, no server.
        </p>
      </div>
    </div>
  );
}
