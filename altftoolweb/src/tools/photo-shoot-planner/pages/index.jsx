"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "photo-shoot-planner-v1";

const SHOT_LIBRARY = {
  fashion: ["Full-body hero", "Close-up portrait", "Walking motion", "Detail accessories", "Backlit silhouette"],
  product: ["Front hero", "45 degree angle", "Macro texture", "In-use lifestyle", "Packaging flat lay"],
  wedding: ["Venue wide", "Couple portrait", "Family group", "Ring detail", "Golden-hour candid"],
  travel: ["Establishing wide", "Street candid", "Culture detail", "Food close-up", "Sunset landscape"],
  portrait: ["Headshot clean", "Three-quarter pose", "Environment portrait", "Hands detail", "Mood profile"],
};

const LIGHTING_PRESETS = {
  daylight: "Use reflectors and soft diffusion between 9 AM to 11 AM.",
  studio: "Start with key + fill at 2:1 ratio and add rim light for separation.",
  goldenhour: "Prioritize backlight, expose for skin, and keep white balance warm.",
  mixed: "Lock white balance, flag practicals, and gel key light to match ambient.",
};

function buildTimeline(startTime, slots, duration) {
  const [h, m] = startTime.split(":").map(Number);
  let minuteCursor = h * 60 + m;
  return Array.from({ length: slots }).map((_, i) => {
    const blockStart = minuteCursor;
    const blockEnd = minuteCursor + duration;
    minuteCursor += duration;
    const sH = String(Math.floor(blockStart / 60)).padStart(2, "0");
    const sM = String(blockStart % 60).padStart(2, "0");
    const eH = String(Math.floor(blockEnd / 60)).padStart(2, "0");
    const eM = String(blockEnd % 60).padStart(2, "0");
    return `${sH}:${sM} - ${eH}:${eM}`;
  });
}

