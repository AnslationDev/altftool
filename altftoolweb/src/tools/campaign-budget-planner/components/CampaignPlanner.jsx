"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Calendar, ListChecks, ArrowUpRight, BarChart2, Plus,
  Trash2, RefreshCw, CheckCircle2, Info, PieChart
} from "lucide-react";
import { DEFAULT_CHANNELS, PRESETS, DEFAULT_TASKS, fmt } from "../data/data";

const ANIM_STYLES = `
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.15); }
  50% { box-shadow: 0 0 25px 6px rgba(20, 184, 166, 0.25); }
}
@keyframes scale-up {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.primary-glow { animation: pulse-glow 3.5s ease-in-out infinite; }
.scale-enter { animation: scale-up 0.3s ease-out; }
`;

function useCountUp(target) {
  const [val, setVal] = useState(target);
  const ref = useRef(null);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (Math.abs(target - from) < 0.01) {
      setVal(target);
      return;
    }
    const t0 = performance.now();
    const run = (now) => {
      const p = Math.min(1, (now - t0) / 500);
      const e = 1 - Math.pow(1 - p, 3); // Cubic ease-out
      setVal(from + (target - from) * e);
      if (p < 1) ref.current = requestAnimationFrame(run);
    };
    ref.current = requestAnimationFrame(run);
    return () => cancelAnimationFrame(ref.current);
  }, [target]);

  return val;
}

