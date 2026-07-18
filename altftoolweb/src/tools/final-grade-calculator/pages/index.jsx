"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  CircleX,
  Copy,
  GraduationCap,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const tabs = [
  { id: "required", label: "Required final score" },
  { id: "reverse", label: "I scored X on the final" },
  { id: "weighted", label: "Weighted average" },
];

const gradeTargets = [
  { label: "A+", value: 90 },
  { label: "A", value: 80 },
  { label: "B", value: 70 },
  { label: "C", value: 60 },
  { label: "Pass", value: 40 },
];

const presets = [
  { label: "Aim for an A (80%)", current: "72", weight: "30", desired: "80" },
  { label: "Heavy final, 50% weight", current: "65", weight: "50", desired: "70" },
  { label: "Just need a pass (40%)", current: "45", weight: "40", desired: "40" },
];

const defaultComponents = [
  { id: 1, name: "Midterm", score: "74", weight: "30" },
  { id: 2, name: "Assignments", score: "86", weight: "20" },
  { id: 3, name: "Quizzes", score: "78", weight: "10" },
];

const toneColors = {
  success: "var(--anslation-ds-success)",
  warning: "var(--anslation-ds-warning)",
  danger: "var(--anslation-ds-danger)",
};

const toneChip = (tone) => ({
  background: `var(--anslation-ds-${tone}-soft)`,
  color: `var(--anslation-ds-${tone})`,
});

const fmt = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
    Number.isFinite(value) ? value : 0
  );

const parseNum = (value) => (String(value).trim() === "" ? NaN : Number(value));

function NumberField({ label, value, onChange, min, max }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step="any"
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
      />
    </label>
  );
}

