"use client";

import { useMemo, useState } from "react";

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
    const stopDelta = Number(evAdjusted) - Number(targetEv || 10);
    const meterPct = Math.max(0, Math.min(100, ((Number(evAdjusted) + 2) / 18) * 100));

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

  const timelineRows = [
    { label: "Blue Hour", angle: "-6° to -4°", start: "05:10 AM", end: "05:22 AM", duration: "12m" },
    { label: "Golden Hour", angle: "-4° to +6°", start: "05:22 AM", end: "06:14 AM", duration: "52m" },
    { label: "Sunrise", angle: "0°", start: "05:37 AM", end: "Instant", duration: "-" },
    { label: "Solar Noon", angle: "Highest Point", start: "12:42 PM", end: "Instant", duration: "-" },
    { label: "Sunset", angle: "0°", start: "08:08 PM", end: "Instant", duration: "-" },
  ];

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
    await navigator.clipboard.writeText(text);
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

  return (
    <div className="etg-shell">
      <div className="etg-container">
        <div className="etg-hero">
          <div className="etg-chip-top">Exposure Engine Active</div>
          <h1 className="heading etg-title">Exposure Triangle Guide</h1>
          <p className="description etg-subtitle">Understand aperture, shutter speed, and ISO with real-time exposure feedback.</p>
        </div>

        <div className="etg-stat-row">
          <div className="etg-stat-card"><span>Exposure Status</span><strong>{result.status}</strong></div>
          <div className="etg-stat-card"><span>Adjusted EV</span><strong>{result.evAdjusted}</strong></div>
          <div className="etg-stat-card"><span>Handheld Risk</span><strong>{result.handheldRisk}</strong></div>
          <div className="etg-stat-card"><span>Noise Profile</span><strong>{result.noise}</strong></div>
        </div>

        <div className="etg-card etg-master-panel">
          <div className="etg-top-pills">
            <button className="etg-pill etg-pill-primary" onClick={copySettings}>Copy Camera Setup</button>
            <button className="etg-pill" onClick={exportSettings}>Export Plan</button>
            <span className="etg-pill etg-pill-muted">Pro Metering Mode</span>
          </div>

          <div className="etg-main-grid">
            <div className="etg-left-rail">
              <h3 className="etg-mini-head">Camera Settings</h3>
              <div className="etg-form-grid">
                <div>
                  <label className="etg-label">Scene Preset</label>
                  <select className="etg-input" value={preset} onChange={(e) => applyPreset(e.target.value)}>
                    <option value="">Select Scene Preset</option>
                    {Object.keys(SCENE_PRESETS).map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="etg-label">Aperture (f)</label>
                  <select className="etg-input" value={aperture} onChange={(e) => setAperture(e.target.value)}>
                    {APERTURE_OPTIONS.map((v) => <option key={v} value={v}>{`f/${v}`}</option>)}
                  </select>
                </div>
                <div>
                  <label className="etg-label">Shutter Speed</label>
                  <select className="etg-input" value={shutter} onChange={(e) => setShutter(e.target.value)}>
                    {SHUTTER_OPTIONS.map((v) => <option key={v} value={v}>{v}s</option>)}
                  </select>
                </div>
                <div>
                  <label className="etg-label">ISO</label>
                  <select className="etg-input" value={iso} onChange={(e) => setIso(e.target.value)}>
                    {ISO_OPTIONS.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="etg-label">Focal Length (mm)</label>
                  <input className="etg-input" type="number" min="10" value={focalLength} onChange={(e) => setFocalLength(e.target.value)} />
                </div>
                <div>
                  <label className="etg-label">Stabilization</label>
                  <select className="etg-input" value={stabilization} onChange={(e) => setStabilization(e.target.value)}>
                    <option value="on">On</option>
                    <option value="off">Off</option>
                  </select>
                </div>
                <div>
                  <label className="etg-label">Meter Bias (EV)</label>
                  <select className="etg-input" value={meterBias} onChange={(e) => setMeterBias(e.target.value)}>
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
                  <label className="etg-label">Subject Speed</label>
                  <select className="etg-input" value={subjectSpeed} onChange={(e) => setSubjectSpeed(e.target.value)}>
                    <option value="still">Still</option>
                    <option value="walking">Walking</option>
                    <option value="sports">Sports</option>
                    <option value="fast-action">Fast Action</option>
                  </select>
                </div>
                <div>
                  <label className="etg-label">Target EV</label>
                  <input className="etg-input" type="number" step="0.1" value={targetEv} onChange={(e) => setTargetEv(e.target.value)} />
                </div>
              </div>
              <div className="etg-actions">
                <button className="etg-btn etg-btn-primary" onClick={copySettings}>Copy Settings</button>
                <button className="etg-btn etg-btn-secondary" onClick={exportSettings}>Export JSON</button>
              </div>
            </div>

            <div className="etg-right-pane">
              <div className="etg-card etg-panel etg-soft-panel">
                <h2 className="etg-h2">Exposure Result</h2>
                <p className="etg-muted">EV100: <strong>{result.ev100}</strong></p>
                <p className="etg-muted">Adjusted EV: <strong>{result.evAdjusted}</strong></p>
                <p className="etg-muted">Stop Delta vs Target: <strong>{result.stopDelta} stops</strong></p>
                <p className="etg-muted">Status: <strong>{result.status}</strong></p>
                <div className="etg-meter">
                  <div className="etg-meter-fill" style={{ width: `${result.meterPct}%` }} />
                </div>
              </div>

              <div className="etg-card etg-panel etg-soft-panel">
                <h2 className="etg-h2">Creative Impact</h2>
                <p className="etg-muted">Depth of Field: <strong>{result.depthOfField}</strong></p>
                <p className="etg-muted">Motion Rendering: <strong>{result.motion}</strong></p>
                <p className="etg-muted">Noise Profile: <strong>{result.noise}</strong></p>
                <p className="etg-muted">Handheld Blur Risk: <strong>{result.handheldRisk}</strong></p>
                <p className="etg-muted">Subject Freeze Quality: <strong>{result.subjectFreeze}</strong></p>
                <p className="etg-muted">Safe Min Shutter: <strong>{result.minSafeShutter}s</strong></p>
              </div>

              <div className="etg-card etg-panel etg-soft-panel">
                <h2 className="etg-h2">Exposure Timeline</h2>
                <div className="etg-table-wrap">
                  <table className="etg-table">
                    <thead>
                      <tr>
                        <th>Window</th>
                        <th>Angles</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineRows.map((row) => (
                        <tr key={row.label}>
                          <td>{row.label}</td>
                          <td>{row.angle}</td>
                          <td>{row.start}</td>
                          <td>{row.end}</td>
                          <td>{row.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="etg-grid">
                <div className="etg-card etg-panel etg-soft-panel">
                  <h2 className="etg-h2">Equivalent Exposure Ideas</h2>
                  <ul className="etg-list">
                    {result.altPairs.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
                <div className="etg-card etg-panel etg-soft-panel">
                  <h2 className="etg-h2">Smart Recommendations</h2>
                  <ul className="etg-list">
                    {result.recommendations.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="etg-section">
          <div className="etg-card etg-panel">
            <h2 className="etg-section-title">How It Works</h2>
            <p className="etg-section-subtitle">A practical flow to expose consistently in real shoots.</p>
            <div className="etg-info-grid">
              {[
                "Pick a scene preset as your base exposure.",
                "Set creative goal first: blur background, freeze motion, or low noise.",
                "Adjust one axis at a time and watch EV + impact metrics.",
                "Use advanced checks (safe shutter, subject speed, bias) before final capture.",
              ].map((step, i) => (
                <div className="etg-info-item" key={step}>
                  <div className="etg-step-tag">Step {i + 1}</div>
                  <p className="etg-muted">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="etg-section">
          <div className="etg-card etg-panel">
            <h2 className="etg-section-title">Features</h2>
            <p className="etg-section-subtitle">Advanced tools for learners and working photographers.</p>
            <div className="etg-feature-grid">
              {[
                "Live EV100 and ISO-adjusted EV feedback",
                "Scene presets for common lighting conditions",
                "Depth of field, motion, and noise interpretation",
                "Handheld safety check using focal-length rule",
                "Subject-speed freeze recommendation",
                "Meter bias simulation for creative exposure control",
              ].map((feature) => (
                <div className="etg-feature-item" key={feature}>{feature}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
