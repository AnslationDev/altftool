"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  Camera,
  CheckCircle2,
  Download,
  FileSearch,
  Gauge,
  Globe2,
  Loader2,
  Mic,
  Play,
  RefreshCw,
  ShieldCheck,
  Square,
  Upload,
  Wrench,
} from "lucide-react";
import { advancedCatalog } from "./catalog";
import { sanitizeSvgSource } from "./svgSanitizer";

const card =
  "rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]";
const input =
  "min-h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]";
const primary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50";
const secondary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-50";

const MEDIA_SLUGS = new Set([
  "vocal-remover-stem-splitter",
  "podcast-de-noiser-echo-reducer",
  "silence-filler-word-cutter",
  "audio-pitch-tempo-shifter",
  "lossless-audio-transcoder",
  "wav-spectrogram-analyzer",
  "video-stabilizer",
  "burn-in-subtitle-encoder",
  "smart-vertical-video-reframer",
  "video-frame-to-sprite-extractor",
  "voiceprint-anonymizer",
  "audio-video-sync-meter",
  "room-rt60-echo-meter",
  "loudness-true-peak-normalizer",
  "multichannel-audio-mapper",
  "animated-webp-apng-builder",
  "batch-image-workflow-runner",
  "color-grade-lut-applier",
  "gif-palette-optimizer",
  "raw-photo-developer",
]);
const LIVE_SLUGS = new Set([
  "isitdown-now",
  "cloud-status-board",
  "dns-propagation-checker",
  "domain-expiry-radar",
  "eth-gas-now",
  "crypto-price-alarm",
  "fx-rate-alerter",
  "release-watchtower",
  "quake-near-me",
  "iss-pass-finder",
  "aqi-live-dashboard",
  "uv-safety-window",
  "aurora-visibility-forecast",
  "severe-weather-watch",
  "global-market-session-clock",
  "pin-code-region-lookup",
  "product-recall-watchlist",
]);
const SENSOR_SLUGS = new Set([
  "digital-level-inclinometer",
  "calibrated-camera-ruler",
  "chromatic-instrument-tuner",
  "digital-compass",
  "animated-qr-file-beam",
  "camera-color-eyedropper",
  "surface-vibration-recorder",
  "gps-speedometer",
  "local-sound-event-logger",
  "dead-pixel-screen-test",
  "multi-touch-tester",
  "headphone-balance-test",
  "led-pwm-flicker-detector",
  "road-roughness-logger",
  "device-sensor-calibration-checker",
]);
const CREATOR_SLUGS = new Set([
  "influencer-media-kit-builder",
  "vertical-video-safe-zone-previewer",
  "short-video-hook-marker",
  "sponsored-disclosure-placement-checker",
]);

export default function AdvancedWorkbench({ slug }) {
  const meta = advancedCatalog[slug] || {
    name: "Advanced browser workbench",
    description: "Process local data with explicit controls.",
    category: "Advanced tools",
  };
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <header className={card}>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Wrench className="h-4 w-4" aria-hidden="true" />
            {meta.category}
          </div>
          <h1 className="text-3xl font-semibold leading-tight">{meta.name}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)]">
            {meta.description}
          </p>
        </header>
        <div className="mt-4">
          {MEDIA_SLUGS.has(slug) ? (
            <MediaLab slug={slug} />
          ) : LIVE_SLUGS.has(slug) ? (
            <LiveLab slug={slug} />
          ) : SENSOR_SLUGS.has(slug) ? (
            <SensorLab slug={slug} />
          ) : CREATOR_SLUGS.has(slug) ? (
            <CreatorLab slug={slug} />
          ) : (
            <FileLab slug={slug} />
          )}
        </div>
        <p className="mt-4 rounded-md border border-[var(--border)] bg-[var(--card)] p-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Privacy first: local-file and sensor tools run in this browser after
          your explicit action. Live utilities send only the query and
          coordinates you enter to ALTFTool&apos;s server, which requests the
          named public source. Verify important outputs against the original
          file, device, or official authority.
        </p>
      </div>
    </main>
  );
}

function Section({ children, className = "" }) {
  return <section className={`${card} ${className}`}>{children}</section>;
}

function Label({ htmlFor, children }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-semibold">
      {children}
    </label>
  );
}

function Notice({ children, tone = "info" }) {
  return (
    <div
      role="status"
      className={`rounded-md border p-3 text-sm ${
        tone === "error"
          ? "border-[var(--destructive)] bg-[var(--destructive-soft)] text-[var(--destructive)]"
          : "border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]"
      }`}
    >
      {children}
    </div>
  );
}

function downloadBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const mediaOptions = {
  "vocal-remover-stem-splitter": {
    accept: "audio/*",
    label: "Stem profile",
    choices: ["instrumental", "vocals", "bass", "drums"],
    extension: "wav",
    command: (input, output, choice) => {
      const filters = {
        instrumental: "pan=stereo|c0=c0-c1|c1=c1-c0",
        vocals: "highpass=f=120,lowpass=f=5000,pan=mono|c0=0.5*c0+0.5*c1",
        bass: "lowpass=f=250",
        drums: "highpass=f=250,acompressor=threshold=-18dB:ratio=4",
      };
      return ["-i", input, "-af", filters[choice], output];
    },
    note: "Creates deterministic frequency/centre-channel approximations, not neural source separation. Inspect leakage before use.",
  },
  "podcast-de-noiser-echo-reducer": {
    accept: "audio/*",
    label: "Strength",
    choices: ["light", "medium", "strong"],
    extension: "wav",
    command: (input, output, choice) => [
      "-i",
      input,
      "-af",
      `highpass=f=70,lowpass=f=14000,afftdn=nf=${choice === "strong" ? -35 : choice === "medium" ? -28 : -22}`,
      output,
    ],
  },
  "silence-filler-word-cutter": {
    accept: "audio/*",
    label: "Silence threshold",
    choices: ["-35dB", "-40dB", "-45dB"],
    extension: "wav",
    command: (input, output, choice) => [
      "-i",
      input,
      "-af",
      `silenceremove=start_periods=1:start_threshold=${choice}:stop_periods=-1:stop_duration=0.65:stop_threshold=${choice}`,
      output,
    ],
    note: "Removes detected long silence. Filler-word removal needs reviewed timestamps and is not guessed from speech.",
  },
  "audio-pitch-tempo-shifter": {
    accept: "audio/*",
    label: "Transform",
    choices: ["slower", "faster", "pitch-up", "pitch-down"],
    extension: "wav",
    command: (input, output, choice) => {
      const filter = {
        slower: "atempo=0.8",
        faster: "atempo=1.25",
        "pitch-up": "asetrate=48000*1.12246,aresample=48000,atempo=0.8909",
        "pitch-down": "asetrate=48000/1.12246,aresample=48000,atempo=1.12246",
      }[choice];
      return ["-i", input, "-af", filter, output];
    },
  },
  "lossless-audio-transcoder": {
    accept: "audio/*",
    label: "Output format",
    choices: ["wav", "flac", "mp3", "ogg"],
    extension: (choice) => choice,
    command: (input, output) => ["-i", input, output],
  },
  "wav-spectrogram-analyzer": {
    accept: "audio/*",
    label: "Scale",
    choices: ["log", "sqrt", "lin"],
    extension: "png",
    command: (input, output, choice) => [
      "-i",
      input,
      "-lavfi",
      `showspectrumpic=s=1600x900:legend=1:scale=${choice}`,
      "-frames:v",
      "1",
      output,
    ],
  },
  "video-stabilizer": {
    accept: "video/*",
    label: "Stabilization",
    choices: ["light", "medium", "strong"],
    extension: "mp4",
    command: (input, output, choice) => [
      "-i",
      input,
      "-vf",
      `deshake=edge=mirror:rx=${choice === "strong" ? 32 : choice === "medium" ? 24 : 16}:ry=${choice === "strong" ? 32 : choice === "medium" ? 24 : 16}`,
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      output,
    ],
  },
  "burn-in-subtitle-encoder": {
    accept: "video/*",
    second: ".srt,.vtt",
    label: "Subtitle size",
    choices: ["small", "medium", "large"],
    extension: "mp4",
    command: (input, output, choice, second) => [
      "-i",
      input,
      "-vf",
      `subtitles=${second}:force_style='FontSize=${choice === "large" ? 28 : choice === "small" ? 16 : 22}'`,
      "-c:v",
      "libx264",
      "-c:a",
      "copy",
      output,
    ],
  },
  "smart-vertical-video-reframer": {
    accept: "video/*",
    label: "Horizontal anchor",
    choices: ["center", "left", "right"],
    extension: "mp4",
    command: (input, output, choice) => [
      "-i",
      input,
      "-vf",
      `crop=ih*9/16:ih:${choice === "left" ? "0" : choice === "right" ? "iw-ow" : "(iw-ow)/2"}:0,scale=1080:1920`,
      "-c:v",
      "libx264",
      "-c:a",
      "aac",
      output,
    ],
    note: "Uses an explicit left/centre/right anchor. Review the preview; it does not pretend to identify a subject.",
  },
  "video-frame-to-sprite-extractor": {
    accept: "video/*",
    label: "Sampling",
    choices: ["1 frame/second", "1 frame/2 seconds", "1 frame/5 seconds"],
    extension: "png",
    command: (input, output, choice) => [
      "-i",
      input,
      "-vf",
      `fps=1/${choice.includes("5") ? 5 : choice.includes("2") ? 2 : 1},scale=240:-1,tile=5x5`,
      "-frames:v",
      "1",
      output,
    ],
  },
  "voiceprint-anonymizer": {
    accept: "audio/*",
    label: "Voice shift",
    choices: ["subtle-up", "subtle-down", "strong-up", "strong-down"],
    extension: "wav",
    // `asetrate=R` relabels the decoded PCM as if it had been captured at
    // rate R without resampling, so the true pitch multiplier it produces
    // is R / R_in, where R_in is the *actual* native sample rate of the
    // uploaded file. This entry used to hardcode R_in as 48000, which only
    // gave the advertised 1.08x/1.18x factor (and a duration-preserving
    // result) when the source happened to already be 48kHz. Any other
    // input (e.g. 8kHz telephony audio, 44.1kHz WAV/MP3, 96kHz field
    // recordings) got a silently wrong shift magnitude/direction and a
    // wrong output duration. We now probe the real input sample rate with
    // ffprobe before building the filter graph and use that instead of the
    // 48000 literal. `ffmpeg` is passed in as an extra 6th argument by the
    // MediaLab runner below; every other entry in this file still declares
    // `command` with 3-5 params and simply ignores the extra argument, so
    // this is scoped to this one tool only.
    command: async (input, output, choice, _second, _fontPath, ffmpeg) => {
      const factor = choice.includes("strong") ? 1.18 : 1.08;
      const actual = choice.includes("down") ? 1 / factor : factor;
      let sourceRate = 48000;
      if (ffmpeg?.ffprobe) {
        const probeOutput = "voiceprint-anonymizer-probe.txt";
        try {
          await ffmpeg.ffprobe([
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=sample_rate",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            input,
            "-o",
            probeOutput,
          ]);
          const bytes = await ffmpeg.readFile(probeOutput);
          const text =
            typeof bytes === "string" ? bytes : new TextDecoder().decode(bytes);
          const parsed = parseInt(text.trim().split(/\s+/)[0], 10);
          if (Number.isFinite(parsed) && parsed > 0) sourceRate = parsed;
        } catch {
          // If the probe fails for any reason (unusual container, older
          // core build, etc.) fall back to the previous 48000 assumption
          // rather than failing the whole conversion.
        } finally {
          await ffmpeg.deleteFile(probeOutput).catch(() => {});
        }
      }
      return [
        "-i",
        input,
        "-af",
        `asetrate=${sourceRate}*${actual},aresample=48000,atempo=${1 / actual},highpass=f=100,lowpass=f=8500`,
        output,
      ];
    },
    note: "Changes obvious pitch cues but cannot guarantee biometric anonymity. Do not rely on it against determined speaker recognition.",
  },
  "audio-video-sync-meter": {
    accept: "video/*",
    label: "Analysis",
    choices: ["silence transitions", "audio peaks", "frame timestamps"],
    extension: "txt",
    analyze: true,
    command: (input) => [
      "-i",
      input,
      "-af",
      "silencedetect=noise=-30dB:d=0.05",
      "-vf",
      "showinfo",
      "-f",
      "null",
      "-",
    ],
  },
  "room-rt60-echo-meter": {
    accept: "audio/*",
    label: "Noise floor",
    choices: ["-35dB", "-45dB", "-55dB"],
    extension: "txt",
    analyze: true,
    command: (input, _output, choice) => [
      "-i",
      input,
      "-af",
      `silencedetect=noise=${choice}:d=0.05,astats=metadata=1:reset=0`,
      "-f",
      "null",
      "-",
    ],
    note: "Shows decay/silence diagnostics for a clap recording. A calibrated RT60 measurement requires a suitable excitation signal, microphone, room conditions, and decay-curve fitting.",
  },
  "loudness-true-peak-normalizer": {
    accept: "audio/*,video/*",
    label: "Target",
    choices: ["-14 LUFS", "-16 LUFS", "-23 LUFS"],
    extension: "wav",
    command: (input, output, choice) => [
      "-i",
      input,
      "-af",
      `loudnorm=I=${choice.split(" ")[0]}:TP=-1.5:LRA=11`,
      output,
    ],
  },
  "multichannel-audio-mapper": {
    accept: "audio/*,video/*",
    label: "Mapping",
    choices: ["keep", "swap-stereo", "left-mono", "right-mono"],
    extension: "wav",
    command: (input, output, choice) => {
      const filter = {
        keep: "anull",
        "swap-stereo": "pan=stereo|c0=c1|c1=c0",
        "left-mono": "pan=mono|c0=c0",
        "right-mono": "pan=mono|c0=c1",
      }[choice];
      return ["-i", input, "-af", filter, output];
    },
  },
  "animated-webp-apng-builder": {
    accept: "image/*",
    second: "image/*",
    label: "Output",
    choices: ["webp", "apng"],
    extension: (choice) => (choice === "apng" ? "png" : "webp"),
    command: (input, output, choice, second) => [
      "-loop",
      "1",
      "-t",
      "1",
      "-i",
      input,
      "-loop",
      "1",
      "-t",
      "1",
      "-i",
      second,
      "-filter_complex",
      "[0:v][1:v]concat=n=2:v=1:a=0,scale=800:-2,fps=12",
      "-plays",
      "0",
      output,
    ],
  },
  "batch-image-workflow-runner": {
    accept: "image/*",
    label: "Pipeline",
    choices: ["resize-1200", "square-crop", "grayscale", "watermark"],
    extension: "png",
    // The WASM ffmpeg core has no fontconfig, so drawtext requires an explicit
    // fontfile written into the in-memory FS before exec — otherwise it fails
    // filter-graph configuration with "No font filename provided" every time.
    fontUrl: "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.ttf",
    command: (input, output, choice, second, fontPath) => {
      const filter = {
        "resize-1200": "scale='min(1200,iw)':-2",
        "square-crop": "crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080",
        grayscale: "format=gray",
        watermark: `drawtext=fontfile='${fontPath}':text='ALTFTool':x=w-tw-24:y=h-th-24:fontsize=28:box=1:boxborderw=8`,
      }[choice];
      return ["-i", input, "-vf", filter, output];
    },
  },
  "color-grade-lut-applier": {
    accept: "image/*,video/*",
    second: ".cube",
    label: "Interpolation",
    choices: ["tetrahedral", "trilinear", "nearest"],
    extension: "mp4",
    command: (input, output, choice, second) => [
      "-i",
      input,
      "-vf",
      `lut3d=${second}:interp=${choice}`,
      "-c:v",
      "libx264",
      "-c:a",
      "copy",
      output,
    ],
  },
  "gif-palette-optimizer": {
    accept: "image/gif,video/*",
    label: "Palette",
    choices: ["64 colors", "128 colors", "256 colors"],
    extension: "gif",
    command: (input, output, choice) => {
      const colors = choice.split(" ")[0];
      return [
        "-i",
        input,
        "-filter_complex",
        `[0:v]fps=15,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors}[p];[b][p]paletteuse=dither=sierra2_4a`,
        output,
      ];
    },
  },
  "raw-photo-developer": {
    accept: "image/*,.dng,.nef,.cr2,.arw",
    label: "Exposure",
    choices: ["-1 stop", "neutral", "+1 stop"],
    extension: "jpg",
    command: (input, output, choice) => [
      "-i",
      input,
      "-vf",
      `eq=brightness=${choice.startsWith("+") ? 0.12 : choice.startsWith("-") ? -0.12 : 0}:contrast=1.04:saturation=1.03`,
      "-q:v",
      "2",
      output,
    ],
    note: "Decoding depends on the browser FFmpeg build and camera format. This is a simple exposure preview, not a colour-managed RAW pipeline.",
  },
};

