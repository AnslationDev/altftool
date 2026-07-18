"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChartPie,
  Copy,
  Info,
  Plus,
  RotateCcw,
  Scale,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STORAGE_KEY = "altf:portfolio-rebalancer:state";
const BAND = 5;

const palette = [
  "var(--primary)",
  "var(--anslation-ds-secondary)",
  "var(--anslation-ds-warning)",
  "var(--anslation-ds-success)",
  "var(--anslation-ds-danger)",
  "var(--anslation-ds-primary-active)",
];

const assetKinds = [
  { id: "equity", label: "Equity" },
  { id: "debt", label: "Debt" },
  { id: "gold", label: "Gold" },
  { id: "other", label: "Other" },
];

const taxNotes = {
  equity:
    "Equity held over 12 months: LTCG at 12.5% on gains above ₹1.25 lakh a year. Sold inside 12 months: STCG at 20%. Only the gain is taxed, not the amount you sell.",
  debt:
    "Debt funds bought on or after 1 April 2023 are taxed at your slab rate however long you hold them — there is no LTCG benefit left to wait for.",
  gold:
    "Gold funds and ETFs: LTCG at 12.5% after 24 months, slab rate before that. Sovereign Gold Bonds held to maturity are exempt.",
  other:
    "Check the holding period and tax treatment for this asset before you sell. The rate often turns on a 12- or 24-month line.",
};

const presets = [
  {
    id: "classic",
    label: "Classic 60/40",
    blurb: "The default balanced portfolio",
    assets: [
      { name: "Equity index funds", value: 720000, target: 60, kind: "equity" },
      { name: "Short-duration debt", value: 280000, target: 40, kind: "debt" },
    ],
  },
  {
    id: "aggressive",
    label: "Aggressive 75/20/5",
    blurb: "Long horizon, high tolerance",
    assets: [
      { name: "Equity index funds", value: 900000, target: 75, kind: "equity" },
      { name: "Short-duration debt", value: 180000, target: 20, kind: "debt" },
      { name: "Gold ETF", value: 60000, target: 5, kind: "gold" },
    ],
  },
  {
    id: "golden",
    label: "Golden 40/40/20",
    blurb: "Gold as a real third leg",
    assets: [
      { name: "Equity index funds", value: 480000, target: 40, kind: "equity" },
      { name: "Debt funds", value: 400000, target: 40, kind: "debt" },
      { name: "Gold ETF", value: 220000, target: 20, kind: "gold" },
    ],
  },
];

const defaultAssets = presets[0].assets.map((asset, index) => ({ ...asset, id: `asset-${index}` }));

const inrFull = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatINR = (value) => inrFull.format(Number.isFinite(value) ? value : 0);

function formatCompactINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return formatINR(0);
  const abs = Math.abs(amount);
  if (abs >= 1e7) return `${amount < 0 ? "-" : ""}₹${Math.abs(amount / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${amount < 0 ? "-" : ""}₹${Math.abs(amount / 1e5).toFixed(2)} L`;
  return formatINR(amount);
}

function readStore(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function allocateFreshMoney(entries, newMoney) {
  const alloc = entries.map(() => 0);
  if (!(newMoney > 0)) return alloc;

  let active = entries.map((_, index) => index);

  for (let pass = 0; pass <= entries.length; pass += 1) {
    const weightSum = active.reduce((sum, index) => sum + entries[index].weight, 0);
    if (weightSum <= 0) return alloc;

    const pool = active.reduce((sum, index) => sum + entries[index].value, 0) + newMoney;
    const level = pool / weightSum;
    const overweight = active.filter((index) => entries[index].weight * level < entries[index].value);

    if (overweight.length === 0) {
      active.forEach((index) => {
        alloc[index] = entries[index].weight * level - entries[index].value;
      });
      return alloc;
    }

    active = active.filter((index) => !overweight.includes(index));
    if (active.length === 0) return alloc;
  }

  return alloc;
}

function driftTone(drift) {
  const magnitude = Math.abs(drift);
  if (magnitude > BAND) return "var(--anslation-ds-danger)";
  if (magnitude > BAND / 2) return "var(--anslation-ds-warning)";
  return "var(--anslation-ds-success)";
}

function StatTile({ label, value, hint }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
      <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--muted-foreground)]">{hint}</p> : null}
    </div>
  );
}