export default function ToolHome() {
  const [projectName, setProjectName] = useState("");
  const [shootType, setShootType] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [slots, setSlots] = useState("");
  const [blockMinutes, setBlockMinutes] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [setupMinutes, setSetupMinutes] = useState("");
  const [bufferPercent, setBufferPercent] = useState("");
  const [clientPriority, setClientPriority] = useState("");
  const [budget, setBudget] = useState("");
  const [lighting, setLighting] = useState("");
  const [mustHave, setMustHave] = useState("");
  const [completedShots, setCompletedShots] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setProjectName(parsed.projectName || "");
      setShootType(parsed.shootType || "");
      setLocation(parsed.location || "");
      setDate(parsed.date || "");
      setStartTime(parsed.startTime || "");
      setSlots(parsed.slots || "");
      setBlockMinutes(parsed.blockMinutes || "");
      setTeamSize(parsed.teamSize || "");
      setSetupMinutes(parsed.setupMinutes || "");
      setBufferPercent(parsed.bufferPercent || "");
      setClientPriority(parsed.clientPriority || "");
      setBudget(parsed.budget || "");
      setLighting(parsed.lighting || "");
      setMustHave(parsed.mustHave || "");
      setCompletedShots(Array.isArray(parsed.completedShots) ? parsed.completedShots : []);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        projectName,
        shootType,
        location,
        date,
        startTime,
        slots,
        blockMinutes,
        teamSize,
        setupMinutes,
        bufferPercent,
        clientPriority,
        budget,
        lighting,
        mustHave,
        completedShots,
      })
    );
  }, [
    projectName,
    shootType,
    location,
    date,
    startTime,
    slots,
    blockMinutes,
    teamSize,
    setupMinutes,
    bufferPercent,
    clientPriority,
    budget,
    lighting,
    mustHave,
    completedShots,
  ]);

  const plan = useMemo(() => {
    const baseShots = SHOT_LIBRARY[shootType] || SHOT_LIBRARY.portrait;
    const slotCount = Math.max(1, Number(slots) || 1);
    const duration = Math.max(15, Number(blockMinutes) || 30);
    const timeline = buildTimeline(startTime, slotCount, duration);
    const shotList = Array.from({ length: slotCount }).map((_, i) => ({
      block: i + 1,
      time: timeline[i],
      shot: baseShots[i % baseShots.length],
      owner: i % 2 === 0 ? "Photographer" : "Assistant",
      priority: i < 2 ? "High" : i < 4 ? "Medium" : "Low",
    }));
    const shootMinutes = slotCount * duration;
    const setup = Math.max(0, Number(setupMinutes) || 0);
    const buffer = Math.round(shootMinutes * ((Number(bufferPercent) || 0) / 100));
    const totalMinutes = shootMinutes + setup + buffer;
    const budgetPerHour = Math.round((Number(budget) || 0) / Math.max(1, totalMinutes / 60));
    const riskScore = Math.min(
      100,
      Math.max(5, Math.round((slotCount * 8) + (duration < 40 ? 15 : 0) + (Number(teamSize) < 3 ? 20 : 0) + (Number(bufferPercent) < 10 ? 20 : 0)))
    );

    return {
      summary: {
        projectName,
        shootType,
        location,
        date: date || "Not set",
        teamSize,
        lighting,
      },
      metrics: {
        setupMinutes: setup,
        shootMinutes,
        bufferMinutes: buffer,
        totalMinutes,
        budgetPerHour,
        riskScore,
        clientPriority,
      },
      lightingNote: LIGHTING_PRESETS[lighting] || "Choose a lighting style to get direction notes.",
      mustHave: mustHave
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      checklist: [
        "Charge camera batteries and format memory cards",
        "Confirm permits and location access windows",
        "Pack lenses, lights, modifiers, and backup body",
        "Share call sheet with team and talent",
        "Prepare mood references and shot priorities",
        "Assign backup camera operator and data wrangler",
        "Create end-of-day backup plan (SSD + cloud sync)",
      ],
      shotList,
    };
  }, [projectName, shootType, location, date, startTime, slots, blockMinutes, teamSize, setupMinutes, bufferPercent, clientPriority, budget, lighting, mustHave]);

  const exportJson = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      ...plan,
      completedShots,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo-shoot-plan.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const rows = [
      ["Block", "Time", "Shot", "Owner", "Priority", "Completed"],
      ...plan.shotList.map((item, i) => [
        String(item.block),
        item.time,
        item.shot,
        item.owner,
        item.priority,
        completedShots.includes(i) ? "Yes" : "No",
      ]),
    ];
    const csv = rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "photo-shoot-shotlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copySummary = async () => {
    const lines = [
      `Project: ${projectName}`,
      `Type: ${shootType}`,
      `Location: ${location}`,
      `Date: ${date || "Not set"} ${startTime}`,
      `Total runtime: ${plan.metrics.totalMinutes} min`,
      `Budget/hr: INR ${plan.metrics.budgetPerHour}`,
      `Risk score: ${plan.metrics.riskScore}/100`,
      `Must-have: ${plan.mustHave.join(", ") || "None"}`,
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
  };

  const toggleShotComplete = (idx) => {
    setCompletedShots((prev) => (
      prev.includes(idx) ? prev.filter((x) => x !== idx) : [...prev, idx]
    ));
  };

  const resetForm = () => {
    setProjectName("");
    setShootType("");
    setLocation("");
    setDate("");
    setStartTime("");
    setSlots("");
    setBlockMinutes("");
    setTeamSize("");
    setSetupMinutes("");
    setBufferPercent("");
    setClientPriority("");
    setBudget("");
    setLighting("");
    setMustHave("");
    setCompletedShots([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const completedCount = plan.shotList.reduce((acc, _, idx) => acc + (completedShots.includes(idx) ? 1 : 0), 0);
  const completionPct = Math.round((completedCount / Math.max(1, plan.shotList.length)) * 100);
  const timelineRows = plan.shotList.map((item) => ({
    block: `Block ${item.block}`,
    shot: item.shot,
    start: item.time.split(" - ")[0] || item.time,
    end: item.time.split(" - ")[1] || "-",
    priority: item.priority,
  }));

  return (
    <div className="psp-shell">
      <div className="psp-container">
        <div className="psp-hero">
          <div className="psp-chip-top">Production Protocol Active</div>
          <h1 className="heading psp-title">Photo Shoot Planner</h1>
          <p className="description psp-subtitle">Build an organized schedule, shot list, and production checklist in minutes.</p>
        </div>

        <div className="psp-stat-row">
          <div className="psp-stat-card"><span>Active Phase</span><strong>{shootType || "Not set"}</strong></div>
          <div className="psp-stat-card"><span>Completion</span><strong>{completionPct}%</strong></div>
          <div className="psp-stat-card"><span>Budget / Hour</span><strong>INR {plan.metrics.budgetPerHour}</strong></div>
          <div className="psp-stat-card"><span>Risk Score</span><strong>{plan.metrics.riskScore}/100</strong></div>
        </div>

        <div className="psp-card psp-master-panel">
          <div className="psp-top-pills">
            <button onClick={copySummary} className="psp-pill psp-pill-primary">Copy Plan Summary</button>
            <button onClick={exportJson} className="psp-pill">Export JSON</button>
            <button onClick={exportCsv} className="psp-pill">Export CSV</button>
            <span className="psp-pill psp-pill-muted">Shoot Engine Core Active</span>
          </div>

          <div className="psp-main-grid">
            <div className="psp-left-rail">
              <h3 className="psp-mini-head">Production Settings</h3>
              <div className="psp-form-grid">
                <input className="psp-input" value={projectName} onChange={(e) => setProjectName(e.target.value)} placeholder="Project name" />
                <input className="psp-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" />
                <select className="psp-input" value={shootType} onChange={(e) => setShootType(e.target.value)}>
                  <option value="">Select shoot type</option>
                  <option value="fashion">Fashion</option>
                  <option value="product">Product</option>
                  <option value="wedding">Wedding</option>
                  <option value="travel">Travel</option>
                  <option value="portrait">Portrait</option>
                </select>
                <select className="psp-input" value={lighting} onChange={(e) => setLighting(e.target.value)}>
                  <option value="">Select lighting</option>
                  <option value="daylight">Daylight</option>
                  <option value="studio">Studio</option>
                  <option value="goldenhour">Golden Hour</option>
                  <option value="mixed">Mixed Light</option>
                </select>
                <input type="date" className="psp-input" value={date} onChange={(e) => setDate(e.target.value)} />
                <input type="time" className="psp-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <input type="number" min="1" className="psp-input" value={slots} onChange={(e) => setSlots(e.target.value)} placeholder="Timeline blocks" />
                <input type="number" min="15" className="psp-input" value={blockMinutes} onChange={(e) => setBlockMinutes(e.target.value)} placeholder="Minutes per block" />
                <input type="number" min="1" className="psp-input" value={teamSize} onChange={(e) => setTeamSize(e.target.value)} placeholder="Team size" />
                <input type="number" min="0" className="psp-input" value={setupMinutes} onChange={(e) => setSetupMinutes(e.target.value)} placeholder="Setup time (min)" />
                <input type="number" min="0" max="50" className="psp-input" value={bufferPercent} onChange={(e) => setBufferPercent(e.target.value)} placeholder="Buffer (%)" />
                <select className="psp-input" value={clientPriority} onChange={(e) => setClientPriority(e.target.value)}>
                  <option value="">Select client priority</option>
                  <option value="quality">Client Priority: Quality</option>
                  <option value="speed">Client Priority: Speed</option>
                  <option value="social">Client Priority: Social-first</option>
                </select>
                <input type="number" min="0" className="psp-input" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Budget (INR)" />
                <input className="psp-input" value={mustHave} onChange={(e) => setMustHave(e.target.value)} placeholder="Must-have outputs (comma separated)" />
              </div>
              <div className="psp-actions">
                <button onClick={() => window.print()} className="psp-btn psp-btn-secondary">Print Plan</button>
                <button onClick={resetForm} className="psp-btn psp-btn-secondary">Reset</button>
              </div>
            </div>

            <div className="psp-right-pane">
              <div className="psp-card psp-panel psp-soft-panel">
                <div className="psp-row-head">
                  <h2 className="psp-h2">Shot Timeline</h2>
                  <span className="psp-badge">{completionPct}% Complete</span>
                </div>
                <p className="psp-muted">Progress: {completedCount}/{plan.shotList.length} shots complete</p>
                <div className="psp-shot-list">
                  {plan.shotList.map((item, idx) => (
                    <div key={item.block} className="psp-shot-item">
                      <div>
                        <div className="psp-shot-time">Block {item.block} | {item.time}</div>
                        <div className="psp-muted">{item.shot}</div>
                      </div>
                      <div className="psp-shot-meta">
                        <span>{item.owner} | {item.priority}</span>
                        <label className="psp-check">
                          <input type="checkbox" checked={completedShots.includes(idx)} onChange={() => toggleShotComplete(idx)} />
                          <span>Done</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="psp-card psp-panel psp-soft-panel">
                <h3 className="psp-h3">Pro Metrics</h3>
                <div className="psp-metric-grid">
                  <div className="psp-metric-item"><span>Total Runtime</span><strong>{plan.metrics.totalMinutes} min</strong></div>
                  <div className="psp-metric-item"><span>Budget per Hour</span><strong>INR {plan.metrics.budgetPerHour}</strong></div>
                  <div className="psp-metric-item"><span>Risk Score</span><strong>{plan.metrics.riskScore}/100</strong></div>
                  <div className="psp-metric-item"><span>Priority</span><strong>{plan.metrics.clientPriority || "Not set"}</strong></div>
                </div>
              </div>

              <div className="psp-card psp-panel psp-soft-panel">
                <h3 className="psp-h3">Shoot Planner Calendar</h3>
                <div className="psp-table-wrap">
                  <table className="psp-table">
                    <thead>
                      <tr>
                        <th>Window</th>
                        <th>Shot</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineRows.map((row) => (
                        <tr key={`${row.block}-${row.start}`}>
                          <td>{row.block}</td>
                          <td>{row.shot}</td>
                          <td>{row.start}</td>
                          <td>{row.end}</td>
                          <td>{row.priority}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="psp-grid">
                <div className="psp-card psp-panel psp-soft-panel">
                  <h3 className="psp-h3">Lighting Direction</h3>
                  <p className="psp-muted">{plan.lightingNote}</p>
                </div>
                <div className="psp-card psp-panel psp-soft-panel">
                  <h3 className="psp-h3">Must-Have Outputs</h3>
                  <ul className="psp-list">
                    {plan.mustHave.map((item, i) => <li key={`${item}-${i}`}>{item}</li>)}
                  </ul>
                </div>
              </div>

              <div className="psp-card psp-panel psp-soft-panel">
                <h3 className="psp-h3">Pre-Shoot Checklist</h3>
                <ul className="psp-list">
                  {plan.checklist.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <section className="psp-section">
          <div className="psp-card psp-info-card">
            <h2 className="psp-section-title">How It Works</h2>
            <p className="psp-section-subtitle">Use this workflow to run a smooth and professional shoot day.</p>
            <div className="psp-info-grid">
              {[
                "Add project brief, location, time blocks, and team setup.",
                "Set pro constraints like buffer, setup time, and client priority.",
                "Review generated timeline, priorities, and lighting plan.",
                "Export JSON or print and share as your on-set call sheet.",
              ].map((step, i) => (
                <div key={step} className="psp-info-item">
                  <p className="psp-step-title">Step {i + 1}</p>
                  <p className="psp-muted">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="psp-section">
          <div className="psp-card psp-info-card">
            <h2 className="psp-section-title">Features</h2>
            <p className="psp-section-subtitle">Pro-level planning utilities for creators and production teams.</p>
            <div className="psp-feature-grid">
              {[
                "Auto shot-list generation by shoot type",
                "Block-based timeline with owner assignment",
                "Buffer, setup-time, and risk scoring",
                "Budget-per-hour production insight",
                "Must-have deliverables and pre-shoot checklist",
                "Printable plan and JSON export for team sync",
              ].map((feature) => (
                <div key={feature} className="psp-feature-item">
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