function MediaLab({ slug }) {
  const config = mediaOptions[slug] || mediaOptions["lossless-audio-transcoder"];
  const [file, setFile] = useState(null);
  const [second, setSecond] = useState(null);
  const [choice, setChoice] = useState(config.choices[0]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("info");
  const [logs, setLogs] = useState([]);
  const engine = useRef(null);
  const logsRef = useRef([]);

  useEffect(() => () => engine.current?.terminate?.(), []);

  const run = async () => {
    if (!file || (config.second && !second)) return;
    setBusy(true);
    setMessage("");
    setMessageTone("info");
    setLogs([]);
    logsRef.current = [];
    setProgress(0);
    try {
      const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);
      let ffmpeg = engine.current;
      if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress: value }) =>
          setProgress(Math.max(0, Math.min(100, Math.round(value * 100)))),
        );
        ffmpeg.on("log", ({ message: value }) => {
          // Tools with `analyze: true` export logsRef.current verbatim as
          // the user's downloaded diagnostic report (see `config.analyze`
          // below), so capping it at 200 lines can silently evict the
          // earliest lines — e.g. the first silence_start marker a decay
          // reading depends on — with no indication anything was dropped.
          // Non-analyze tools never read logsRef.current for anything but
          // memory bookkeeping, so their behavior is unchanged.
          logsRef.current = config.analyze
            ? [...logsRef.current, value]
            : [...logsRef.current.slice(-199), value];
          setLogs((current) => [...current.slice(-79), value]);
        });
        const base =
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(
            `${base}/ffmpeg-core.wasm`,
            "application/wasm",
          ),
        });
        engine.current = ffmpeg;
      }
      const input = `input.${file.name.split(".").pop() || "bin"}`;
      await ffmpeg.writeFile(input, await fetchFile(file));
      let secondName = "";
      if (second) {
        secondName = `secondary.${second.name.split(".").pop() || "bin"}`;
        await ffmpeg.writeFile(secondName, await fetchFile(second));
      }
      let fontName = "";
      if (config.fontUrl) {
        fontName = "altftool-drawtext-font.ttf";
        await ffmpeg.writeFile(fontName, await fetchFile(config.fontUrl));
      }
      const extension =
        typeof config.extension === "function"
          ? config.extension(choice)
          : config.extension;
      const output = `altftool-${slug}.${extension}`;
      // `await` here is a no-op for the synchronous array every other
      // entry's `command()` returns; it only matters for entries (like
      // voiceprint-anonymizer) whose `command()` needs to run an async
      // pre-pass (e.g. ffprobe) before the ffmpeg args can be built. The
      // trailing `ffmpeg` argument is likewise ignored by every command()
      // that doesn't declare a 6th parameter.
      const command = await config.command(
        input,
        output,
        choice,
        secondName,
        fontName,
        ffmpeg,
      );
      const exitCode = await ffmpeg.exec(command);
      if (exitCode !== 0) throw new Error(`Processing exited with code ${exitCode}`);
      if (config.analyze) {
        const report = logsRef.current.join("\n");
        downloadBlob(
          new Blob([report], { type: "text/plain;charset=utf-8" }),
          `altftool-${slug}-analysis.txt`,
        );
        setMessage("Analysis completed. The diagnostic log was downloaded.");
        setMessageTone("info");
      } else {
        const bytes = await ffmpeg.readFile(output);
        downloadBlob(new Blob([bytes]), output);
        await ffmpeg.deleteFile(output).catch(() => {});
        setMessage(`Completed locally and downloaded ${output}.`);
        setMessageTone("info");
      }
      await ffmpeg.deleteFile(input).catch(() => {});
      if (secondName) await ffmpeg.deleteFile(secondName).catch(() => {});
      if (fontName) await ffmpeg.deleteFile(fontName).catch(() => {});
      setProgress(100);
    } catch (error) {
      setMessage(error?.message || "Processing failed");
      setMessageTone("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <Section>
        <div className="grid gap-4">
          <Label htmlFor="advanced-media-file">Source file</Label>
          <input
            id="advanced-media-file"
            type="file"
            accept={config.accept}
            className={input}
            onChange={(event) => setFile(event.target.files?.[0] || null)}
          />
          {config.second && (
            <>
              <Label htmlFor="advanced-media-second">Secondary file</Label>
              <input
                id="advanced-media-second"
                type="file"
                accept={config.second}
                className={input}
                onChange={(event) => setSecond(event.target.files?.[0] || null)}
              />
            </>
          )}
          <Label htmlFor="advanced-media-choice">{config.label}</Label>
          <select
            id="advanced-media-choice"
            className={input}
            value={choice}
            onChange={(event) => setChoice(event.target.value)}
          >
            {config.choices.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button
            type="button"
            className={primary}
            disabled={busy || !file || (config.second && !second)}
            onClick={run}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            {busy ? `Processing ${progress}%` : "Process locally"}
          </button>
          {config.note && <Notice>{config.note}</Notice>}
        </div>
      </Section>
      <Section>
        <h2 className="text-lg font-semibold">Local processing report</h2>
        <p className="mt-2 text-sm text-[var(--muted-foreground)]">
          The FFmpeg WebAssembly engine is loaded only after you press Process.
          Your source file is written to its in-memory filesystem, not uploaded.
        </p>
        {file && (
          <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            <Info label="File" value={file.name} />
            <Info label="Size" value={`${(file.size / 1024 / 1024).toFixed(2)} MB`} />
            <Info label="Type" value={file.type || "Unknown"} />
            <Info label="Profile" value={choice} />
          </dl>
        )}
        {message && <div className="mt-4"><Notice tone={messageTone}>{message}</Notice></div>}
        {!!logs.length && (
          <pre className="mt-4 max-h-72 overflow-auto rounded-md bg-[var(--muted)] p-3 text-xs text-[var(--muted-foreground)]">
            {logs.slice(-30).join("\n")}
          </pre>
        )}
      </Section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border border-[var(--border)] p-3">
      <dt className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
        {label}
      </dt>
      <dd className="mt-1 break-words">{String(value ?? "—")}</dd>
    </div>
  );
}

const queryDefaults = {
  "isitdown-now": "altftool.com",
  "dns-propagation-checker": "altftool.com",
  "domain-expiry-radar": "altftool.com",
  "crypto-price-alarm": "bitcoin",
  "fx-rate-alerter": "USD/INR",
  "release-watchtower": "vercel/next.js",
  "pin-code-region-lookup": "400001",
  "product-recall-watchlist": "battery",
};

function LiveLab({ slug }) {
  const [query, setQuery] = useState(queryDefaults[slug] || "");
  const [latitude, setLatitude] = useState("19.076");
  const [longitude, setLongitude] = useState("72.8777");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const needsLocation = new Set([
    "quake-near-me",
    "iss-pass-finder",
    "aqi-live-dashboard",
    "uv-safety-window",
    "aurora-visibility-forecast",
    "severe-weather-watch",
  ]).has(slug);

  const useLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      (reason) => setError(reason.message),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const refresh = async () => {
    setBusy(true);
    setError("");
    try {
      const params = new URLSearchParams({
        slug,
        q: query,
        lat: latitude,
        lon: longitude,
      });
      const response = await fetch(`/api/tools/live-utility?${params}`, {
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok)
        throw new Error(payload.error || "Live source unavailable");
      setData(payload);
    } catch (reason) {
      setError(reason?.message || "Live source unavailable");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <Section>
        <div className="grid gap-4">
          {queryDefaults[slug] !== undefined && (
            <>
              <Label htmlFor="live-query">Lookup</Label>
              <input
                id="live-query"
                className={input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </>
          )}
          {needsLocation && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="live-latitude">Latitude</Label>
                  <input id="live-latitude" className={`${input} mt-2`} value={latitude} onChange={(event) => setLatitude(event.target.value)} />
                </div>
                <div>
                  <Label htmlFor="live-longitude">Longitude</Label>
                  <input id="live-longitude" className={`${input} mt-2`} value={longitude} onChange={(event) => setLongitude(event.target.value)} />
                </div>
              </div>
              <button type="button" className={secondary} onClick={useLocation}>
                <Globe2 className="h-4 w-4" aria-hidden="true" />
                Use device location
              </button>
            </>
          )}
          <button type="button" className={primary} disabled={busy} onClick={refresh}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
            {busy ? "Checking source…" : "Get current result"}
          </button>
          <Notice>
            Results are fetched on demand and show an update timestamp and
            source. Availability, rate limits, coverage, and freshness depend
            on that provider.
          </Notice>
        </div>
      </Section>
      <Section>
        <h2 className="text-lg font-semibold">Current result</h2>
        {error && <div className="mt-4"><Notice tone="error">{error}</Notice></div>}
        {!data && !error && (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            Enter the relevant query, then request a current reading.
          </p>
        )}
        {data && (
          <div className="mt-4 grid gap-4">
            <div>
              <p className="text-xl font-semibold">{data.summary}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Updated {new Date(data.updatedAt).toLocaleString()}
              </p>
            </div>
            <ResultTable rows={data.rows || []} />
            {data.note && <Notice>{data.note}</Notice>}
            {data.source && (
              <p className="break-all text-xs text-[var(--muted-foreground)]">
                Source: {data.source}
              </p>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}

function ResultTable({ rows, mostRecent = false, headers }) {
  if (!rows.length) return <Notice>No matching records were returned.</Notice>;
  // Live/rolling logs (mostRecent) keep the newest entries appended at the end,
  // so the visible window must be the tail of the array, not the head — otherwise
  // a growing log freezes on its oldest captured rows and never shows new ones.
  const visibleRows = mostRecent ? rows.slice(-100) : rows.slice(0, 100);
  return (
    <div className="overflow-auto rounded-md border border-[var(--border)]">
      <table className="w-full min-w-max text-left text-sm">
        {headers ? (
          <thead>
            <tr className="border-b border-[var(--border)]">
              {headers.map((header, index) => (
                <th key={index} scope="col" className="px-3 py-2 font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
        ) : null}
        <tbody>
          {visibleRows.map((row, index) => (
            <tr key={`${index}-${row[0]}`} className="border-b border-[var(--border)] last:border-0">
              {(Array.isArray(row) ? row : Object.values(row)).map((cell, cellIndex) => (
                <td key={cellIndex} className="max-w-lg px-3 py-2 align-top">
                  {String(cell ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Dead-pixel test fields must be true black/red/green/blue/white regardless
// of the site's light/dark theme: the whole point of the final "light" field
// is that a dead (unpowered) pixel stays black against it, so if these were
// theme tokens they'd invert in dark mode and hide the exact defect the tool
// exists to reveal. Intentionally NOT semantic tokens — see wave-18 audit.
const screenPatterns = ["bg-black", "bg-red-600", "bg-green-600", "bg-blue-600", "bg-white"];

function SensorLab({ slug }) {
  const [active, setActive] = useState(false);
  const [readings, setReadings] = useState([]);
  const [message, setMessage] = useState("");
  const [pattern, setPattern] = useState(0);
  const [touches, setTouches] = useState([]);
  const [camera, setCamera] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const overlayRef = useRef(null);
  const cleanupRef = useRef(() => {});

  const append = useCallback((row) => {
    setReadings((current) => [...current.slice(-199), row]);
  }, []);

  useEffect(() => () => {
    cleanupRef.current?.();
    camera?.getTracks().forEach((track) => track.stop());
  }, [camera]);

  // Move focus into the full-screen overlay as soon as it mounts so a
  // keyboard-only user (no working pointer yet, e.g. testing a fresh
  // monitor) can immediately use Enter/Space to cycle patterns and Tab to
  // reach the Exit test button, instead of having no focused element at all.
  useEffect(() => {
    if (slug === "dead-pixel-screen-test" && active) {
      overlayRef.current?.focus();
    }
  }, [slug, active]);

  const stop = () => {
    cleanupRef.current?.();
    cleanupRef.current = () => {};
    camera?.getTracks().forEach((track) => track.stop());
    setCamera(null);
    setActive(false);
  };

  const start = async () => {
    if (["chromatic-instrument-tuner", "local-sound-event-logger"].includes(slug) && readings.length > 0) {
      const shouldReset = window.confirm(
        "Starting again will clear the current reading log. Continue?",
      );
      if (!shouldReset) return;
    }
    stop();
    setMessage("");
    setReadings([]);
    try {
      if (slug === "headphone-balance-test") {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const panner = context.createStereoPanner();
        oscillator.frequency.value = 440;
        panner.pan.value = -1;
        oscillator.connect(panner).connect(context.destination);
        oscillator.start();
        let side = -1;
        append([new Date().toISOString(), side < 0 ? "Left" : "Right", "440 Hz"]);
        const timer = setInterval(() => {
          side *= -1;
          panner.pan.setValueAtTime(side, context.currentTime);
          append([new Date().toISOString(), side < 0 ? "Left" : "Right", "440 Hz"]);
        }, 1500);
        cleanupRef.current = () => {
          clearInterval(timer);
          oscillator.stop();
          context.close();
        };
        setActive(true);
        return;
      }
      if (["chromatic-instrument-tuner", "local-sound-event-logger"].includes(slug)) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const context = new AudioContext();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 4096;
        source.connect(analyser);
        const samples = new Float32Array(analyser.fftSize);
        let frame = 0;
        const loop = () => {
          analyser.getFloatTimeDomainData(samples);
          const rms = Math.sqrt(samples.reduce((sum, value) => sum + value * value, 0) / samples.length);
          let bestOffset = 0;
          let best = 0;
          // Raw (unnormalized) correlation always favours short lags, because a
          // shorter lag sums over more overlapping sample pairs regardless of fit
          // — so it used to lock onto the 20-sample floor (~2205 Hz) for any real
          // tone below ~132 Hz instead of finding the tone's true, longer period.
          // Normalizing by each window's energy, extending the max lag down to
          // 40 Hz (covering a bass guitar's low E at 41.2 Hz), and requiring the
          // correlation to dip below the match threshold before it rises again
          // finds the fundamental period instead of the trivially high
          // correlation near lag 0 or a shorter-period alias. This applies to
          // both slugs that reach this branch (chromatic-instrument-tuner and
          // local-sound-event-logger) — they share the same pitch estimator.
          const minOffset = 20;
          const maxOffset = Math.min(samples.length - 1, Math.ceil(context.sampleRate / 40));
          const sumOfSquares = new Float64Array(samples.length + 1);
          for (let index = 0; index < samples.length; index += 1)
            sumOfSquares[index + 1] = sumOfSquares[index] + samples[index] * samples[index];
          let hasDipped = false;
          let tracking = false;
          for (let offset = 1; offset < maxOffset; offset += 1) {
            let correlation = 0;
            for (let index = 0; index < samples.length - offset; index += 1)
              correlation += samples[index] * samples[index + offset];
            const energyA = sumOfSquares[samples.length - offset];
            const energyB = sumOfSquares[samples.length] - sumOfSquares[offset];
            const normalized = correlation / (Math.sqrt(energyA * energyB) || 1);
            if (normalized < 0.9) {
              hasDipped = true;
              if (tracking && offset >= minOffset) break;
              tracking = false;
            } else if (hasDipped) {
              tracking = true;
              if (offset >= minOffset && normalized > best) {
                best = normalized;
                bestOffset = offset;
              }
            }
          }
          const frequency = bestOffset ? context.sampleRate / bestOffset : 0;
          if (frame++ % 12 === 0 && rms > 0.08)
            append([new Date().toISOString(), rms.toFixed(4), frequency.toFixed(1), noteName(frequency)]);
          audioRef.current = requestAnimationFrame(loop);
        };
        loop();
        cleanupRef.current = () => {
          cancelAnimationFrame(audioRef.current);
          stream.getTracks().forEach((track) => track.stop());
          context.close();
        };
        setActive(true);
        return;
      }
      if (["calibrated-camera-ruler", "camera-color-eyedropper", "led-pwm-flicker-detector"].includes(slug)) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        setCamera(stream);
        setActive(true);
        setTimeout(() => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        });
        cleanupRef.current = () => stream.getTracks().forEach((track) => track.stop());
        return;
      }
      if (["gps-speedometer", "road-roughness-logger"].includes(slug)) {
        const watch = navigator.geolocation.watchPosition(
          (position) => append([
            new Date(position.timestamp).toISOString(),
            position.coords.latitude.toFixed(6),
            position.coords.longitude.toFixed(6),
            position.coords.speed == null ? "Unavailable" : (position.coords.speed * 3.6).toFixed(2) + " km/h",
            position.coords.accuracy.toFixed(1) + " m",
          ]),
          (error) => setMessage(error.message),
          { enableHighAccuracy: true, maximumAge: 0 },
        );
        const motion = (event) => {
          if (slug === "road-roughness-logger") {
            const a = event.accelerationIncludingGravity;
            const magnitude = Math.hypot(a?.x || 0, a?.y || 0, a?.z || 0);
            if (magnitude > 12) append([new Date().toISOString(), "Jolt", magnitude.toFixed(3), "m/s²"]);
          }
        };
        window.addEventListener("devicemotion", motion);
        cleanupRef.current = () => {
          navigator.geolocation.clearWatch(watch);
          window.removeEventListener("devicemotion", motion);
        };
        setActive(true);
        return;
      }
      if (["digital-level-inclinometer", "digital-compass"].includes(slug)) {
        if (typeof DeviceOrientationEvent?.requestPermission === "function")
          await DeviceOrientationEvent.requestPermission();
        const listener = (event) =>
          append([
            new Date().toISOString(),
            Number(event.alpha || 0).toFixed(2),
            Number(event.beta || 0).toFixed(2),
            Number(event.gamma || 0).toFixed(2),
            slug === "digital-compass" ? `${Number(360 - (event.webkitCompassHeading ?? event.alpha ?? 0)).toFixed(1)}°` : `${Math.hypot(event.beta || 0, event.gamma || 0).toFixed(2)}°`,
          ]);
        window.addEventListener("deviceorientation", listener);
        cleanupRef.current = () => window.removeEventListener("deviceorientation", listener);
        setActive(true);
        return;
      }
      if (["surface-vibration-recorder", "device-sensor-calibration-checker"].includes(slug)) {
        if (typeof DeviceMotionEvent?.requestPermission === "function")
          await DeviceMotionEvent.requestPermission();
        const listener = (event) => {
          const a = event.accelerationIncludingGravity;
          const r = event.rotationRate;
          append([
            new Date().toISOString(),
            Number(a?.x || 0).toFixed(3),
            Number(a?.y || 0).toFixed(3),
            Number(a?.z || 0).toFixed(3),
            Math.hypot(r?.alpha || 0, r?.beta || 0, r?.gamma || 0).toFixed(3),
          ]);
        };
        window.addEventListener("devicemotion", listener);
        cleanupRef.current = () => window.removeEventListener("devicemotion", listener);
        setActive(true);
        return;
      }
      if (slug === "animated-qr-file-beam") {
        setMessage("Choose a small file below; it will be split into numbered Base64 chunks for sequential QR rendering.");
        setActive(true);
        return;
      }
      if (["dead-pixel-screen-test", "multi-touch-tester"].includes(slug)) {
        setActive(true);
        return;
      }
      setMessage("This browser does not expose the requested sensor.");
    } catch (error) {
      setMessage(error?.message || "Permission or sensor access failed");
    }
  };

  const sampleCamera = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(video, 0, 0);
    const pixel = context.getImageData(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2), 1, 1).data;
    append([new Date().toISOString(), pixel[0], pixel[1], pixel[2], `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`]);
  };

  if (slug === "dead-pixel-screen-test" && active) {
    return (
      <div
        ref={overlayRef}
        tabIndex={0}
        aria-label={`Dead pixel test pattern ${pattern + 1} of ${screenPatterns.length}. Press Enter or Space for the next pattern, or Escape to exit.`}
        className={`fixed inset-0 z-50 ${screenPatterns[pattern]} cursor-pointer focus-visible:outline-none focus-visible:ring-[4px] focus-visible:ring-[var(--primary)]`}
        onClick={() => setPattern((value) => (value + 1) % screenPatterns.length)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            stop();
          } else if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
            event.preventDefault();
            setPattern((value) => (value + 1) % screenPatterns.length);
          }
        }}
      >
        <button type="button" className="absolute right-4 top-4 rounded-md border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-[var(--foreground)]" onClick={(event) => { event.stopPropagation(); stop(); }}>
          Exit test
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]">
      <Section>
        <div className="grid gap-4">
          <Notice>
            {slug === "dead-pixel-screen-test"
              ? "This test requests no camera, location, or motion permission and records nothing. It just cycles a full-screen colour sequence so you can look for pixels that don't change."
              : "Sensor readings depend on secure-context browser support, device hardware, permission, calibration, mounting, and sampling rate. They are approximate and are not safety-certified measurements."}
          </Notice>
          <button type="button" className={active ? secondary : primary} onClick={active ? stop : start}>
            {active ? <Square className="h-4 w-4" aria-hidden="true" /> : <Activity className="h-4 w-4" aria-hidden="true" />}
            {active ? "Stop sensor" : slug === "dead-pixel-screen-test" ? "Start test" : "Start with permission"}
          </button>
          {["camera-color-eyedropper", "calibrated-camera-ruler", "led-pwm-flicker-detector"].includes(slug) && active && (
            <button type="button" className={secondary} onClick={sampleCamera}>
              <Camera className="h-4 w-4" aria-hidden="true" />
              Sample centre frame
            </button>
          )}
          {message && <Notice tone={/fail|does not/i.test(message) ? "error" : "info"}>{message}</Notice>}
        </div>
      </Section>
      <Section>
        <h2 className="text-lg font-semibold">
          {slug === "dead-pixel-screen-test" ? "How this test works" : "Live local readings"}
        </h2>
        {camera && (
          <div className="relative mt-4 overflow-hidden rounded-md bg-[var(--muted)]">
            <video ref={videoRef} autoPlay muted playsInline className="w-full" />
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--primary)]" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
        {slug === "multi-touch-tester" && active && (
          <div
            className="relative mt-4 min-h-80 touch-none overflow-hidden rounded-md border border-[var(--border)] bg-[var(--muted)]"
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              setTouches((current) => [...current.filter((item) => item.id !== event.pointerId), { id: event.pointerId, x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY }]);
            }}
            onPointerMove={(event) => setTouches((current) => current.map((item) => item.id === event.pointerId ? { ...item, x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY } : item))}
            onPointerUp={(event) => setTouches((current) => current.filter((item) => item.id !== event.pointerId))}
            onPointerCancel={(event) => setTouches((current) => current.filter((item) => item.id !== event.pointerId))}
          >
            {touches.map((touch) => (
              <span key={touch.id} className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-bold text-[var(--primary-foreground)]" style={{ left: touch.x, top: touch.y }}>
                {touch.id}
              </span>
            ))}
          </div>
        )}
        {slug === "dead-pixel-screen-test" ? (
          <Notice>
            This test doesn&apos;t collect or log any readings. Starting it opens a
            full-screen colour cycle — dark, red, green, blue, then light — so
            you can look for a pixel that stays the wrong colour on every field.
          </Notice>
        ) : (
          <>
            <ResultTable
              rows={readings}
              mostRecent={["chromatic-instrument-tuner", "local-sound-event-logger"].includes(slug)}
              headers={slug === "local-sound-event-logger" ? ["Timestamp", "RMS", "Frequency (Hz)", "Note"] : undefined}
            />
            {!readings.length && !camera && slug !== "multi-touch-tester" && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                Start the tool to collect local readings.
              </p>
            )}
          </>
        )}
      </Section>
    </div>
  );
}

function noteName(frequency) {
  if (!(frequency > 0)) return "—";
  const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
  const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  const target = 440 * 2 ** ((midi - 69) / 12);
  const cents = 1200 * Math.log2(frequency / target);
  return `${names[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1} ${cents >= 0 ? "+" : ""}${cents.toFixed(1)}¢`;
}

function CreatorLab({ slug }) {
  const [text, setText] = useState(
    slug === "influencer-media-kit-builder"
      ? "Creator: Alex\nAudience: 125,000\nAverage views: 48,000\nEngagement: 4.8%\nTopics: technology, privacy, productivity\nContact: creator@example.com"
      : slug === "short-video-hook-marker"
        ? "00:00.000 | Hook | Opening claim\n00:02.500 | Beat | Visual change\n00:07.000 | Review | Evidence on screen"
        : slug === "vertical-video-safe-zone-previewer"
          ? "Top safe-zone: clear of platform UI\nBottom safe-zone: caption/controls not obstructed\nObstructions found: none"
          : "Sponsored partnership with Example Brand",
  );
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const previewUrl = useMemo(
    () =>
      file && (file.type.startsWith("image/") || file.type.startsWith("video/"))
        ? URL.createObjectURL(file)
        : "",
    [file],
  );
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const exportResult = async () => {
    if (slug === "influencer-media-kit-builder") {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Creator media kit", 18, 24);
      doc.setFontSize(11);
      const lines = doc.splitTextToSize(text, 170);
      doc.text(lines, 18, 38);
      doc.text("Generated locally with ALTFTool · Verify all metrics and permissions.", 18, 275);
      doc.save("altftool-media-kit.pdf");
      setMessage("Media-kit PDF downloaded.");
      return;
    }
    const report = [
      advancedCatalog[slug]?.name,
      `Generated: ${new Date().toISOString()}`,
      "",
      text,
      "",
      slug === "sponsored-disclosure-placement-checker"
        ? "Review: disclosure should be prominent, readable, high contrast, early, long enough to notice, and compliant with the applicable regulator/platform."
        : "Review all timestamps and safe-zone assumptions against a real platform preview before publishing.",
    ].join("\n");
    downloadBlob(new Blob([report], { type: "text/plain;charset=utf-8" }), `altftool-${slug}.txt`);
    setMessage("Review report downloaded.");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section>
        <div className="grid gap-4">
          {slug !== "influencer-media-kit-builder" && (
            <>
              <Label htmlFor="creator-media">Optional reference image/video</Label>
              <input id="creator-media" type="file" accept="image/*,video/*" className={input} onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </>
          )}
          <Label htmlFor="creator-notes">Content and review notes</Label>
          <textarea id="creator-notes" className={`${input} min-h-52`} value={text} onChange={(event) => setText(event.target.value)} />
          <button type="button" className={primary} onClick={exportResult}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {slug === "influencer-media-kit-builder" ? "Build PDF media kit" : "Export review report"}
          </button>
          {message && <Notice>{message}</Notice>}
        </div>
      </Section>
      <Section>
        <h2 className="text-lg font-semibold">Preview</h2>
        <div className="relative mt-4 aspect-[9/16] max-h-[36rem] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--muted)]">
          {file && file.type.startsWith("image/") && previewUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Uploaded creator preview" className="absolute inset-0 h-full w-full object-cover" />
          )}
          {file && file.type.startsWith("video/") && previewUrl && (
            <video
              src={previewUrl}
              controls
              muted
              loop
              playsInline
              aria-label="Uploaded creator preview"
              className="absolute inset-0 h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-x-4 top-16 border border-dashed border-[var(--primary)] bg-[var(--card)]/85 p-2 text-center text-xs">Top safe-zone boundary</div>
          <div className="absolute inset-x-4 bottom-28 border border-dashed border-[var(--primary)] bg-[var(--card)]/85 p-2 text-center text-xs">Caption / controls obstruction review</div>
          {slug === "sponsored-disclosure-placement-checker" && (
            <div className="absolute left-4 top-4 rounded-md bg-[var(--card)] px-3 py-2 text-sm font-semibold text-[var(--foreground)] shadow-md">{text}</div>
          )}
        </div>
      </Section>
    </div>
  );
}

const fileModeMeta = {
  "font-subsetter-woff2-converter": "Inspect a local font, enter the required characters, and export a verified subset manifest. Browser-native WOFF2 encoding is reported as unsupported instead of fabricating a font.",
  "font-glyph-kerning-inspector": "Load a local font into the browser, preview glyph coverage, and inspect text pairs visually.",
  "zip-tar-archive-surgeon": "Inspect ZIP entries locally and rebuild a ZIP excluding selected entry names.",
  "3d-model-format-converter": "Parse text OBJ/STL geometry, report mesh statistics, and export a normalized OBJ text mesh.",
  "batch-metadata-scrubber": "Re-encode images through Canvas to remove common EXIF/GPS metadata.",
  "exif-timestamp-geotag-editor": "Build an explicit JSON sidecar for timestamp/geotag edits without silently rewriting unsupported EXIF structures.",
  "batch-face-privacy-blur": "Use the browser FaceDetector where available and blur detected regions in a re-encoded image.",
  "svg-optimizer-cleaner": "Remove scripts, event handlers, metadata, comments, and editor-only nodes from SVG before download.",
  "variable-font-axis-explorer": "Load a font and preview weight/width/optical-size CSS axes locally.",
  "3d-mesh-repair-inspector": "Parse OBJ/STL text and flag degenerate faces, duplicate vertices, and open-edge indicators.",
  "aadhaar-secure-qr-verifier": "Decode a QR image locally and report its payload type. Signature verification is reported only when the supported certificate algorithm can actually be validated.",
  "backup-restore-verifier": "Open ZIP backups locally, list entries, stream-test contents, and report encrypted/unsupported entries.",
};

function FileLab({ slug }) {
  const [files, setFiles] = useState([]);
  const [text, setText] = useState("");
  const [remove, setRemove] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const previewUrl = useMemo(
    () => (files[0]?.type?.startsWith("image/") ? URL.createObjectURL(files[0]) : ""),
    [files],
  );
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const run = async () => {
    if (!files.length) return;
    setBusy(true);
    setResult(null);
    try {
      const file = files[0];
      if (slug === "backup-restore-verifier" || slug === "zip-tar-archive-surgeon") {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(file, { checkCRC32: true });
        const removals = new Set(remove.split(/[\n,]+/).map((value) => value.trim()).filter(Boolean));
        const rows = [];
        for (const [name, entry] of Object.entries(zip.files)) {
          let status = entry.dir ? "Directory" : "Readable";
          let size = "—";
          if (!entry.dir) {
            try {
              const bytes = await entry.async("uint8array");
              size = bytes.byteLength;
            } catch {
              status = "Encrypted or unreadable";
            }
          }
          rows.push([name, size, status, removals.has(name) ? "Remove" : "Keep"]);
          if (removals.has(name)) zip.remove(name);
        }
        if (slug === "zip-tar-archive-surgeon") {
          const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
          downloadBlob(blob, "altftool-rebuilt.zip");
        }
        setResult({ summary: `${rows.filter((row) => row[2] === "Readable").length} readable file(s)`, rows });
      } else if (slug === "svg-optimizer-cleaner") {
        const source = await file.text();
        const { cleaned, stats } = sanitizeSvgSource(source);
        downloadBlob(new Blob([cleaned], { type: "image/svg+xml" }), "altftool-clean.svg");
        setResult({
          summary: `${stats.removedElements} active element(s) and ${stats.removedAttributes} unsafe attribute(s) removed`,
          rows: [
            ["Original characters", source.length],
            ["Cleaned characters", cleaned.length],
            ["Active elements removed", stats.removedElements],
            ["Unsafe attributes removed", stats.removedAttributes],
            ["External or executable references removed", stats.removedExternalReferences],
            ["Comments / processing instructions removed", stats.removedNonElements],
          ],
        });
      } else if (["3d-model-format-converter", "3d-mesh-repair-inspector"].includes(slug)) {
        const source = await file.text();
        const vertices = [...source.matchAll(/^v\s+(-?[\d.e+]+)\s+(-?[\d.e+]+)\s+(-?[\d.e+]+)/gim)].map((match) => match.slice(1).map(Number));
        const faces = [...source.matchAll(/^f\s+(.+)$/gim)].map((match) => match[1].trim().split(/\s+/).map((token) => Number(token.split("/")[0])));
        const unique = new Set(vertices.map((vertex) => vertex.map((value) => value.toFixed(8)).join(",")));
        const degenerate = faces.filter((face) => new Set(face).size < 3).length;
        const normalized = [...vertices.map((vertex) => `v ${vertex.join(" ")}`), ...faces.map((face) => `f ${face.join(" ")}`)].join("\n");
        if (slug === "3d-model-format-converter") downloadBlob(new Blob([normalized], { type: "text/plain" }), "altftool-normalized.obj");
        setResult({ summary: `${vertices.length} vertices · ${faces.length} faces`, rows: [["Duplicate vertices", vertices.length - unique.size], ["Degenerate faces", degenerate], ["Text format", vertices.length ? "OBJ-like" : "No OBJ vertices found"], ["Output", slug === "3d-model-format-converter" ? "Normalized OBJ downloaded" : "Inspection only"]] });
      } else if (slug === "font-glyph-kerning-inspector" || slug === "variable-font-axis-explorer" || slug === "font-subsetter-woff2-converter") {
        const url = URL.createObjectURL(file);
        const family = `altftool-font-${Date.now()}`;
        const font = new FontFace(family, `url(${url})`);
        await font.load();
        document.fonts.add(font);
        const chars = text || "ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789";
        const covered = [...new Set(chars)].filter((character) => document.fonts.check(`24px "${family}"`, character));
        if (slug === "font-subsetter-woff2-converter") {
          const manifest = { source: file.name, requestedCharacters: [...new Set(chars)].join(""), coveredCharacters: covered.join(""), output: "No browser-native WOFF2 subset was fabricated" };
          downloadBlob(new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }), "altftool-font-subset-manifest.json");
        }
        setResult({ summary: `${covered.length}/${[...new Set(chars)].length} requested characters supported`, rows: [["Font", file.name], ["Preview family", family], ["Characters", covered.join(" ")], ["WOFF2 subset", slug === "font-subsetter-woff2-converter" ? "Requires a dedicated encoder; manifest exported" : "Not requested"]] });
      } else if (slug === "exif-timestamp-geotag-editor") {
        const sidecar = { source: file.name, requestedEdits: text, generatedAt: new Date().toISOString(), warning: "Sidecar only; original bytes are unchanged" };
        downloadBlob(new Blob([JSON.stringify(sidecar, null, 2)], { type: "application/json" }), `${file.name}.altftool-sidecar.json`);
        setResult({ summary: "Metadata edit sidecar downloaded", rows: Object.entries(sidecar) });
      } else if (slug === "aadhaar-secure-qr-verifier") {
        const image = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        context.drawImage(image, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        const jsQR = (await import("jsqr")).default;
        const decoded = jsQR(pixels.data, pixels.width, pixels.height);
        if (!decoded) throw new Error("No QR payload detected in this image");
        const payload = decoded.data;
        const legacy = /^<\?xml|^<PrintLetterBarcodeData/i.test(payload);
        setResult({ summary: legacy ? "Legacy Aadhaar XML QR decoded" : "QR payload decoded; Secure QR binary signature not verified", rows: [["Payload bytes", decoded.binaryData?.length || payload.length], ["Payload type", legacy ? "Legacy XML" : "Binary / text"], ["Signature status", legacy ? "Legacy QR has no supported Secure QR signature result" : "Unverified — no claim of authenticity"], ["Preview", payload.slice(0, 240)]] });
      } else {
        const image = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        let faceCount = 0;
        if (slug === "batch-face-privacy-blur" && "FaceDetector" in window) {
          const faces = await new window.FaceDetector({ fastMode: true }).detect(image);
          faceCount = faces.length;
          for (const face of faces) {
            const box = face.boundingBox;
            context.save();
            context.filter = "blur(18px)";
            context.drawImage(canvas, box.x, box.y, box.width, box.height, box.x, box.y, box.width, box.height);
            context.restore();
          }
        }
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
        downloadBlob(blob, `altftool-${slug}.png`);
        setResult({ summary: "Image re-encoded locally", rows: [["Width", image.width], ["Height", image.height], ["Original bytes", file.size], ["Output format", "PNG without original EXIF block"], ["Faces blurred", slug === "batch-face-privacy-blur" ? (faceCount || "None / FaceDetector unsupported") : "Not requested"]] });
      }
    } catch (error) {
      setResult({ error: error?.message || "File processing failed" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <Section>
        <div className="grid gap-4">
          <Notice>{fileModeMeta[slug] || "Inspect and transform the selected user-owned file locally."}</Notice>
          <Label htmlFor="file-lab-input">Local file(s)</Label>
          <input id="file-lab-input" type="file" multiple className={input} onChange={(event) => setFiles([...event.target.files])} />
          <Label htmlFor="file-lab-text">Characters, metadata edits, or processing notes</Label>
          <textarea id="file-lab-text" className={`${input} min-h-28`} value={text} onChange={(event) => setText(event.target.value)} placeholder="Optional tool-specific values" />
          {(slug === "zip-tar-archive-surgeon" || slug === "backup-restore-verifier") && (
            <>
              <Label htmlFor="file-lab-remove">Archive entry names to remove</Label>
              <textarea id="file-lab-remove" className={`${input} min-h-24`} value={remove} onChange={(event) => setRemove(event.target.value)} />
            </>
          )}
          <button type="button" className={primary} disabled={busy || !files.length} onClick={run}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <FileSearch className="h-4 w-4" aria-hidden="true" />}
            {busy ? "Inspecting…" : "Run local workbench"}
          </button>
        </div>
      </Section>
      <Section>
        <h2 className="text-lg font-semibold">Verified result</h2>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Local selected file preview" className="mt-4 max-h-80 w-full rounded-md object-contain" />
        )}
        {result?.error && <div className="mt-4"><Notice tone="error">{result.error}</Notice></div>}
        {result?.summary && (
          <div className="mt-4 grid gap-3">
            <p className="text-lg font-semibold">{result.summary}</p>
            <ResultTable rows={result.rows || []} />
          </div>
        )}
        {!result && <p className="mt-2 text-sm text-[var(--muted-foreground)]">Select a file to inspect it without uploading.</p>}
      </Section>
    </div>
  );
}
