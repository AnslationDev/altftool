"use client";

import { useMemo, useState } from "react";
import { Aperture, Check, Copy, Download } from "lucide-react";

import {
  METER_EV_MAX,
  METER_EV_MIN,
  clampExposureMeterValue,
  exposureMeterPercent,
} from "../lib";

const APERTURE_OPTIONS = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16];
const SHUTTER_OPTIONS = ["1/4000", "1/2000", "1/1000", "1/500", "1/250", "1/125", "1/60", "1/30", "1/15", "1/8", "1/4", "1/2", "1"];
const ISO_OPTIONS = [100, 200, 400, 800, 1600, 3200, 6400];

const SCENE_PRESETS = {
  "Bright Sun": { aperture: "8", shutter: "1/500", iso: "100" },
  "Cloudy Day": { aperture: "5.6", shutter: "1/250", iso: "200" },
  "Golden Hour": { aperture: "2.8", shutter: "1/250", iso: "200" },
  "Indoor Portrait": { aperture: "2", shutter: "1/125", iso: "800" },
  "Night Street": { aperture: "1.8", shutter: "1/60", iso: "3200" },
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

function shutterToSeconds(s) {
  if (s.includes("/")) {
    const [a, b] = s.split("/").map(Number);
    return a / b;
  }
  return Number(s);
}

function exposureStatus(ev) {
  if (ev < 7) return "Low Light Setup";
  if (ev < 11) return "Balanced Exposure";
  if (ev < 14) return "Bright Scene Setup";
  return "Very Bright Scene Setup";
}

export default function ToolHome() {
  const [aperture, setAperture] = useState("2.8");
  const [shutter, setShutter] = useState("1/125");
  const [iso, setIso] = useState("200");
  const [preset, setPreset] = useState("");
  const [focalLength, setFocalLength] = useState("50");
  const [stabilization, setStabilization] = useState("on");
  const [meterBias, setMeterBias] = useState("0");
  const [subjectSpeed, setSubjectSpeed] = useState("walking");
  const [targetEv, setTargetEv] = useState("10");
  const [copyState, setCopyState] = useState("idle"); // idle | copied | error

  const result = useMemo(() => {
    const a = Number(aperture);
    const t = shutterToSeconds(shutter);
    const i = Number(iso);

    const ev100 = Math.log2((a * a) / t);
    const evAdjusted = ev100 - Math.log2(i / 100) + Number(meterBias || 0);

    const depthOfField = a <= 2.8 ? "Shallow" : a <= 8 ? "Medium" : "Deep";
    const motion = t <= 1 / 250 ? "Frozen" : t <= 1 / 60 ? "Natural" : "Blur likely";
    const noise = i <= 400 ? "Low" : i <= 1600 ? "Moderate" : "High";
    const minSafeShutter = 1 / Math.max(1, Number(focalLength) || 50);
    const handheldRisk = t > minSafeShutter && stabilization === "off" ? "High" : t > minSafeShutter ? "Moderate" : "Low";
    const subjectNeed =
      subjectSpeed === "still" ? 1 / 60 :
      subjectSpeed === "walking" ? 1 / 160 :
      subjectSpeed === "sports" ? 1 / 500 : 1 / 1000;
    const subjectFreeze = t <= subjectNeed ? "Good" : "Weak";
    const stopDelta = Number(evAdjusted) - (Number(targetEv) || 10);
    const meterValue = clampExposureMeterValue(evAdjusted);
    const meterPct = exposureMeterPercent(evAdjusted);

    const recommendations = [];
    if (subjectFreeze === "Weak") recommendations.push("Use a faster shutter speed for your subject movement.");
    if (noise === "High") recommendations.push("Reduce ISO and open aperture or slow shutter if possible.");
    if (handheldRisk !== "Low") recommendations.push("Raise shutter speed or enable stabilization/tripod.");
    if (!recommendations.length) recommendations.push("Current settings are well balanced for this scenario.");

    const altPairs = [
      `Keep brightness: ${shutter} -> next slower + aperture one stop down`,
      `Keep brightness: ISO ${iso} -> half ISO + shutter one stop slower`,
      `For cleaner image: keep aperture, lower ISO and compensate with slower shutter`,
    ];

    return {
      ev100: ev100.toFixed(1),
      evAdjusted: evAdjusted.toFixed(1),
      status: exposureStatus(evAdjusted),
      depthOfField,
      motion,
      noise,
      handheldRisk,
      subjectFreeze,
      minSafeShutter: `1/${Math.round(1 / minSafeShutter)}`,
      stopDelta: stopDelta.toFixed(1),
      meterValue,
      meterPct,
      recommendations,
      altPairs,
    };
  }, [aperture, shutter, iso, focalLength, stabilization, meterBias, subjectSpeed, targetEv]);

  const applyPreset = (name) => {
    setPreset(name);
    const p = SCENE_PRESETS[name];
    if (!p) return;
    setAperture(p.aperture);
    setShutter(p.shutter);
    setIso(p.iso);
  };

  const copySettings = async () => {
    const text = [
      `Exposure Setup`,
      `Aperture: f/${aperture}`,
      `Shutter: ${shutter}s`,
      `ISO: ${iso}`,
      `Adjusted EV: ${result.evAdjusted}`,
      `Status: ${result.status}`,
      `Handheld Risk: ${result.handheldRisk}`,
      `Subject Freeze: ${result.subjectFreeze}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 1500);
    }
  };

  const exportSettings = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      settings: { aperture, shutter, iso, focalLength, stabilization, meterBias, subjectSpeed, targetEv },
      analysis: result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exposure-triangle-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyLabel = copyState === "copied" ? "Copied!" : copyState === "error" ? "Copy failed" : "Copy Settings";

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Aperture className="h-4 w-4" aria-hidden="true" />
          Exposure engine active
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Exposure Triangle Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Understand aperture, shutter speed, and ISO with real-time exposure feedback.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Exposure Status</p>
          <p className="mt-1 text-lg font-semibold text-[var(--primary)]">{result.status}</p>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Adjusted EV</p>
          <p className="mt-1 text-lg font-semibold text-[var(--primary)]">{result.evAdjusted}</p>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Handheld Risk</p>
          <p className="mt-1 text-lg font-semibold text-[var(--primary)]">{result.handheldRisk}</p>
        </div>
        <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Noise Profile</p>
          <p className="mt-1 text-lg font-semibold text-[var(--primary)]">{result.noise}</p>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={copySettings} className={GHOST_BTN}>
            {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copyState === "idle" ? "Copy Camera Setup" : copyLabel}
          </button>
          <button type="button" onClick={exportSettings} className={GHOST_BTN}>
            <Download className="h-4 w-4" aria-hidden="true" />
            Export Plan
          </button>
          <span className="inline-flex min-h-11 items-center rounded-md bg-[var(--muted)] px-4 text-sm font-semibold text-[var(--muted-foreground)]">
            Pro Metering Mode
          </span>
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div>
            <h2 className="text-base font-semibold">Camera Settings</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-preset">Scene Preset</label>
                <select id="etg-preset" className={`mt-2 ${INPUT_CLASS}`} value={preset} onChange={(e) => applyPreset(e.target.value)}>
                  <option value="">Select Scene Preset</option>
                  {Object.keys(SCENE_PRESETS).map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-aperture">Aperture (f)</label>
                <select id="etg-aperture" className={`mt-2 ${INPUT_CLASS}`} value={aperture} onChange={(e) => setAperture(e.target.value)}>
                  {APERTURE_OPTIONS.map((v) => <option key={v} value={v}>{`f/${v}`}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-shutter">Shutter Speed</label>
                <select id="etg-shutter" className={`mt-2 ${INPUT_CLASS}`} value={shutter} onChange={(e) => setShutter(e.target.value)}>
                  {SHUTTER_OPTIONS.map((v) => <option key={v} value={v}>{v}s</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-iso">ISO</label>
                <select id="etg-iso" className={`mt-2 ${INPUT_CLASS}`} value={iso} onChange={(e) => setIso(e.target.value)}>
                  {ISO_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-focal-length">Focal Length (mm)</label>
                <input
                  id="etg-focal-length"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  min="10"
                  value={focalLength}
                  onChange={(e) => setFocalLength(e.target.value)}
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-stabilization">Stabilization</label>
                <select id="etg-stabilization" className={`mt-2 ${INPUT_CLASS}`} value={stabilization} onChange={(e) => setStabilization(e.target.value)}>
                  <option value="on">On</option>
                  <option value="off">Off</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-meter-bias">Meter Bias (EV)</label>
                <select id="etg-meter-bias" className={`mt-2 ${INPUT_CLASS}`} value={meterBias} onChange={(e) => setMeterBias(e.target.value)}>
                  <option value="-1">-1</option>
                  <option value="-0.7">-0.7</option>
                  <option value="-0.3">-0.3</option>
                  <option value="0">0</option>
                  <option value="0.3">+0.3</option>
                  <option value="0.7">+0.7</option>
                  <option value="1">+1</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-subject-speed">Subject Speed</label>
                <select id="etg-subject-speed" className={`mt-2 ${INPUT_CLASS}`} value={subjectSpeed} onChange={(e) => setSubjectSpeed(e.target.value)}>
                  <option value="still">Still</option>
                  <option value="walking">Walking</option>
                  <option value="sports">Sports</option>
                  <option value="fast-action">Fast Action</option>
                </select>
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="etg-target-ev">Target EV</label>
                <input
                  id="etg-target-ev"
                  className={`mt-2 ${INPUT_CLASS}`}
                  type="number"
                  step="0.1"
                  value={targetEv}
                  onChange={(e) => setTargetEv(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={copySettings} className={GHOST_BTN}>
                {copyState === "copied" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copyLabel}
              </button>
              <button type="button" onClick={exportSettings} className={GHOST_BTN}>
                <Download className="h-4 w-4" aria-hidden="true" />
                Export JSON
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--muted)]/40 p-4" aria-live="polite" role="status">
              <h2 className="text-base font-semibold">Exposure Result</h2>
              <div className="mt-2 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
                <p>EV100: <strong className="text-[var(--foreground)]">{result.ev100}</strong></p>
                <p>Adjusted EV: <strong className="text-[var(--foreground)]">{result.evAdjusted}</strong></p>
                <p>Stop Delta vs Target: <strong className="text-[var(--foreground)]">{result.stopDelta} stops</strong></p>
                <p>Status: <strong className="text-[var(--foreground)]">{result.status}</strong></p>
              </div>
              <div
                className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                role="progressbar"
                aria-label="Adjusted EV meter"
                aria-valuemin={METER_EV_MIN}
                aria-valuemax={METER_EV_MAX}
                aria-valuenow={result.meterValue}
                aria-valuetext={`EV ${result.evAdjusted}`}
              >
                <span className="block h-full bg-[var(--primary)]" style={{ width: `${result.meterPct}%` }} />
              </div>
            </div>

            <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--muted)]/40 p-4" aria-live="polite" role="status">
              <h2 className="text-base font-semibold">Creative Impact</h2>
              <div className="mt-2 space-y-1 text-sm leading-6 text-[var(--muted-foreground)]">
                <p>Depth of Field: <strong className="text-[var(--foreground)]">{result.depthOfField}</strong></p>
                <p>Motion Rendering: <strong className="text-[var(--foreground)]">{result.motion}</strong></p>
                <p>Noise Profile: <strong className="text-[var(--foreground)]">{result.noise}</strong></p>
                <p>Handheld Blur Risk: <strong className="text-[var(--foreground)]">{result.handheldRisk}</strong></p>
                <p>Subject Freeze Quality: <strong className="text-[var(--foreground)]">{result.subjectFreeze}</strong></p>
                <p>Safe Min Shutter: <strong className="text-[var(--foreground)]">{result.minSafeShutter}s</strong></p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--muted)]/40 p-4">
                <h2 className="text-base font-semibold">Equivalent Exposure Ideas</h2>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {result.altPairs.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
              <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--muted)]/40 p-4">
                <h2 className="text-base font-semibold">Smart Recommendations</h2>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
                  {result.recommendations.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">How It Works</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">A practical flow to expose consistently in real shoots.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Pick a scene preset as your base exposure.",
            "Set creative goal first: blur background, freeze motion, or low noise.",
            "Adjust one axis at a time and watch EV + impact metrics.",
            "Use advanced checks (safe shutter, subject speed, bias) before final capture.",
          ].map((step, i) => (
            <div key={step} className="rounded-md bg-[var(--muted)] p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">Step {i + 1}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-lg font-semibold">Features</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">Advanced tools for learners and working photographers.</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            "Live EV100 and ISO-adjusted EV feedback",
            "Scene presets for common lighting conditions",
            "Depth of field, motion, and noise interpretation",
            "Handheld safety check using focal-length rule",
            "Subject-speed freeze recommendation",
            "Meter bias simulation for creative exposure control",
          ].map((feature) => (
            <div key={feature} className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
              {feature}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