function ErrorPanel({ message }) {
  return (
    <div
      className="mt-4 flex items-start gap-3 rounded-md p-4 text-sm font-semibold"
      style={toneChip("danger")}
      role="alert"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export default function ToolHome() {
  const [tab, setTab] = useState("required");
  const [current, setCurrent] = useState("72");
  const [weight, setWeight] = useState("30");
  const [desired, setDesired] = useState("80");
  const [finalScore, setFinalScore] = useState("85");
  const [components, setComponents] = useState(defaultComponents);
  const [copied, setCopied] = useState(false);

  const required = useMemo(() => {
    const cur = parseNum(current);
    const wPct = parseNum(weight);
    const target = parseNum(desired);
    if (![cur, wPct, target].every(Number.isFinite)) {
      return { error: "Fill in all three fields to see the required final score." };
    }
    if (wPct <= 0 || wPct > 100) {
      return { error: "Final exam weight must be between 1 and 100." };
    }
    const w = wPct / 100;
    const secured = cur * (1 - w);
    const need = (target - secured) / w;
    const best = secured + 100 * w;
    let tone = "success";
    let title = "Comfortable";
    let message = `You need ${fmt(need)}% on the final — steady prep should get you there.`;
    if (need <= 0) {
      title = "Already secured";
      message = `Even 0% on the final leaves you at ${fmt(secured)}% overall — you've already secured your ${fmt(target)}% target.`;
    } else if (need > 100) {
      tone = "danger";
      title = "Not mathematically possible";
      message = `Not mathematically possible — even a perfect 100% on the final only reaches ${fmt(best)}% overall. Best achievable is ${fmt(best)}%.`;
    } else if (need > 90) {
      tone = "danger";
      title = "Very hard";
      message = `You need a near-perfect ${fmt(need)}% on the final. Possible, but leave nothing to chance.`;
    } else if (need > 70) {
      tone = "warning";
      title = "Tough but doable";
      message = `${fmt(need)}% on the final is a demanding score — plan serious revision time.`;
    }
    return {
      need,
      display: Math.max(need, 0),
      secured,
      best,
      w,
      wPct,
      cur,
      target,
      tone,
      title,
      message,
    };
  }, [current, weight, desired]);

  const targetRows = useMemo(() => {
    if (required.error) return [];
    return gradeTargets.map((item) => {
      const need = (item.value - required.secured) / required.w;
      return { ...item, need, achievable: need <= 100 };
    });
  }, [required]);

  const reverse = useMemo(() => {
    const cur = parseNum(current);
    const wPct = parseNum(weight);
    const score = parseNum(finalScore);
    if (![cur, wPct, score].every(Number.isFinite)) {
      return { error: "Fill in all three fields to see your overall grade." };
    }
    if (wPct <= 0 || wPct > 100) {
      return { error: "Final exam weight must be between 1 and 100." };
    }
    const w = wPct / 100;
    const courseworkPart = cur * (1 - w);
    const finalPart = score * w;
    const overall = courseworkPart + finalPart;
    const band =
      gradeTargets.find((item) => overall >= item.value)?.label || "Below pass";
    return { overall, courseworkPart, finalPart, w, wPct, cur, score, band };
  }, [current, weight, finalScore]);

  const weighted = useMemo(() => {
    let totalWeight = 0;
    let earned = 0;
    components.forEach((row) => {
      const score = parseNum(row.score);
      const wt = parseNum(row.weight);
      if (Number.isFinite(score) && Number.isFinite(wt) && wt > 0) {
        totalWeight += wt;
        earned += score * wt;
      }
    });
    return {
      totalWeight,
      average: totalWeight > 0 ? earned / totalWeight : 0,
      points: earned / 100,
      remaining: 100 - totalWeight,
      over: totalWeight > 100,
    };
  }, [components]);

  const report = useMemo(() => {
    if (tab === "required") {
      if (required.error) return required.error;
      return [
        "Final Grade Calculator",
        `Current grade: ${fmt(required.cur)}%`,
        `Final exam weight: ${fmt(required.wPct)}%`,
        `Target overall grade: ${fmt(required.target)}%`,
        `Required final score: ${fmt(required.display)}% (${required.title})`,
        `Best achievable overall: ${fmt(required.best)}%`,
      ].join("\n");
    }
    if (tab === "reverse") {
      if (reverse.error) return reverse.error;
      return [
        "Final Grade Calculator — Reverse",
        `Current grade: ${fmt(reverse.cur)}%`,
        `Final exam weight: ${fmt(reverse.wPct)}%`,
        `Final exam score: ${fmt(reverse.score)}%`,
        `Overall grade: ${fmt(reverse.overall)}%`,
      ].join("\n");
    }
    return [
      "Final Grade Calculator — Weighted average",
      ...components.map(
        (row) =>
          `${row.name || "Component"}: ${row.score || 0}% at weight ${row.weight || 0}%`
      ),
      `Weighted average: ${fmt(weighted.average)}%`,
      `Weight used: ${fmt(weighted.totalWeight)}% (remaining ${fmt(weighted.remaining)}%)`,
    ].join("\n");
  }, [tab, required, reverse, weighted, components]);

  const copyReport = async () => {
    const success = await safeCopyText(report);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const applyPreset = (preset) => {
    setTab("required");
    setCurrent(preset.current);
    setWeight(preset.weight);
    setDesired(preset.desired);
  };

  const updateComponent = (id, patch) =>
    setComponents((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addComponent = () =>
    setComponents((rows) => [
      ...rows,
      {
        id: rows.length ? Math.max(...rows.map((row) => row.id)) + 1 : 1,
        name: "",
        score: "",
        weight: "",
      },
    ]);

  const removeComponent = (id) =>
    setComponents((rows) => (rows.length > 1 ? rows.filter((row) => row.id !== id) : rows));

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <GraduationCap className="h-4 w-4" />
            Grade planner
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Final Grade Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Find out exactly what you need to score on the final exam to hit your target grade,
            work backwards from the score you got, or build a full weighted average.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[390px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="grid gap-2">
              {tabs.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                    tab === item.id
                      ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab !== "weighted" ? (
              <div className="mt-5 grid gap-4">
                <NumberField label="Current grade (%)" value={current} onChange={setCurrent} min={0} />
                <NumberField
                  label="Final exam weight (%)"
                  value={weight}
                  onChange={setWeight}
                  min={1}
                  max={100}
                />
                {tab === "required" ? (
                  <NumberField
                    label="Desired overall grade (%)"
                    value={desired}
                    onChange={setDesired}
                    min={0}
                  />
                ) : (
                  <NumberField
                    label="Score on the final (%)"
                    value={finalScore}
                    onChange={setFinalScore}
                    min={0}
                  />
                )}
              </div>
            ) : (
              <div className="mt-5 grid gap-3">
                {components.map((row, index) => (
                  <div key={row.id} className="grid grid-cols-[1fr_72px_72px_36px] items-end gap-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                        Component {index + 1}
                      </span>
                      <input
                        type="text"
                        value={row.name}
                        placeholder="Name"
                        onChange={(event) => updateComponent(row.id, { name: event.target.value })}
                        className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Score %</span>
                      <input
                        type="number"
                        value={row.score}
                        min={0}
                        step="any"
                        onChange={(event) => updateComponent(row.id, { score: event.target.value })}
                        className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-[var(--muted-foreground)]">Weight %</span>
                      <input
                        type="number"
                        value={row.weight}
                        min={0}
                        max={100}
                        step="any"
                        onChange={(event) => updateComponent(row.id, { weight: event.target.value })}
                        className="mt-1 h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => removeComponent(row.id)}
                      aria-label={`Remove ${row.name || `component ${index + 1}`}`}
                      className="flex h-10 w-9 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addComponent} className="btn-secondary min-h-10 px-3 py-2 text-sm">
                  <Plus className="h-4 w-4" />
                  Add component
                </button>
              </div>
            )}

            {tab === "required" && (
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold">Quick presets</span>
                  <button
                    type="button"
                    onClick={() => applyPreset(presets[0])}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 2xl:grid-cols-1">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                {tab === "required"
                  ? "Required score on the final"
                  : tab === "reverse"
                    ? "Your overall grade"
                    : "Weighted average so far"}
              </p>
              <button type="button" onClick={copyReport} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy result"}
              </button>
            </div>

            {tab === "required" &&
              (required.error ? (
                <ErrorPanel message={required.error} />
              ) : (
                <div aria-live="polite">
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-[var(--muted)] p-5">
                      <p className="text-4xl font-semibold" style={{ color: toneColors[required.tone] }}>
                        {fmt(required.display)}%
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
                      style={toneChip(required.tone)}
                    >
                      {required.tone === "success" ? (
                        <CircleCheck className="h-4 w-4" />
                      ) : (
                        <CircleAlert className="h-4 w-4" />
                      )}
                      {required.title}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">{required.message}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Formula: required final = (target − current × (1 − weight)) ÷ weight = (
                    {fmt(required.target)} − {fmt(required.cur)} × {fmt(1 - required.w)}) ÷ {fmt(required.w)}
                  </p>

                  <div className="tool-compact-grid mt-6">
                    {[
                      ["Locked in from coursework", `${fmt(required.secured)}%`],
                      ["Best achievable overall", `${fmt(required.best)}%`],
                      ["Final exam weight", `${fmt(required.wPct)}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <p className="text-sm font-semibold">Required final score for common targets</p>
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full min-w-[420px] text-left text-sm">
                        <thead>
                          <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                            <th className="py-2 pr-3 font-semibold">Target</th>
                            <th className="py-2 pr-3 font-semibold">Overall needed</th>
                            <th className="py-2 pr-3 font-semibold">Final score needed</th>
                            <th className="py-2 font-semibold">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {targetRows.map((row) => (
                            <tr key={row.label} className="border-b border-[var(--border)] last:border-0">
                              <td className="py-2.5 pr-3 font-semibold">{row.label}</td>
                              <td className="py-2.5 pr-3">{row.value}%</td>
                              <td className="py-2.5 pr-3">{fmt(Math.max(row.need, 0))}%</td>
                              <td className="py-2.5">
                                <span
                                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                                  style={toneChip(row.achievable ? "success" : "danger")}
                                >
                                  {row.achievable ? (
                                    <CircleCheck className="h-3.5 w-3.5" />
                                  ) : (
                                    <CircleX className="h-3.5 w-3.5" />
                                  )}
                                  {row.achievable ? "Achievable" : "Not achievable"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}

            {tab === "reverse" &&
              (reverse.error ? (
                <ErrorPanel message={reverse.error} />
              ) : (
                <div aria-live="polite">
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <div className="rounded-lg bg-[var(--muted)] p-5">
                      <p className="text-4xl font-semibold text-[var(--primary)]">{fmt(reverse.overall)}%</p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold"
                      style={toneChip(reverse.band === "Below pass" ? "danger" : "success")}
                    >
                      {reverse.band === "Below pass" ? (
                        <CircleX className="h-4 w-4" />
                      ) : (
                        <CircleCheck className="h-4 w-4" />
                      )}
                      Grade band: {reverse.band}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                    Coursework contributes {fmt(reverse.courseworkPart)} points and the final adds{" "}
                    {fmt(reverse.finalPart)} points, giving {fmt(reverse.overall)}% overall.
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
                    Formula: overall = current × (1 − weight) + final score × weight = {fmt(reverse.cur)} ×{" "}
                    {fmt(1 - reverse.w)} + {fmt(reverse.score)} × {fmt(reverse.w)}
                  </p>
                  <div className="tool-compact-grid mt-6">
                    {[
                      ["From coursework", `${fmt(reverse.courseworkPart)} pts`],
                      ["From the final", `${fmt(reverse.finalPart)} pts`],
                      ["Overall grade", `${fmt(reverse.overall)}%`],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                        <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
                        <p className="mt-1 font-semibold">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

            {tab === "weighted" && (
              <div aria-live="polite">
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="rounded-lg bg-[var(--muted)] p-5">
                    <p className="text-4xl font-semibold text-[var(--primary)]">{fmt(weighted.average)}%</p>
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    <p className="font-semibold text-[var(--foreground)]">
                      {fmt(weighted.points)} points locked in
                    </p>
                    <p>across {fmt(weighted.totalWeight)}% of the total weight</p>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--muted-foreground)]">
                    <span>Weight used: {fmt(weighted.totalWeight)}%</span>
                    <span>
                      {weighted.over
                        ? `${fmt(weighted.totalWeight - 100)}% over the limit`
                        : `Remaining: ${fmt(weighted.remaining)}%`}
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--muted)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(weighted.totalWeight, 100)}%`,
                        background: weighted.over
                          ? "var(--anslation-ds-danger)"
                          : "var(--primary)",
                      }}
                    />
                  </div>
                  {weighted.over && (
                    <p className="mt-2 text-sm font-semibold" style={{ color: "var(--anslation-ds-danger)" }}>
                      Your weights add up to {fmt(weighted.totalWeight)}% — trim{" "}
                      {fmt(weighted.totalWeight - 100)}% so the total stays at 100%.
                    </p>
                  )}
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                  Formula: weighted average = Σ(score × weight) ÷ Σ weight. Points locked in = Σ(score ×
                  weight ÷ 100).
                </p>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[420px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted-foreground)]">
                        <th className="py-2 pr-3 font-semibold">Component</th>
                        <th className="py-2 pr-3 font-semibold">Score</th>
                        <th className="py-2 pr-3 font-semibold">Weight</th>
                        <th className="py-2 font-semibold">Contribution</th>
                      </tr>
                    </thead>
                    <tbody>
                      {components.map((row, index) => {
                        const score = parseNum(row.score);
                        const wt = parseNum(row.weight);
                        const valid = Number.isFinite(score) && Number.isFinite(wt) && wt > 0;
                        return (
                          <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                            <td className="py-2.5 pr-3 font-semibold">
                              {row.name || `Component ${index + 1}`}
                            </td>
                            <td className="py-2.5 pr-3">{valid ? `${fmt(score)}%` : "—"}</td>
                            <td className="py-2.5 pr-3">{valid ? `${fmt(wt)}%` : "—"}</td>
                            <td className="py-2.5">{valid ? `${fmt((score * wt) / 100)} pts` : "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
