"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsQR from "jsqr";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Pause,
  Play,
  RotateCcw,
  Upload,
} from "lucide-react";

import {
  beamTiming,
  buildBeam,
  buildPlaybackOrder,
  capacityComparison,
  EC_LEVEL_LABELS,
  EC_LEVELS,
  formatBytes,
  formatSeconds,
  MAX_BEAM_BYTES,
  moduleCount,
  parseFrame,
  reassemble,
  utf8Encode,
} from "../lib";

const SAMPLE_TEXT =
  "wifi: office-guest / passphrase: sparrow-tandem-49\nvpn peer: 10.24.7.3:51820\nnote: rotate this on the 1st\n";
const SAMPLE_NAME = "handoff.txt";

const DEFAULTS = {
  source: "text",
  text: SAMPLE_TEXT,
  ecLevel: "M",
  version: "12",
  fps: "5",
  headerEvery: "12",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm leading-6 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const DASH = "—";

const VERSION_CHOICES = [4, 6, 8, 10, 12, 15, 20, 25, 30, 40];

export default function ToolHome() {
  const [mode, setMode] = useState("send");

  /* ------------------------------------------------------------- send side */
  const [source, setSource] = useState(DEFAULTS.source);
  const [text, setText] = useState(DEFAULTS.text);
  const [fileBytes, setFileBytes] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fileError, setFileError] = useState("");
  const [ecLevel, setEcLevel] = useState(DEFAULTS.ecLevel);
  const [version, setVersion] = useState(DEFAULTS.version);
  const [fps, setFps] = useState(DEFAULTS.fps);
  const [headerEvery, setHeaderEvery] = useState(DEFAULTS.headerEvery);
  const [playing, setPlaying] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => {
    if (source === "file") {
      if (!fileBytes) return { bytes: null, name: "" };
      return { bytes: fileBytes, name: fileName };
    }
    return { bytes: utf8Encode(text), name: SAMPLE_NAME };
  }, [source, fileBytes, fileName, text]);

  const beam = useMemo(() => {
    if (!payload.bytes) {
      return { error: "Choose a file to beam, or switch back to the text pad." };
    }
    return buildBeam({
      bytes: payload.bytes,
      fileName: payload.name,
      ecLevel,
      version: Number(version),
      fps: Number(fps),
    });
  }, [payload, ecLevel, version, fps]);

  const order = useMemo(
    () => (beam.error ? [] : buildPlaybackOrder(beam, { headerEvery: Number(headerEvery) })),
    [beam, headerEvery],
  );

  const timing = useMemo(
    () =>
      order.length === 0
        ? { error: "No frames." }
        : beamTiming({ playbackLength: order.length, fps: Number(fps), size: beam.size }),
    [order, fps, beam],
  );

  const comparison = useMemo(
    () =>
      payload.bytes && payload.bytes.length > 0 && payload.bytes.length <= MAX_BEAM_BYTES
        ? capacityComparison({
            byteLength: payload.bytes.length,
            version: Number(version),
            fps: Number(fps),
          })
        : [],
    [payload, version, fps],
  );

  useEffect(() => {
    setFrameIndex(0);
  }, [beam, headerEvery]);

  useEffect(() => {
    if (!playing || order.length === 0 || mode !== "send") return undefined;
    const period = 1000 / Number(fps);
    const id = setInterval(() => {
      setFrameIndex((i) => (i + 1) % order.length);
    }, period);
    return () => clearInterval(id);
  }, [playing, order.length, fps, mode]);

  const currentFrame = order.length > 0 ? order[Math.min(frameIndex, order.length - 1)] : null;

  const onFile = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    setFileError("");
    if (file.size > MAX_BEAM_BYTES) {
      setFileBytes(null);
      setFileName("");
      setFileError(
        `${file.name} is ${formatBytes(file.size)}. This tool beams files up to ${formatBytes(MAX_BEAM_BYTES)}.`,
      );
      return;
    }
    try {
      const buffer = await file.arrayBuffer();
      setFileBytes(new Uint8Array(buffer));
      setFileName(file.name);
      setSource("file");
      setPlaying(false);
    } catch {
      setFileError("That file could not be read in the browser.");
    }
  };

  const manifest = useMemo(() => {
    if (beam.error) return "";
    return [
      "Animated QR File Beam — send plan",
      `File: ${beam.fileName} (${formatBytes(beam.size)})`,
      `CRC-32: ${beam.checksum}`,
      `File id: ${beam.fileId}`,
      `QR: version ${beam.renderVersion} (${beam.renderModules}x${beam.renderModules} modules), level ${beam.ecLevel}`,
      `Payload per frame: ${beam.chunkBytes} bytes of ${beam.capacity} available`,
      `Data frames: ${beam.dataFrames} (+1 header, repeated every ${headerEvery})`,
      `Playback: ${order.length} frames at ${beam.fps} fps = ${
        timing.error ? DASH : formatSeconds(timing.cycleSeconds)
      } per loop`,
      "",
      "Frames:",
      ...beam.frames.map((frame) => `${frame.label}: ${frame.payload}`),
    ].join("\n");
  }, [beam, order.length, timing, headerEvery]);

  const copyManifest = async () => {
    if (!manifest) return;
    try {
      await navigator.clipboard.writeText(manifest);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const resetSend = () => {
    setSource(DEFAULTS.source);
    setText(DEFAULTS.text);
    setFileBytes(null);
    setFileName("");
    setFileError("");
    setEcLevel(DEFAULTS.ecLevel);
    setVersion(DEFAULTS.version);
    setFps(DEFAULTS.fps);
    setHeaderEvery(DEFAULTS.headerEvery);
    setPlaying(false);
    setFrameIndex(0);
    setCopied(false);
  };

  /* ---------------------------------------------------------- receive side */
  const [scanned, setScanned] = useState([]);
  const [pasted, setPasted] = useState("");
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const addFrames = useCallback((values) => {
    setScanned((prev) => {
      const seen = new Set(prev);
      const next = [...prev];
      values.forEach((value) => {
        const trimmed = String(value).trim();
        if (trimmed.length > 0 && !seen.has(trimmed)) {
          seen.add(trimmed);
          next.push(trimmed);
        }
      });
      return next;
    });
  }, []);

  useEffect(() => {
    if (!scanning || mode !== "receive") return undefined;
    let stream = null;
    let raf = 0;
    let stopped = false;

    const tick = () => {
      if (stopped) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === 4) {
        const width = video.videoWidth;
        const height = video.videoHeight;
        if (width > 0 && height > 0) {
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(video, 0, 0, width, height);
          const image = ctx.getImageData(0, 0, width, height);
          const found = jsQR(image.data, width, height, { inversionAttempts: "dontInvert" });
          if (found && found.data) addFrames([found.data]);
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (stopped) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        raf = requestAnimationFrame(tick);
      } catch {
        setCameraError(
          "The camera could not be opened. Grant camera permission, or paste the decoded frame text below instead.",
        );
        setScanning(false);
      }
    };

    start();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [scanning, mode, addFrames]);

  const received = useMemo(() => reassemble(scanned), [scanned]);

  const downloadHref = useMemo(() => {
    if (received.error || !received.complete || !received.bytes) return null;
    const blob = new Blob([received.bytes], { type: "application/octet-stream" });
    return URL.createObjectURL(blob);
  }, [received]);

  useEffect(
    () => () => {
      if (downloadHref) URL.revokeObjectURL(downloadHref);
    },
    [downloadHref],
  );

  const importPasted = () => {
    const lines = pasted.split(/\r?\n/).filter((line) => line.trim().length > 0);
    addFrames(lines);
    setPasted("");
  };

  const resetReceive = () => {
    setScanned([]);
    setPasted("");
    setScanning(false);
    setCameraError("");
  };

  const progressPercent =
    received.error || !received.totalFrames
      ? 0
      : Math.round((received.received / received.totalFrames) * 100);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Camera className="h-4 w-4" aria-hidden="true" />
          Air-gap transfer
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Animated QR File Beam</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Splits a small file into numbered QR frames, plays them as a loop on this screen, and
          rebuilds the file on the receiving device from the frames its camera reads back. Nothing
          leaves the browser — there is no server, no pairing code and no upload.
        </p>
      </header>

      <div
        role="tablist"
        aria-label="Beam direction"
        className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-[var(--muted)] p-1"
      >
        {[
          ["send", "Send a file"],
          ["receive", "Receive a file"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={`min-h-11 rounded-md px-3 text-sm font-semibold transition ${
              mode === value
                ? "bg-[var(--card)] text-[var(--primary)] ring-1 ring-[var(--border)]"
                : "text-[var(--muted-foreground)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "send" ? (
        <>
          <section className={CARD}>
            <fieldset>
              <legend className={LABEL_CLASS}>What to beam</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  ["text", "Type or paste text"],
                  ["file", "Pick a small file"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    htmlFor={`source-${value}`}
                    className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm font-semibold transition ${
                      source === value
                        ? "border-[var(--primary)] bg-[var(--muted)] text-[var(--foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]"
                    }`}
                  >
                    <input
                      id={`source-${value}`}
                      type="radio"
                      name="source"
                      className="h-4 w-4 accent-[var(--primary)]"
                      value={value}
                      checked={source === value}
                      onChange={(event) => setSource(event.target.value)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            {source === "text" ? (
              <div className="mt-4">
                <label className={LABEL_CLASS} htmlFor="beam-text">
                  Text to beam (sent as {SAMPLE_NAME})
                </label>
                <textarea
                  id="beam-text"
                  rows={5}
                  className={`mt-2 ${TEXTAREA_CLASS}`}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </div>
            ) : (
              <div className="mt-4">
                <label className={LABEL_CLASS} htmlFor="beam-file">
                  File to beam (up to {formatBytes(MAX_BEAM_BYTES)})
                </label>
                <input
                  id="beam-file"
                  type="file"
                  onChange={onFile}
                  className={`mt-2 ${INPUT_CLASS} file:mr-3 file:h-8 file:rounded-md file:border-0 file:bg-[var(--muted)] file:px-3 file:text-sm file:font-semibold file:text-[var(--foreground)] py-2`}
                />
                {fileBytes && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    {fileName} · {formatBytes(fileBytes.length)}
                  </p>
                )}
              </div>
            )}

            {fileError && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {fileError}
              </p>
            )}

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="ec-level">
                  Error correction
                </label>
                <select
                  id="ec-level"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={ecLevel}
                  onChange={(event) => setEcLevel(event.target.value)}
                >
                  {EC_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {EC_LEVEL_LABELS[level]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="qr-version">
                  QR version (symbol size)
                </label>
                <select
                  id="qr-version"
                  className={`mt-2 ${INPUT_CLASS}`}
                  value={version}
                  onChange={(event) => setVersion(event.target.value)}
                >
                  {VERSION_CHOICES.map((v) => (
                    <option key={v} value={String(v)}>
                      Version {v} — {moduleCount(v)}×{moduleCount(v)} modules
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="beam-fps">
                  Frames per second
                </label>
                <input
                  id="beam-fps"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="20"
                  step="1"
                  value={fps}
                  onChange={(event) => setFps(event.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="header-every">
                  Repeat header every N frames
                </label>
                <input
                  id="header-every"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  inputMode="numeric"
                  min="1"
                  max="200"
                  step="1"
                  value={headerEvery}
                  onChange={(event) => setHeaderEvery(event.target.value)}
                />
              </div>
            </div>
          </section>

          {beam.error && (
            <p
              role="alert"
              className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {beam.error}
            </p>
          )}

          {!beam.error && currentFrame && (
            <section className={`mt-6 ${CARD}`}>
              <div className="flex flex-col items-center">
                <div className="rounded-lg bg-[var(--muted)] p-3">
                  <QRCodeCanvas
                    value={currentFrame.payload}
                    size={272}
                    level={beam.ecLevel}
                    minVersion={beam.renderVersion}
                    boostLevel={false}
                    marginSize={4}
                    bgColor="white"
                    fgColor="black"
                    title={currentFrame.label}
                    className="h-auto w-full max-w-[272px]"
                  />
                </div>
                <p className="mt-3 text-sm font-semibold" aria-live="polite">
                  {currentFrame.label} · position {frameIndex + 1} of {order.length} in the loop
                </p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {currentFrame.byteLength} of {beam.capacity} bytes used in this symbol
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  className={GHOST_BTN}
                  aria-label="Previous frame"
                  onClick={() => {
                    setPlaying(false);
                    setFrameIndex((i) => (i - 1 + order.length) % order.length);
                  }}
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  Prev
                </button>
                <button
                  type="button"
                  className={PRIMARY_BTN}
                  aria-label={playing ? "Pause the beam" : "Play the beam"}
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? (
                    <Pause className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Play className="h-4 w-4" aria-hidden="true" />
                  )}
                  {playing ? "Pause" : "Play loop"}
                </button>
                <button
                  type="button"
                  className={GHOST_BTN}
                  aria-label="Next frame"
                  onClick={() => {
                    setPlaying(false);
                    setFrameIndex((i) => (i + 1) % order.length);
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={copyManifest}
                  aria-label="Copy the frame plan and every frame payload"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy result"}
                </button>
                <button
                  type="button"
                  onClick={resetSend}
                  aria-label="Reset the send settings"
                  className={GHOST_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>

              <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                {[
                  ["File", `${beam.fileName} · ${formatBytes(beam.size)}`],
                  ["CRC-32 of the file", beam.checksum],
                  ["Beam id", beam.fileId],
                  [
                    "Symbol",
                    `version ${beam.renderVersion}, ${beam.renderModules}×${beam.renderModules} modules, level ${beam.ecLevel}`,
                  ],
                  ["Payload per data frame", `${beam.chunkBytes} bytes (Base64 into ${beam.capacity})`],
                  ["Data frames", `${beam.dataFrames} + 1 header`],
                  ["Frames per loop", String(order.length)],
                  ["Loop length", timing.error ? DASH : formatSeconds(timing.cycleSeconds)],
                  [
                    "Effective throughput",
                    timing.error || timing.bytesPerSecond === null
                      ? DASH
                      : `${formatBytes(timing.bytesPerSecond)}/s`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd className="text-right font-semibold break-all">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {comparison.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">
                Same file at version {version}, each error-correction level
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Higher error correction survives glare and camera shake but carries fewer bytes, so
                the loop gets longer.
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[380px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Level
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Symbol bytes
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Payload/frame
                      </th>
                      <th scope="col" className="py-2 pr-3 text-right font-semibold">
                        Data frames
                      </th>
                      <th scope="col" className="py-2 text-right font-semibold">
                        One loop
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.map((row) => (
                      <tr key={row.ecLevel} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-semibold">{row.ecLevel}</td>
                        <td className="py-2 pr-3 text-right">{row.capacity}</td>
                        <td className="py-2 pr-3 text-right">
                          {row.error ? DASH : `${row.chunkBytes} B`}
                        </td>
                        <td className="py-2 pr-3 text-right">{row.error ? DASH : row.dataFrames}</td>
                        <td className="py-2 text-right text-[var(--muted-foreground)]">
                          {row.error || row.cycleSeconds === null
                            ? DASH
                            : formatSeconds(row.cycleSeconds)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      ) : (
        <>
          <section className={CARD}>
            <h2 className="text-base font-semibold">Scan the beam</h2>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              Point this device&apos;s camera at the looping QR on the sending screen. Frames are
              collected out of order, duplicates are ignored, and the file is rebuilt the moment
              every numbered frame has been seen.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className={PRIMARY_BTN}
                aria-label={scanning ? "Stop the camera" : "Start the camera"}
                onClick={() => {
                  setCameraError("");
                  setScanning((s) => !s);
                }}
              >
                <Camera className="h-4 w-4" aria-hidden="true" />
                {scanning ? "Stop camera" : "Start camera"}
              </button>
              <button
                type="button"
                className={GHOST_BTN}
                aria-label="Clear every scanned frame"
                onClick={resetReceive}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>

            {cameraError && (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {cameraError}
              </p>
            )}

            <div className={scanning ? "mt-4" : "hidden"}>
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full rounded-lg border border-[var(--border)]"
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="mt-4">
              <label className={LABEL_CLASS} htmlFor="paste-frames">
                Or paste decoded frame text, one frame per line
              </label>
              <textarea
                id="paste-frames"
                rows={4}
                placeholder="QFB1|cd803cd5|1|3|..."
                className={`mt-2 ${TEXTAREA_CLASS}`}
                value={pasted}
                onChange={(event) => setPasted(event.target.value)}
              />
              <button
                type="button"
                className={`mt-2 ${GHOST_BTN}`}
                onClick={importPasted}
                disabled={pasted.trim().length === 0}
                aria-label="Add the pasted frames"
              >
                Add pasted frames
              </button>
            </div>
          </section>

          {received.error ? (
            <p
              role="alert"
              className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {received.error}
            </p>
          ) : (
            <section className={`mt-6 ${CARD}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                    Frames captured
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                    {received.received}/{received.totalFrames}
                  </p>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    {received.complete
                      ? "Every frame is in."
                      : `${received.missing.length} frame${
                          received.missing.length === 1 ? "" : "s"
                        } still missing.`}
                  </p>
                </div>
                {received.complete && received.bytes && downloadHref && (
                  <a
                    href={downloadHref}
                    download={received.fileName || "beamed.bin"}
                    className={PRIMARY_BTN}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Save file
                  </a>
                )}
              </div>

              <div
                className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Frames captured"
              >
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-[width] motion-reduce:transition-none"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
                {[
                  ["File name", received.fileName || "waiting for the header frame"],
                  [
                    "Declared size",
                    received.expectedSize === null ? DASH : formatBytes(received.expectedSize),
                  ],
                  ["Declared CRC-32", received.expectedChecksum || DASH],
                  ["Rebuilt CRC-32", received.actualChecksum || DASH],
                  [
                    "Integrity",
                    received.checksumOk === null
                      ? "not checkable yet"
                      : received.checksumOk
                        ? "checksum matches"
                        : "checksum MISMATCH — rescan the beam",
                  ],
                  [
                    "Missing frames",
                    received.missing.length === 0
                      ? "none"
                      : received.missing.slice(0, 24).join(", ") +
                        (received.missing.length > 24 ? ` … +${received.missing.length - 24}` : ""),
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                    <dt className="text-[var(--muted-foreground)]">{label}</dt>
                    <dd
                      className={`text-right font-semibold break-all ${
                        label === "Integrity" && received.checksumOk === true
                          ? "text-[var(--success)]"
                          : label === "Integrity" && received.checksumOk === false
                            ? "text-[var(--danger)]"
                            : ""
                      }`}
                    >
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {received.rejected.length > 0 && (
                <p className="mt-3 text-xs text-[var(--muted-foreground)]">
                  {received.rejected.length} scanned code{received.rejected.length === 1 ? " was" : "s were"}{" "}
                  not part of this beam and {received.rejected.length === 1 ? "was" : "were"} ignored.
                </p>
              )}
            </section>
          )}

          {scanned.length > 0 && (
            <section className={`mt-6 ${CARD}`}>
              <h2 className="text-base font-semibold">Captured frames</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">
                        Frame
                      </th>
                      <th scope="col" className="py-2 font-semibold">
                        Payload
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanned.map((raw) => {
                      const parsed = parseFrame(raw);
                      return (
                        <tr key={raw} className="border-b border-[var(--border)] last:border-0">
                          <td className="py-2 pr-3 font-semibold whitespace-nowrap">
                            {parsed.error ? "ignored" : parsed.kind === "header" ? "header" : parsed.seq}
                          </td>
                          <td className="py-2 font-mono text-xs break-all text-[var(--muted-foreground)]">
                            {raw.length > 72 ? `${raw.slice(0, 72)}…` : raw}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Frames are plain Base64 inside a QR symbol — they are not encrypted. Anyone who can point a
        camera at the screen can read the file, so encrypt sensitive content before beaming it. QR
        beaming carries a few hundred bytes per frame, which makes it right for keys, config files
        and short notes rather than photos or archives.
      </p>
    </main>
  );
}