export default function CampaignPlanner() {
  const [channels, setChannels] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [targetCPA, setTargetCPA] = useState(35);
  const [avgLTV, setAvgLTV] = useState(120);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskPhase, setNewTaskPhase] = useState("creative");
  const [currentPhaseFilter, setCurrentPhaseFilter] = useState("all");
  const [activeTimelineDay, setActiveTimelineDay] = useState(12);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedChannels = localStorage.getItem("cb_planner_channels");
      const storedTasks = localStorage.getItem("cb_planner_tasks");
      const storedCpa = localStorage.getItem("cb_planner_target_cpa");
      const storedLtv = localStorage.getItem("cb_planner_avg_ltv");
      const storedDay = localStorage.getItem("cb_planner_active_day");

      setChannels(storedChannels ? JSON.parse(storedChannels) : DEFAULT_CHANNELS);
      setTasks(storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS);
      if (storedCpa) setTargetCPA(storedCpa === "" ? "" : +storedCpa);
      if (storedLtv) setAvgLTV(storedLtv === "" ? "" : +storedLtv);
      if (storedDay) setActiveTimelineDay(storedDay === "" ? "" : +storedDay);
    } catch (e) {
      console.error("Could not restore layout", e);
      setChannels(DEFAULT_CHANNELS);
      setTasks(DEFAULT_TASKS);
    }
  }, []);

  // Save changes automatically
  const saveState = (updatedChannels, updatedTasks) => {
    try {
      localStorage.setItem("cb_planner_channels", JSON.stringify(updatedChannels));
      localStorage.setItem("cb_planner_tasks", JSON.stringify(updatedTasks));
    } catch (e) {}
  };

  // Calculations
  const stats = useMemo(() => {
    if (channels.length === 0) return { totalBudget: 0, clicks: 0, convs: 0, cpa: 0, roas: 0 };

    let totalBudget = 0;
    let totalClicks = 0;
    let totalConvs = 0;

    channels.forEach(ch => {
      const b = ch.budget === "" ? 0 : +ch.budget;
      const c = ch.cpc === "" ? 0.1 : +ch.cpc;
      const r = ch.convRate === "" ? 1 : +ch.convRate;

      totalBudget += b;
      const chClicks = c > 0 ? b / c : 0;
      const chConvs = chClicks * (r / 100);
      totalClicks += chClicks;
      totalConvs += chConvs;
    });

    const averageCPA = totalConvs > 0 ? totalBudget / totalConvs : 0;
    const projectedRevenue = totalConvs * (avgLTV === "" ? 0 : +avgLTV);
    const roas = totalBudget > 0 ? projectedRevenue / totalBudget : 0;

    return { totalBudget, clicks: totalClicks, convs: totalConvs, cpa: averageCPA, roas };
  }, [channels, avgLTV]);

  // Counters for premium animated feedback
  const animBudget = useCountUp(stats.totalBudget);
  const animConvs = useCountUp(stats.convs);
  const animCPA = useCountUp(stats.cpa);

  // Apply objective presets
  const handleApplyPreset = (preset) => {
    const nextChannels = channels.map(ch => {
      const pct = preset.allocations[ch.id] || 0;
      return { ...ch, budget: (stats.totalBudget * pct) / 100 };
    });
    setChannels(nextChannels);
    saveState(nextChannels, tasks);
  };

  const handleBudgetChange = (id, newBudget) => {
    const clamped = newBudget === "" ? "" : Math.max(0, newBudget);
    const nextChannels = channels.map(ch => ch.id === id ? { ...ch, budget: clamped } : ch);
    setChannels(nextChannels);
    saveState(nextChannels.map(c => ({ ...c, budget: c.budget === "" ? 0 : +c.budget })), tasks);
  };

  const handleMetricChange = (id, key, val) => {
    const clamped = val === "" ? "" : Math.max(0, val);
    const nextChannels = channels.map(ch => ch.id === id ? { ...ch, [key]: clamped } : ch);
    setChannels(nextChannels);
    saveState(nextChannels.map(c => {
      const fixed = { ...c };
      if (fixed.cpc === "") fixed.cpc = 0.1;
      if (fixed.ctr === "") fixed.ctr = 1;
      if (fixed.convRate === "") fixed.convRate = 1;
      return fixed;
    }), tasks);
  };

  // Task interactions
  const handleToggleTask = (id) => {
    const nextTasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(nextTasks);
    saveState(channels, nextTasks);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    const newTask = {
      id: Date.now(),
      text: newTaskText.trim(),
      completed: false,
      phase: newTaskPhase
    };
    const nextTasks = [...tasks, newTask];
    setTasks(nextTasks);
    setNewTaskText("");
    saveState(channels, nextTasks);
  };

  const handleDeleteTask = (id, text) => {
    if (!confirm(text ? `Delete task "${text}"?` : "Delete this task?")) return;
    const nextTasks = tasks.filter(t => t.id !== id);
    setTasks(nextTasks);
    saveState(channels, nextTasks);
  };

  const handleReset = () => {
    if (confirm("Reset layout to default allocations and tasks?")) {
      setChannels(DEFAULT_CHANNELS);
      setTasks(DEFAULT_TASKS);
      setTargetCPA(35);
      setAvgLTV(120);
      setActiveTimelineDay(12);
      localStorage.removeItem("cb_planner_channels");
      localStorage.removeItem("cb_planner_tasks");
      localStorage.removeItem("cb_planner_target_cpa");
      localStorage.removeItem("cb_planner_avg_ltv");
      localStorage.removeItem("cb_planner_active_day");
    }
  };

  // Timeline helpers
  const phases = [
    { key: "creative", name: "Creative Setup", range: [1, 10] },
    { key: "setup", name: "Tracking Setup", range: [11, 15] },
    { key: "launch", name: "Campaign Launch", range: [16, 25] },
    { key: "scale", name: "Scale & Optimize", range: [26, 30] }
  ];

  const currentActivePhase = useMemo(() => {
    const day = activeTimelineDay === "" ? 1 : +activeTimelineDay;
    return phases.find(p => day >= p.range[0] && day <= p.range[1]) || phases[0];
  }, [activeTimelineDay]);

  const filteredTasks = useMemo(() => {
    if (currentPhaseFilter === "all") return tasks;
    return tasks.filter(t => t.phase === currentPhaseFilter);
  }, [tasks, currentPhaseFilter]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pct = total > 0 ? (completed / total) * 100 : 0;
    return { total, completed, pct };
  }, [tasks]);

  return (
    <div className="space-y-4 scale-enter relative">
      <style>{ANIM_STYLES}</style>

      {/* ── TOP METRICS BOARD (STATIC) ────────────────────────────────── */}
      <div className="primary-glow rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/5 p-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">

          <div aria-live="polite" className="rounded-xl border border-[var(--primary)]/20 bg-[var(--card)]/75 p-4 flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Total Budget</span>
              <div className="text-3xl font-black font-mono text-[var(--primary)] mt-1">${fmt(animBudget)}</div>
            </div>
            <p className="text-[10px] text-[var(--muted-foreground)] truncate mt-1">across all channels</p>
          </div>

          <div aria-live="polite" className="rounded-xl border border-[var(--primary)]/20 bg-[var(--card)]/75 p-4 flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]">Projected Conversions</span>
              <div className="text-3xl font-black font-mono text-[var(--foreground)] mt-1">{fmt(animConvs)}</div>
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-[var(--muted-foreground)]">
              <span>CPA: ${fmt(animCPA)}</span>
              <span className="font-bold text-[var(--primary)]">Target: ${targetCPA === "" ? 0 : targetCPA}</span>
            </div>
          </div>

          <div aria-live="polite" className="rounded-xl border border-[var(--primary)]/20 bg-[var(--card)]/75 p-4 flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Projected ROAS</span>
              <div className="text-3xl font-black font-mono text-[var(--foreground)] mt-1">{fmt(stats.roas, 2)}x</div>
            </div>
            <span className="text-[10px] text-[var(--primary)] font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" /> ROI {fmt((stats.roas - 1) * 100)}%
            </span>
          </div>

          <div aria-live="polite" className="rounded-xl border border-[var(--primary)]/20 bg-[var(--card)]/75 p-4 flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--muted-foreground)]">Task Progress</span>
              <div className="text-3xl font-black font-mono text-[var(--foreground)] mt-1">{taskStats.completed} / {taskStats.total}</div>
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="h-1.5 w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
                <div className="h-full bg-[var(--primary)] rounded-xl" style={{ width: `${taskStats.pct}%` }} />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-[var(--muted-foreground)]">
                <span>{fmt(taskStats.pct)}% Done</span>
                <button onClick={handleReset} className="text-[var(--primary)] hover:underline flex items-center gap-0.5 cursor-default">
                  <RefreshCw className="h-2.5 w-2.5" /> Reset Default
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Presets and Global parameters bar */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] shrink-0">Strategy Presets:</span>
          {PRESETS.map(p => (
            <button key={p.name} onClick={() => handleApplyPreset(p)}
              className="rounded-xl btn-secondary px-3 py-1.5 text-xs font-bold hover:border-[var(--primary)]/40 hover:text-[var(--primary)] cursor-default">
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--muted-foreground)] shrink-0">Target CPA:</span>
            <input type="number" value={targetCPA} onChange={e => { const val = e.target.value; setTargetCPA(val === "" ? "" : +val); if (val !== "") localStorage.setItem("cb_planner_target_cpa", val); }}
              className="w-16 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[var(--muted-foreground)] shrink-0">Cust. LTV ($):</span>
            <input type="number" value={avgLTV} onChange={e => { const val = e.target.value; setAvgLTV(val === "" ? "" : +val); if (val !== "") localStorage.setItem("cb_planner_avg_ltv", val); }}
              className="w-16 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-2 py-0.5 font-mono text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          </div>
        </div>
      </div>

      {/* Main Budget Grid */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* LEFT COLUMN: Channels and Allocator sliders */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-[var(--primary)]" /> Channel Budget Allocation
            </h3>
            <span className="text-xs font-bold text-[var(--foreground)] sm:text-right shrink-0">
              Conversions: <span className="font-black font-mono text-[var(--primary)]">{fmt(stats.convs)}</span>
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Drag the sliders to allocate funds across marketing channels. The visual breakdown below updates dynamically.
          </p>

          {/* Dynamic visual segment allocation bar */}
          <div className="h-6 w-full rounded-xl overflow-hidden flex border border-[var(--border)] bg-[var(--input-bg)]">
            {channels.map(ch => {
              const pct = stats.totalBudget > 0 ? ((ch.budget === "" ? 0 : +ch.budget) / stats.totalBudget) * 100 : 0;
              return (
                <div key={ch.id}
                  style={{ width: `${pct}%`, backgroundColor: ch.color }}
                  className="h-full relative group first:rounded-l-xl last:rounded-r-xl" />
              );
            })}
          </div>

          <div className="space-y-3.5">
            {channels.map(ch => {
              const pct = stats.totalBudget > 0 ? ((ch.budget === "" ? 0 : +ch.budget) / stats.totalBudget) * 100 : 0;
              return (
                <div key={ch.id} className="space-y-1.5 p-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)]/35">
                  <div className="flex justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="h-2.5 w-2.5 rounded-xl shrink-0" style={{ backgroundColor: ch.color }} />
                      <span className="font-bold text-[var(--foreground)] truncate">{ch.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono font-bold">
                      <span className="text-[10px] text-[var(--muted-foreground)]">({fmt(pct)}%)</span>
                      <input type="number" min={0} value={ch.budget} onChange={e => { const val = e.target.value; handleBudgetChange(ch.id, val === "" ? "" : +val); }}
                        className="w-20 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-1.5 py-0.5 text-right text-xs font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
                    </div>
                  </div>
                  <input type="range" min={0} max={20000} step={100} value={ch.budget === "" ? 0 : ch.budget} onChange={e => handleBudgetChange(ch.id, +e.target.value)}
                    className="w-full accent-[var(--primary)] cursor-pointer" />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Acquisition Table Estimator */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4 overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <BarChart2 className="h-4 w-4 text-[var(--primary)]" /> ROI & Customer Acquisition Estimator
            </h3>
            <span className="text-xs font-bold text-[var(--foreground)] sm:text-right shrink-0">
              Avg CPA: <span className={`font-black font-mono ${stats.cpa <= (targetCPA === "" ? 0 : +targetCPA) ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>${fmt(stats.cpa, 0)}</span>
            </span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            Fine-tune metrics for each channel to project conversions and average Customer Acquisition Cost (CPA).
          </p>

          <div className="overflow-x-auto border border-[var(--card-border)] rounded-xl">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--card-border)] bg-[var(--input-bg)] text-[10px] font-bold uppercase text-[var(--muted-foreground)]">
                  <th className="px-3 py-2.5">Channel</th>
                  <th className="px-3 py-2.5">CPC ($)</th>
                  <th className="px-3 py-2.5">CTR (%)</th>
                  <th className="px-3 py-2.5">Conv. (%)</th>
                  <th className="px-3 py-2.5 text-right">Projected CPA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)] bg-[var(--card)]">
                {channels.map(ch => {
                  const b = ch.budget === "" ? 0 : +ch.budget;
                  const c = ch.cpc === "" ? 0.1 : +ch.cpc;
                  const r = ch.convRate === "" ? 1 : +ch.convRate;

                  const chClicks = c > 0 ? b / c : 0;
                  const chConvs = chClicks * (r / 100);
                  const chCpa = chConvs > 0 ? b / chConvs : 0;

                  return (
                    <tr key={ch.id} className="hover:bg-[var(--muted)]/20">
                      <td className="px-3 py-3 font-semibold text-[var(--foreground)] truncate max-w-[120px]">{ch.name}</td>
                      <td className="px-3 py-3 font-mono">
                        <input type="number" min={0} step={0.05} value={ch.cpc} onChange={e => { const val = e.target.value; handleMetricChange(ch.id, "cpc", val === "" ? "" : +val); }}
                          className="w-14 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-1 py-0.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
                      </td>
                      <td className="px-3 py-3 font-mono">
                        <input type="number" min={0} step={0.1} value={ch.ctr} onChange={e => { const val = e.target.value; handleMetricChange(ch.id, "ctr", val === "" ? "" : +val); }}
                          className="w-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-1 py-0.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
                      </td>
                      <td className="px-3 py-3 font-mono">
                        <input type="number" min={0} step={0.1} value={ch.convRate} onChange={e => { const val = e.target.value; handleMetricChange(ch.id, "convRate", val === "" ? "" : +val); }}
                          className="w-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-1 py-0.5 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
                      </td>
                      <td className={`px-3 py-3 text-right font-mono font-bold ${chCpa <= (targetCPA === "" ? 0 : +targetCPA) ? "text-[var(--primary)]" : "text-[var(--secondary-foreground)]"}`}>
                        ${fmt(chCpa, 0)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-dashed border-[var(--primary)]/30 bg-[var(--primary)]/5 p-4 flex gap-3">
            <Info className="h-4 w-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[var(--secondary-foreground)] leading-relaxed">
              Channels highlighted with <span className="text-[var(--primary)] font-bold">primary values</span> achieve a projected acquisition cost below your **${targetCPA === "" ? 0 : targetCPA} Target CPA**. Consider scaling budgets towards search/social channels with higher conversion rates!
            </p>
          </div>
        </div>

      </div>

      {/* ── TIMELINE & PHASE PROGRESS ─────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-[var(--primary)]" /> 30-Day Campaign Phase Timeline
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)]">Day {activeTimelineDay === "" ? 0 : activeTimelineDay} of 30</span>
            <input type="number" min={1} max={30} value={activeTimelineDay} onChange={e => { const val = e.target.value; if (val === "") { setActiveTimelineDay(""); } else { const parsed = Math.min(30, Math.max(1, +val)); setActiveTimelineDay(parsed); localStorage.setItem("cb_planner_active_day", parsed.toString()); } }}
              className="w-12 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-1.5 py-0.5 text-center text-xs font-mono font-bold text-[var(--foreground)] outline-none focus:border-[var(--primary)]" />
          </div>
        </div>

        {/* Day timeline slider */}
        <div className="space-y-1">
          <input type="range" min={1} max={30} value={activeTimelineDay === "" ? 1 : activeTimelineDay} onChange={e => { setActiveTimelineDay(+e.target.value); localStorage.setItem("cb_planner_active_day", e.target.value); }}
            className="w-full accent-[var(--primary)] cursor-pointer" />
          <div className="flex justify-between text-[9px] font-mono text-[var(--muted-foreground)]">
            <span>Day 1</span>
            <span>Day 15 (Mid-Point)</span>
            <span>Day 30 (Launch Wrap)</span>
          </div>
        </div>

        {/* Visual Stepper representation */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {phases.map(p => {
            const day = activeTimelineDay === "" ? 1 : +activeTimelineDay;
            const isActive = day >= p.range[0] && day <= p.range[1];
            return (
              <div key={p.key} onClick={() => { setActiveTimelineDay(p.range[0]); localStorage.setItem("cb_planner_active_day", p.range[0].toString()); }}
                className={`rounded-xl border p-4 cursor-default transition-all ${
                  isActive
                    ? "border-[var(--primary)]/40 bg-[var(--primary)]/5 ring-1 ring-[var(--primary)]/10"
                    : "border-[var(--card-border)] bg-[var(--input-bg)]/40 hover:bg-[var(--muted)]/10"
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Days {p.range[0]}-{p.range[1]}</span>
                  {isActive && <span className="h-2 w-2 rounded-xl bg-[var(--primary)] animate-ping" />}
                </div>
                <h4 className={`text-xs font-black mt-1 ${isActive ? "text-[var(--primary)]" : "text-[var(--foreground)]"}`}>{p.name}</h4>
                <p className="text-[9px] text-[var(--muted-foreground)] mt-0.5 leading-relaxed">
                  {p.key === "creative" && "Assemble graphics, copy, landing test specs."}
                  {p.key === "setup" && "Integrate pixels, GTM, analytics goals."}
                  {p.key === "launch" && "Deploy live initial asset arrays."}
                  {p.key === "scale" && "Audit click weights, re-scale budgets."}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ACTION TASKS CHECKLIST ────────────────────────────────────── */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-wider text-[var(--primary)] flex items-center gap-1.5">
              <ListChecks className="h-4 w-4 text-[var(--primary)]" /> Action Items & Next Steps
            </h3>
            <p className="text-[11px] text-[var(--muted-foreground)]">
              Map out exact next steps for launching. Active phase matches **{currentActivePhase.name}** based on day timeline.
            </p>
          </div>

          {/* Phase Filter controls */}
          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
            {["all", "creative", "setup", "launch", "scale"].map(f => (
              <button key={f} onClick={() => setCurrentPhaseFilter(f)}
                className={`rounded-xl px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-default ${
                  currentPhaseFilter === f
                    ? "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30"
                    : "bg-[var(--input-bg)] text-[var(--muted-foreground)] border border-[var(--card-border)] hover:bg-[var(--muted)]/20"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task Form & List */}
        <div className="grid gap-4 md:grid-cols-3">

          {/* Add custom task card */}
          <form onSubmit={handleAddTask} className="md:col-span-1 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)]/35 p-4 space-y-3.5 h-fit">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Add Campaign Task</span>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Task Description</label>
              <input type="text" placeholder="e.g. Audit landing page conversion rate" value={newTaskText} onChange={e => setNewTaskText(e.target.value)}
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]/50" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-[var(--muted-foreground)] uppercase">Assign Phase</label>
              <select value={newTaskPhase} onChange={e => setNewTaskPhase(e.target.value)}
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--primary)]/50">
                <option value="creative">Creative Setup (D1-10)</option>
                <option value="setup">Tracking Setup (D11-15)</option>
                <option value="launch">Campaign Launch (D16-25)</option>
                <option value="scale">Scale & Optimize (D26-30)</option>
              </select>
            </div>

            <button type="submit"
              className="w-full rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-[var(--primary-hover)] transition-colors cursor-default">
              <Plus className="h-3.5 w-3.5" /> Append Task
            </button>
          </form>

          {/* List items */}
          <div className="md:col-span-2 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)]/35 p-4 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] block">Campaign Checklist</span>
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-[var(--muted-foreground)]">
                No tasks available for this filter.
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-[290px] overflow-y-auto pr-1">
                {filteredTasks.map(t => (
                  <div key={t.id} className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3 flex items-center justify-between gap-3 hover:border-[var(--primary)]/20">
                    <div className="flex items-center gap-3 min-w-0">
                      <button onClick={() => handleToggleTask(t.id)}
                        aria-label={t.completed ? "Mark task incomplete" : "Mark task complete"}
                        aria-pressed={t.completed}
                        className={`flex h-5 w-5 items-center justify-center rounded-xl border shrink-0 ${
                          t.completed
                            ? "bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)]"
                            : "border-[var(--input-border)] bg-[var(--input-bg)] hover:border-[var(--primary)]/40"
                        } cursor-default`}>
                        {t.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <span className={`text-xs text-[var(--foreground)] truncate leading-relaxed ${t.completed ? "line-through opacity-50" : ""}`}>
                        {t.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-xl text-[8px] font-black uppercase bg-[var(--primary)]/10 text-[var(--primary)]">
                        {t.phase}
                      </span>
                      <button onClick={() => handleDeleteTask(t.id, t.text)} aria-label="Delete task" className="text-red-400 hover:text-red-300 p-1 cursor-default">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