function SegmentBar({ rows, total, label }) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
      <div className="flex h-6 w-full overflow-hidden rounded-md border border-[var(--border)]">
        {rows.map((row, index) => {
          const width = total > 0 ? (row.value / total) * 100 : 0;
          if (width <= 0) return null;
          return (
            <div
              key={row.id}
              title={`${row.name}: ${width.toFixed(1)}%`}
              className="h-full"
              style={{ width: `${width}%`, background: palette[index % palette.length] }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [assets, setAssets] = useState(defaultAssets);
  const [newMoney, setNewMoney] = useState(100000);
  const [mode, setMode] = useState("full");
  const [hydrated, setHydrated] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const raw = readStore(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.assets) && parsed.assets.length > 0) setAssets(parsed.assets);
        if (Number.isFinite(parsed.newMoney)) setNewMoney(parsed.newMoney);
        if (parsed.mode === "fresh" || parsed.mode === "full") setMode(parsed.mode);
      } catch {
        setAssets(defaultAssets);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeStore(STORAGE_KEY, JSON.stringify({ assets, newMoney, mode }));
  }, [assets, hydrated, mode, newMoney]);

  const targetSum = useMemo(
    () => assets.reduce((sum, asset) => sum + (Number(asset.target) || 0), 0),
    [assets]
  );

  const model = useMemo(() => {
    const total = assets.reduce((sum, asset) => sum + Math.max(0, Number(asset.value) || 0), 0);
    const weightTotal = assets.reduce((sum, asset) => sum + Math.max(0, Number(asset.target) || 0), 0);

    const entries = assets.map((asset) => ({
      ...asset,
      value: Math.max(0, Number(asset.value) || 0),
      target: Math.max(0, Number(asset.target) || 0),
      weight: weightTotal > 0 ? Math.max(0, Number(asset.target) || 0) / weightTotal : 0,
    }));

    const money = Math.max(0, Number(newMoney) || 0);
    const fresh = allocateFreshMoney(entries, money);
    const freshTotal = total + money;

    const rows = entries.map((entry, index) => {
      const currentPct = total > 0 ? (entry.value / total) * 100 : 0;
      const targetPct = entry.weight * 100;
      const drift = currentPct - targetPct;
      const fullTargetValue = total * entry.weight;
      const fullAction = fullTargetValue - entry.value;
      const freshAdd = fresh[index];
      const freshAfter = entry.value + freshAdd;
      const freshAfterPct = freshTotal > 0 ? (freshAfter / freshTotal) * 100 : 0;

      return {
        ...entry,
        currentPct,
        targetPct,
        drift,
        fullTargetValue,
        fullAction,
        freshAdd,
        freshAfter,
        freshAfterPct,
        freshDrift: freshAfterPct - targetPct,
      };
    });

    const worstDrift = rows.reduce((max, row) => Math.max(max, Math.abs(row.drift)), 0);
    const turnover = rows.reduce((sum, row) => sum + Math.max(0, -row.fullAction), 0);
    const freshFullyFixes = rows.every((row) => Math.abs(row.freshDrift) < 0.01);
    const moneyToFullyFix = (() => {
      if (weightTotal <= 0 || total <= 0) return 0;
      const needed = Math.max(
        ...entries.map((entry) => (entry.weight > 0 ? entry.value / entry.weight : 0))
      );
      return Math.max(0, needed - total);
    })();

    return { total, rows, worstDrift, turnover, money, freshTotal, freshFullyFixes, moneyToFullyFix };
  }, [assets, newMoney]);

  const updateAsset = (id, field, value) => {
    setAssets((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const addAsset = () => {
    setAssets((rows) => [
      ...rows,
      { id: `asset-${Date.now()}`, name: "New asset", value: 0, target: 0, kind: "other" },
    ]);
  };

  const removeAsset = (id) => {
    setAssets((rows) => (rows.length <= 1 ? rows : rows.filter((row) => row.id !== id)));
  };

  const applyPreset = (preset) => {
    setAssets(preset.assets.map((asset, index) => ({ ...asset, id: `${preset.id}-${index}` })));
  };

  const normaliseTargets = () => {
    if (targetSum <= 0) return;
    setAssets((rows) =>
      rows.map((row) => ({
        ...row,
        target: Math.round(((Number(row.target) || 0) / targetSum) * 1000) / 10,
      }))
    );
  };

  const reset = () => {
    setAssets(defaultAssets);
    setNewMoney(100000);
    setMode("full");
  };

  const plan = useMemo(() => {
    const lines = [
      "Portfolio rebalancing plan",
      "",
      `Portfolio value: ${formatINR(model.total)}`,
      `Largest drift: ${model.worstDrift.toFixed(1)} percentage points (band: ±${BAND})`,
      "",
    ];

    if (mode === "full") {
      lines.push("Method: full rebalance — sell overweight, buy underweight");
      lines.push("");
      model.rows.forEach((row) => {
        const action = row.fullAction;
        const verb = action > 0 ? "BUY " : action < 0 ? "SELL" : "HOLD";
        lines.push(
          `${verb} ${row.name}: ${action === 0 ? "no action" : formatINR(Math.abs(action))} — ${row.currentPct.toFixed(1)}% now to ${row.targetPct.toFixed(1)}% target`
        );
      });
      lines.push("");
      lines.push(`Total to sell: ${formatINR(model.turnover)} — this is the part that can trigger tax.`);
    } else {
      lines.push(`Method: fresh money only — ${formatINR(model.money)} added, nothing sold`);
      lines.push("");
      model.rows.forEach((row) => {
        lines.push(
          `${row.freshAdd > 0 ? "BUY " : "HOLD"} ${row.name}: ${row.freshAdd > 0 ? formatINR(row.freshAdd) : "no new money"} — ${row.currentPct.toFixed(1)}% to ${row.freshAfterPct.toFixed(1)}% (target ${row.targetPct.toFixed(1)}%)`
        );
      });
      lines.push("");
      lines.push(
        model.freshFullyFixes
          ? "This fully restores your targets without selling anything."
          : `Fresh money gets you closer but not all the way. ${formatINR(model.moneyToFullyFix)} would fully restore targets with no selling.`
      );
    }

    lines.push("");
    lines.push("Generated by the ALTFTool portfolio rebalancing calculator.");
    return lines.join("\n");
  }, [mode, model]);

  const copyPlan = async () => {
    const success = await safeCopyText(plan);
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const targetValid = Math.abs(targetSum - 100) < 0.05;
  const needsRebalance = model.worstDrift > BAND;
  const afterRows =
    mode === "full"
      ? model.rows.map((row) => ({ ...row, value: row.fullTargetValue }))
      : model.rows.map((row) => ({ ...row, value: row.freshAfter }));
  const afterTotal = mode === "full" ? model.total : model.freshTotal;

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ChartPie className="h-4 w-4" />
            Portfolio maintenance
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Portfolio Rebalancing Calculator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            A good year in equity quietly turns a 60/40 portfolio into a 72/28 one — you took on more risk
            without ever deciding to. See exactly how far you have drifted, and fix it with the smallest,
            cheapest set of trades.
          </p>
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-[1fr_420px]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-semibold">Your holdings</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={addAsset} className="btn-secondary min-h-8 px-2 py-1 text-xs">
                  <Plus className="h-3.5 w-3.5" />
                  Add asset
                </button>
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 px-2 text-xs font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  title={preset.blurb}
                  className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[620px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                    <th className="py-2 pr-3 font-semibold">Asset</th>
                    <th className="py-2 pr-3 font-semibold">Class</th>
                    <th className="py-2 pr-3 font-semibold">Current value</th>
                    <th className="py-2 pr-3 font-semibold">Target %</th>
                    <th className="py-2 pr-3 font-semibold">Now</th>
                    <th className="py-2 pr-3 font-semibold">Drift</th>
                    <th className="py-2 font-semibold">
                      <span className="sr-only">Remove</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {model.rows.map((row, index) => (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-sm"
                            style={{ background: palette[index % palette.length] }}
                          />
                          <label className="sr-only" htmlFor={`name-${row.id}`}>
                            Asset name
                          </label>
                          <input
                            id={`name-${row.id}`}
                            type="text"
                            value={row.name}
                            onChange={(event) => updateAsset(row.id, "name", event.target.value)}
                            className="h-9 w-40 min-w-0 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                          />
                        </div>
                      </td>
                      <td className="py-2 pr-3">
                        <label className="sr-only" htmlFor={`kind-${row.id}`}>
                          {row.name} asset class
                        </label>
                        <select
                          id={`kind-${row.id}`}
                          value={row.kind}
                          onChange={(event) => updateAsset(row.id, "kind", event.target.value)}
                          className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        >
                          {assetKinds.map((kind) => (
                            <option key={kind.id} value={kind.id}>
                              {kind.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2 pr-3">
                        <label className="sr-only" htmlFor={`value-${row.id}`}>
                          {row.name} current value
                        </label>
                        <input
                          id={`value-${row.id}`}
                          type="number"
                          min={0}
                          step={1000}
                          value={row.value}
                          onChange={(event) => updateAsset(row.id, "value", Number(event.target.value))}
                          className="h-9 w-32 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </td>
                      <td className="py-2 pr-3">
                        <label className="sr-only" htmlFor={`target-${row.id}`}>
                          {row.name} target percentage
                        </label>
                        <input
                          id={`target-${row.id}`}
                          type="number"
                          min={0}
                          max={100}
                          step={1}
                          value={row.target}
                          onChange={(event) => updateAsset(row.id, "target", Number(event.target.value))}
                          className="h-9 w-20 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                        />
                      </td>
                      <td className="py-2 pr-3 font-semibold">{row.currentPct.toFixed(1)}%</td>
                      <td className="py-2 pr-3">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                          style={{ background: "var(--muted)", color: driftTone(row.drift) }}
                        >
                          {row.drift > 0 ? <ArrowUp className="h-3 w-3" /> : null}
                          {row.drift < 0 ? <ArrowDown className="h-3 w-3" /> : null}
                          {row.drift > 0 ? "+" : ""}
                          {row.drift.toFixed(1)} pp
                        </span>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeAsset(row.id)}
                          aria-label={`Remove ${row.name}`}
                          disabled={model.rows.length <= 1}
                          className="rounded-md border border-[var(--border)] p-2 text-[var(--muted-foreground)] transition hover:border-[var(--anslation-ds-danger)] hover:text-[var(--anslation-ds-danger)] disabled:opacity-40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 rounded-md bg-[var(--muted)] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Targets must add to 100%
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold" style={{ color: targetValid ? "var(--anslation-ds-success)" : "var(--anslation-ds-warning)" }}>
                    {targetSum.toFixed(1)}%
                  </span>
                  {targetValid ? null : (
                    <button type="button" onClick={normaliseTargets} className="btn-secondary min-h-8 px-2 py-1 text-xs">
                      Scale to 100
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--background)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, targetSum)}%`,
                    background: targetValid ? "var(--anslation-ds-success)" : "var(--anslation-ds-warning)",
                  }}
                />
              </div>
              {targetValid ? null : (
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  Your targets add to {targetSum.toFixed(1)}%, not 100%. The maths below scales them
                  proportionally so the answers stay valid, but fix the numbers so they mean what you think they
                  mean.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">Portfolio value</p>
              <p className="mt-2 text-4xl font-semibold text-[var(--primary)]">{formatCompactINR(model.total)}</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{formatINR(model.total)}</p>

              <div className="tool-compact-grid mt-5">
                <StatTile
                  label="Largest drift"
                  value={`${model.worstDrift.toFixed(1)} pp`}
                  hint={`Band is ±${BAND} pp`}
                />
                <StatTile label="Assets" value={model.rows.length} />
              </div>

              <div
                className="mt-4 flex gap-2 rounded-md border p-3 text-sm leading-6"
                style={{
                  borderColor: needsRebalance ? "var(--anslation-ds-warning)" : "var(--anslation-ds-success)",
                  background: needsRebalance
                    ? "var(--anslation-ds-warning-soft)"
                    : "var(--anslation-ds-success-soft)",
                }}
              >
                {needsRebalance ? <TriangleAlert className="mt-1 h-4 w-4 shrink-0" /> : null}
                <span>
                  {needsRebalance ? (
                    <>
                      <span className="font-semibold">Time to rebalance.</span> Something has drifted{" "}
                      {model.worstDrift.toFixed(1)} points from target — past the ±{BAND} point band most
                      investors use as a trigger.
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">Nothing to do.</span> Everything sits inside the ±{BAND}{" "}
                      point band. Leave it alone — trading costs money and tax, and drift this small is noise.
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <p className="text-sm font-semibold">Allocation</p>
              <div className="mt-4 grid gap-4">
                <SegmentBar rows={model.rows} total={model.total} label="Before" />
                <SegmentBar rows={afterRows} total={afterTotal} label="After" />
              </div>
              <div className="mt-4 grid gap-2">
                {model.rows.map((row, index) => (
                  <div key={row.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="flex min-w-0 items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ background: palette[index % palette.length] }}
                      />
                      <span className="truncate">{row.name}</span>
                    </span>
                    <span className="shrink-0 font-semibold text-[var(--muted-foreground)]">
                      {row.currentPct.toFixed(1)}% →{" "}
                      {(mode === "full" ? row.targetPct : row.freshAfterPct).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-[var(--primary)]" />
              <p className="text-sm font-semibold">Your action plan</p>
            </div>
            <button type="button" onClick={copyPlan} className="btn-secondary min-h-9 px-3 py-1.5 text-sm">
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy plan"}
            </button>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setMode("full")}
              className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                mode === "full"
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              Sell and buy
              <span className="mt-1 block text-xs font-normal opacity-80">
                Exact targets today. May trigger capital gains tax.
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMode("fresh")}
              className={`rounded-md border px-3 py-3 text-left text-sm font-semibold transition ${
                mode === "fresh"
                  ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
              }`}
            >
              Fresh money only
              <span className="mt-1 block text-xs font-normal opacity-80">
                Nothing sold, nothing taxed. Buys the underweights first.
              </span>
            </button>
          </div>

          {mode === "fresh" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-[240px_1fr] sm:items-end">
              <label className="block">
                <span className="text-sm font-semibold">New money to invest</span>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={newMoney}
                    onChange={(event) => setNewMoney(Number(event.target.value))}
                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 pr-10 outline-none focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted-foreground)]">
                    ₹
                  </span>
                </div>
              </label>
              <div className="flex flex-wrap gap-2">
                {[25000, 50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setNewMoney(amount)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      Number(newMoney) === amount
                        ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]"
                        : "border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:border-[var(--primary)]"
                    }`}
                  >
                    {formatCompactINR(amount)}
                  </button>
                ))}
                {model.moneyToFullyFix > 0 ? (
                  <button
                    type="button"
                    onClick={() => setNewMoney(Math.ceil(model.moneyToFullyFix))}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition hover:border-[var(--primary)]"
                  >
                    Exactly enough: {formatCompactINR(model.moneyToFullyFix)}
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-xs uppercase text-[var(--muted-foreground)]">
                  <th className="py-2 pr-4 font-semibold">Asset</th>
                  <th className="py-2 pr-4 font-semibold">Action</th>
                  <th className="py-2 pr-4 font-semibold">Amount</th>
                  <th className="py-2 pr-4 font-semibold">After</th>
                  <th className="py-2 font-semibold">Target</th>
                </tr>
              </thead>
              <tbody>
                {model.rows.map((row) => {
                  const action = mode === "full" ? row.fullAction : row.freshAdd;
                  const isSell = mode === "full" && action < -0.5;
                  const isBuy = action > 0.5;
                  const afterPct = mode === "full" ? row.targetPct : row.freshAfterPct;
                  return (
                    <tr key={row.id} className="border-b border-[var(--border)] last:border-0 align-top">
                      <td className="py-3 pr-4 font-semibold">{row.name}</td>
                      <td className="py-3 pr-4">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold"
                          style={{
                            background: "var(--muted)",
                            color: isSell
                              ? "var(--anslation-ds-danger)"
                              : isBuy
                                ? "var(--anslation-ds-success)"
                                : "var(--muted-foreground)",
                          }}
                        >
                          {isSell ? "SELL" : isBuy ? "BUY" : "HOLD"}
                        </span>
                        {isSell ? (
                          <span className="mt-2 block max-w-md text-xs leading-5 text-[var(--muted-foreground)]">
                            {taxNotes[row.kind] || taxNotes.other}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 font-semibold">
                        {isSell || isBuy ? formatINR(Math.abs(action)) : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {formatINR(mode === "full" ? row.fullTargetValue : row.freshAfter)}
                        <span className="ml-1 text-xs text-[var(--muted-foreground)]">
                          ({afterPct.toFixed(1)}%)
                        </span>
                      </td>
                      <td className="py-3">{row.targetPct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {mode === "full" ? (
            <div className="mt-4 grid gap-3">
              <div className="rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: target value = portfolio total × target weight. Action = target value − current value.
                The totals net to zero — every rupee sold funds a rupee bought, so the portfolio value does not
                change.
              </div>
              {model.turnover > 0 ? (
                <div
                  className="flex gap-2 rounded-md border p-3 text-sm leading-6"
                  style={{
                    borderColor: "var(--anslation-ds-warning)",
                    background: "var(--anslation-ds-warning-soft)",
                  }}
                >
                  <TriangleAlert className="mt-1 h-4 w-4 shrink-0" />
                  <span>
                    <span className="font-semibold">
                      This plan sells {formatINR(model.turnover)} of assets.
                    </span>{" "}
                    Selling realises capital gains, and the tax is real money leaving your portfolio forever.
                    Before you place these orders, check whether{" "}
                    <button
                      type="button"
                      onClick={() => setMode("fresh")}
                      className="font-semibold underline underline-offset-2"
                    >
                      fresh money
                    </button>{" "}
                    could do the same job. Rebalancing inside an NPS or EPF account, or by redirecting your SIP,
                    costs no tax at all.
                  </span>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              <div className="rounded-md bg-[var(--muted)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
                Formula: fill each asset up to a common level L, where target value = weight × L, but never
                below what it already holds. L is solved so the amounts bought add up to exactly your new money.
                Assets already above the line get nothing; the rest are topped up in proportion to their targets.
                That is the closest you can get to target without selling a thing.
              </div>
              <div
                className="rounded-md border p-3 text-sm leading-6"
                style={{
                  borderColor: model.freshFullyFixes ? "var(--anslation-ds-success)" : "var(--border)",
                  background: model.freshFullyFixes ? "var(--anslation-ds-success-soft)" : "var(--muted)",
                }}
              >
                {model.freshFullyFixes ? (
                  <>
                    <span className="font-semibold">Fully rebalanced, nothing sold, no tax.</span> Your{" "}
                    {formatINR(model.money)} is enough to bring every asset back to target on its own.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">Closer, but not all the way.</span> {formatINR(model.money)}{" "}
                    narrows the largest drift from {model.worstDrift.toFixed(1)} to{" "}
                    {Math.max(...model.rows.map((row) => Math.abs(row.freshDrift))).toFixed(1)} points. It would
                    take {formatINR(model.moneyToFullyFix)} to fully restore targets without selling — or you
                    can simply point your next few SIP instalments at the underweight assets and let the gap
                    close by itself.
                  </>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 2xl:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-[var(--primary)]" />
              <p className="text-sm font-semibold">How often should you rebalance?</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Less often than you think. Rebalancing is risk control, not a return strategy — the research finds
              almost no reward for doing it more than once a year, and every extra trade costs spread and tax.
            </p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-sm font-semibold">Calendar: once a year</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Pick a date and keep it. Many Indian investors use early April so the sale lands at the start
                  of a financial year, giving twelve months to plan around the gain.
                </p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-sm font-semibold">Bands: only when drift exceeds ±{BAND} points</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  Check quarterly, act only if something has moved past the band. Fewer trades, and you act when
                  it matters rather than when the calendar says so.
                </p>
              </div>
              <div className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3">
                <p className="text-sm font-semibold">Best of all: never sell</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                  If you are still adding money every month, point the new money at whatever is underweight.
                  Most drift never gets big enough to need a sale.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold">Before you place the orders</p>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
              <li>
                Exit loads bite. Many equity funds charge 1% if you redeem within a year of each instalment.
              </li>
              <li>
                Every SIP instalment is its own purchase with its own holding period. Redeeming &quot;the fund&quot;
                actually redeems the oldest units first.
              </li>
              <li>
                The ₹1.25 lakh equity LTCG exemption resets each financial year. Splitting a large sale across
                two years can use it twice.
              </li>
              <li>
                Losses can offset gains. If something is under water, selling it in the same year as a gain
                reduces the tax on both.
              </li>
              <li>
                Rebalancing inside EPF, PPF, or NPS triggers no tax event at all. Do as much of the work there
                as you can.
              </li>
            </ul>
            <p className="mt-4 text-xs leading-5 text-[var(--muted-foreground)]">
              Tax rules quoted here reflect the rates commonly applying to Indian residents and change with
              almost every budget. This is a calculator for awareness, not investment or tax advice — confirm
              current rates and your own position with a qualified adviser before you act.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
