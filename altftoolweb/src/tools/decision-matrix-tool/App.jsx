"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Copy,
  Download,
  Filter,
  ListChecks,
  Plus,
  Printer,
  Search,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
} from "lucide-react";

const STORAGE_KEY = "altftools:decision-matrix-tool:v1";
const emptyDecision = {
  title: "",
  description: "",
  goal: "",
  category: "",
  options: [],
  criteria: [],
  scores: {},
  updatedAt: "",
};
const defaultState = {
  decisions: [],
  activeDecisionId: null,
  filters: { query: "", optionQuery: "", criteriaQuery: "", sort: "score" },
};

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function clampNumber(value, min, max) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.max(min, Math.min(max, parsed));
}

function sanitizeState(value) {
  const merged = { ...defaultState, ...(value || {}) };
  return {
    ...merged,
    decisions: Array.isArray(merged.decisions)
      ? merged.decisions.map((decision) => ({
          ...emptyDecision,
          ...decision,
          options: Array.isArray(decision.options) ? decision.options : [],
          criteria: Array.isArray(decision.criteria) ? decision.criteria : [],
          scores: decision.scores && typeof decision.scores === "object" ? decision.scores : {},
        }))
      : [],
    filters: { ...defaultState.filters, ...(merged.filters || {}) },
  };
}

function calculateResults(decision) {
  const criteria = decision?.criteria || [];
  const options = decision?.options || [];
  const totalWeight = criteria.reduce((sum, item) => sum + clampNumber(item.weight, 0, 100), 0);
  const denominator = totalWeight || criteria.length || 1;
  const rows = options.map((option) => {
    const breakdown = criteria.map((criterion) => {
      const rawScore = clampNumber(decision.scores?.[option.id]?.[criterion.id] ?? 0, 0, 10);
      const weight = totalWeight ? clampNumber(criterion.weight, 0, 100) : 1;
      const contribution = (rawScore * weight) / denominator;
      return { criterionId: criterion.id, label: criterion.label, score: rawScore, contribution };
    });
    const total = breakdown.reduce((sum, item) => sum + item.contribution, 0);
    return { ...option, total, breakdown };
  });
  return rows.sort((a, b) => b.total - a.total).map((row, index) => ({ ...row, rank: index + 1 }));
}

function makeSummary(decision, results) {
  if (!decision) return "Create a decision to generate a report.";
  const criteriaLines = decision.criteria.map((item) => `- ${item.label}: ${item.weight}%`).join("\n") || "No criteria added";
  const rankingLines =
    results.map((item) => `${item.rank}. ${item.name} - ${item.total.toFixed(2)}/10`).join("\n") ||
    "No scored options yet";
  const matrixLines =
    decision.options
      .map((option) => {
        const scores = decision.criteria
          .map((criterion) => `${criterion.label}: ${clampNumber(decision.scores?.[option.id]?.[criterion.id] ?? 0, 0, 10)}`)
          .join(", ");
        return `- ${option.name}${scores ? ` | ${scores}` : ""}`;
      })
      .join("\n") || "No matrix rows yet";
  return `${decision.title}
Category: ${decision.category || "Uncategorized"}
Goal: ${decision.goal || "Not added"}
Description: ${decision.description || "Not added"}

Best Choice: ${results[0]?.name || "Not enough data"}

Criteria Weights:
${criteriaLines}

Rankings:
${rankingLines}

Matrix:
${matrixLines}`;
}

export default function DecisionMatrixToolApp() {
  const [state, setState] = useState(() => {
    if (typeof window === "undefined") return defaultState;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? sanitizeState(JSON.parse(saved)) : defaultState;
    } catch {
      return defaultState;
    }
  });
  const [draft, setDraft] = useState(emptyDecision);
  const [optionName, setOptionName] = useState("");
  const [criterionDraft, setCriterionDraft] = useState({ label: "", weight: 10 });
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const activeDecision = useMemo(
    () => state.decisions.find((decision) => decision.id === state.activeDecisionId) || null,
    [state.activeDecisionId, state.decisions],
  );
  const results = useMemo(() => calculateResults(activeDecision), [activeDecision]);
  const summary = useMemo(() => makeSummary(activeDecision, results), [activeDecision, results]);
  const totalWeight = useMemo(
    () => (activeDecision?.criteria || []).reduce((sum, item) => sum + clampNumber(item.weight, 0, 100), 0),
    [activeDecision],
  );
  const filteredOptions = useMemo(() => {
    const term = state.filters.optionQuery.trim().toLowerCase();
    const rows = term ? results.filter((option) => option.name.toLowerCase().includes(term)) : results;
    if (state.filters.sort === "name") return [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (state.filters.sort === "low") return [...rows].sort((a, b) => a.total - b.total);
    return rows;
  }, [results, state.filters.optionQuery, state.filters.sort]);
  const filteredCriteria = useMemo(() => {
    const term = state.filters.criteriaQuery.trim().toLowerCase();
    return term
      ? (activeDecision?.criteria || []).filter((criterion) => criterion.label.toLowerCase().includes(term))
      : activeDecision?.criteria || [];
  }, [activeDecision, state.filters.criteriaQuery]);
  const savedDecisions = useMemo(() => {
    const term = state.filters.query.trim().toLowerCase();
    return state.decisions.filter((decision) =>
      `${decision.title} ${decision.description} ${decision.goal} ${decision.category}`.toLowerCase().includes(term),
    );
  }, [state.decisions, state.filters.query]);

  function patchActive(patch) {
    if (!activeDecision) return;
    setState((current) => ({
      ...current,
      decisions: current.decisions.map((decision) =>
        decision.id === activeDecision.id ? { ...decision, ...patch, updatedAt: new Date().toISOString() } : decision,
      ),
    }));
  }

  function createDecision(event) {
    event.preventDefault();
    const title = draft.title.trim();
    if (!title) return setMessage("Decision title is required.");
    const decision = {
      ...emptyDecision,
      id: makeId(),
      title,
      description: draft.description.trim(),
      goal: draft.goal.trim(),
      category: draft.category.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setState((current) => ({ ...current, decisions: [decision, ...current.decisions], activeDecisionId: decision.id }));
    setDraft(emptyDecision);
    setMessage("Decision workspace created.");
  }

  function addOption(event) {
    event.preventDefault();
    if (!activeDecision) return setMessage("Create or select a decision first.");
    const name = optionName.trim();
    if (!name) return setMessage("Option name is required.");
    patchActive({ options: [{ id: makeId(), name }, ...activeDecision.options] });
    setOptionName("");
  }

  function addCriterion(event) {
    event.preventDefault();
    if (!activeDecision) return setMessage("Create or select a decision first.");
    const label = criterionDraft.label.trim();
    if (!label) return setMessage("Criteria label is required.");
    patchActive({
      criteria: [{ id: makeId(), label, weight: clampNumber(criterionDraft.weight, 0, 100) }, ...activeDecision.criteria],
    });
    setCriterionDraft({ label: "", weight: 10 });
  }

  function updateScore(optionId, criterionId, value) {
    const score = clampNumber(value, 0, 10);
    patchActive({
      scores: {
        ...activeDecision.scores,
        [optionId]: { ...(activeDecision.scores[optionId] || {}), [criterionId]: score },
      },
    });
  }

  function removeOption(optionId) {
    const nextScores = { ...activeDecision.scores };
    delete nextScores[optionId];
    patchActive({ options: activeDecision.options.filter((option) => option.id !== optionId), scores: nextScores });
  }

  function removeCriterion(criterionId) {
    const nextScores = Object.fromEntries(
      Object.entries(activeDecision.scores || {}).map(([optionId, values]) => {
        const nextValues = { ...values };
        delete nextValues[criterionId];
        return [optionId, nextValues];
      }),
    );
    patchActive({ criteria: activeDecision.criteria.filter((criterion) => criterion.id !== criterionId), scores: nextScores });
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setMessage("Decision report copied.");
  }

  function exportSummary() {
    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeDecision?.title || "decision-matrix"}-summary.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function deleteDecision(id) {
    setState((current) => ({
      ...current,
      decisions: current.decisions.filter((decision) => decision.id !== id),
      activeDecisionId: current.activeDecisionId === id ? null : current.activeDecisionId,
    }));
  }

  const hasMatrix = Boolean(activeDecision?.options.length && activeDecision?.criteria.length);
  const highestScore = results[0]?.total || 0;
  const confidence = activeDecision?.options.length > 1 && results.length > 1 ? Math.min(100, Math.round((results[0].total - results[1].total) * 20 + 50)) : 0;

  return (
    <div className="decision-matrix-shell min-h-screen overflow-x-hidden bg-(--background) px-2 py-5 font-secondary text-(--foreground) sm:px-3">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="relative overflow-hidden rounded-3xl border border-(--border) bg-(--card) p-5 text-center shadow-xl sm:p-7">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-(--primary) to-transparent opacity-45" />
          <div className="mb-3 inline-flex max-w-full items-center gap-2 rounded-full border border-(--border) bg-(--background) px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-(--primary)">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span className="break-words">Live weighted decision engine</span>
          </div>
          <h1 className="text-gradient-hero break-words text-3xl font-black tracking-tight sm:text-5xl">
            Decision Matrix Tool
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Build a custom matrix from your own options, criteria, weights, and scores. Rankings, charts, and summaries recalculate instantly.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
            <Stat label="Options" value={activeDecision?.options.length || 0} />
            <Stat label="Criteria" value={activeDecision?.criteria.length || 0} />
            <Stat label="Weight" value={`${totalWeight}%`} />
            <Stat label="Best Score" value={highestScore.toFixed(2)} />
            <Stat label="Saved" value={state.decisions.length} />
          </div>
        </header>

        {message && (
          <div className="flex items-start justify-between gap-3 rounded-2xl border border-(--border) bg-(--card) px-3 py-2 text-sm font-semibold text-(--foreground) shadow-sm">
            <span className="min-w-0 break-words">{message}</span>
            <button onClick={() => setMessage("")} className="shrink-0 rounded-full p-1 hover:bg-cyan-500/10" aria-label="Dismiss message">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <main className="grid min-w-0 gap-4 xl:grid-cols-[340px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-w-0 space-y-4">
            <Panel title="Decision Setup" icon={Target}>
              <form onSubmit={createDecision} className="space-y-3">
                <Field label="Decision title" value={draft.title} onChange={(value) => setDraft({ ...draft, title: value })} />
                <Field label="Goal" value={draft.goal} onChange={(value) => setDraft({ ...draft, goal: value })} />
                <Field label="Category" value={draft.category} onChange={(value) => setDraft({ ...draft, category: value })} />
                <Field label="Description" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} textarea />
                <button className="btn-primary inline-flex w-full items-center justify-center gap-2 px-3 py-2.5 text-sm shadow-md">
                  <Plus className="h-4 w-4" /> Create decision
                </button>
              </form>
            </Panel>

            <Panel title="Search & Saved Decisions" icon={Search}>
              <SearchInput value={state.filters.query} onChange={(query) => setState((current) => ({ ...current, filters: { ...current.filters, query } }))} placeholder="Search decisions" />
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {savedDecisions.map((decision) => (
                  <button
                    key={decision.id}
                    onClick={() => setState((current) => ({ ...current, activeDecisionId: decision.id }))}
                    className={`w-full min-w-0 rounded-2xl border p-3 text-left shadow-sm transition hover:border-(--primary) ${activeDecision?.id === decision.id ? "border-(--primary) bg-(--background)" : "border-(--border) bg-(--background)"}`}
                  >
                    <div className="break-words text-sm font-black">{decision.title}</div>
                    <div className="mt-1 break-words text-xs text-muted-foreground">{decision.category || "Uncategorized"} | {decision.options.length} options | {decision.criteria.length} criteria</div>
                  </button>
                ))}
                {!savedDecisions.length && <EmptyState text="No saved decisions match your search." />}
              </div>
            </Panel>

            {activeDecision && (
              <Panel title="Managers" icon={ListChecks}>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-1">
                  <form onSubmit={addOption} className="space-y-2 rounded-2xl border border-(--border) bg-(--background) p-3 shadow-sm">
                    <Field label="New option" value={optionName} onChange={setOptionName} />
                    <button className="btn-primary inline-flex w-full flex-wrap items-center justify-center gap-2 px-3 py-2 text-sm"><Plus className="h-4 w-4 shrink-0" /> <span className="break-words">Add option</span></button>
                  </form>
                  <form onSubmit={addCriterion} className="space-y-2 rounded-2xl border border-(--border) bg-(--background) p-3 shadow-sm">
                    <Field label="New criterion" value={criterionDraft.label} onChange={(label) => setCriterionDraft({ ...criterionDraft, label })} />
                    <NumberInput label="Weight %" value={criterionDraft.weight} min={0} max={100} onChange={(weight) => setCriterionDraft({ ...criterionDraft, weight })} />
                    <button className="btn-primary inline-flex w-full flex-wrap items-center justify-center gap-2 px-3 py-2 text-sm"><Plus className="h-4 w-4 shrink-0" /> <span className="break-words">Add criterion</span></button>
                  </form>
                </div>
              </Panel>
            )}
          </aside>

          <section className="min-w-0 space-y-4">
            {!activeDecision ? (
              <Panel title="Workspace" icon={Sparkles}>
                <EmptyState text="Create or select a saved decision to open the live matrix, ranking board, dashboard, charts, filters, and export controls." />
              </Panel>
            ) : (
              <>
                <Panel title="Live Dashboard" icon={BarChart3}>
                  <div className="grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(130px,1fr))]">
                    <Metric label="Best choice" value={results[0]?.name || "No ranking yet"} />
                    <Metric label="Highest score" value={`${highestScore.toFixed(2)}/10`} />
                    <Metric label="Confidence" value={confidence ? `${confidence}%` : "Needs data"} />
                    <Metric label="Weight status" value={totalWeight === 100 ? "Balanced" : `${totalWeight}% total`} />
                  </div>
                  <div className="rounded-2xl border border-(--border) bg-(--background) p-3 text-sm font-semibold leading-relaxed text-(--foreground) shadow-sm">
                    {hasMatrix ? `${results[0]?.name || "Top option"} is currently leading from ${activeDecision.options.length} options across ${activeDecision.criteria.length} weighted criteria.` : "Add at least one option and one criterion to activate the scoring engine."}
                  </div>
                </Panel>

                <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
                  <Panel title="Decision Matrix" icon={SlidersHorizontal}>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <SearchInput value={state.filters.optionQuery} onChange={(optionQuery) => setState((current) => ({ ...current, filters: { ...current.filters, optionQuery } }))} placeholder="Filter options" />
                      <SearchInput value={state.filters.criteriaQuery} onChange={(criteriaQuery) => setState((current) => ({ ...current, filters: { ...current.filters, criteriaQuery } }))} placeholder="Find criteria" />
                      <Select value={state.filters.sort} onChange={(sort) => setState((current) => ({ ...current, filters: { ...current.filters, sort } }))} options={[["score", "Top score"], ["low", "Low score"], ["name", "Name"]]} />
                    </div>
                    {hasMatrix ? (
                      <div className="custom-scrollbar overflow-x-auto rounded-2xl border border-(--border) shadow-sm">
                        <table className="w-full min-w-[760px] table-fixed border-collapse text-sm">
                          <thead className="bg-(--muted) text-left text-[10px] uppercase tracking-[.12em] text-muted-foreground">
                            <tr>
                              <th className="w-[220px] p-3">Option</th>
                              {filteredCriteria.map((criterion) => (
                                <th key={criterion.id} className="w-[170px] p-3">
                                  <div className="whitespace-normal break-words leading-snug">{criterion.label}</div>
                                  <NumberInput compact value={criterion.weight} min={0} max={100} onChange={(weight) => patchActive({ criteria: activeDecision.criteria.map((item) => item.id === criterion.id ? { ...item, weight } : item) })} />
                                </th>
                              ))}
                              <th className="w-[110px] p-3">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOptions.map((option) => (
                              <tr key={option.id} className="border-t border-(--border) bg-(--background)/70">
                                <td className="p-2 align-top">
                                  <div className="flex min-w-0 items-start gap-2">
                                    <input value={option.name} onChange={(event) => patchActive({ options: activeDecision.options.map((item) => item.id === option.id ? { ...item, name: event.target.value } : item) })} className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 font-black outline-none focus:border-(--primary) focus:bg-(--muted)" />
                                    <button onClick={() => removeOption(option.id)} className="shrink-0 rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10" aria-label="Remove option"><Trash2 className="h-4 w-4" /></button>
                                  </div>
                                </td>
                                {filteredCriteria.map((criterion) => (
                                  <td key={criterion.id} className="p-2 align-top">
                                    <input type="number" min="0" max="10" step="0.1" value={activeDecision.scores?.[option.id]?.[criterion.id] ?? 0} onChange={(event) => updateScore(option.id, criterion.id, event.target.value)} className="w-full rounded-lg border border-(--border) bg-(--card) px-2 py-2 font-bold outline-none focus:border-(--primary)" />
                                  </td>
                                ))}
                                <td className="p-3 align-top font-black text-(--primary)">{option.total.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <EmptyState text="Add options and criteria to build the matrix table." />
                    )}
                  </Panel>

                  <Panel title="Criteria Builder" icon={Filter}>
                    <div className="max-h-[430px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                      {filteredCriteria.map((criterion) => (
                        <div key={criterion.id} className="rounded-2xl border border-(--border) bg-(--background) p-3 shadow-sm">
                          <div className="flex items-start gap-2">
                            <input value={criterion.label} onChange={(event) => patchActive({ criteria: activeDecision.criteria.map((item) => item.id === criterion.id ? { ...item, label: event.target.value } : item) })} className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-black outline-none focus:border-(--primary)" />
                            <button onClick={() => removeCriterion(criterion.id)} className="shrink-0 rounded-lg p-1.5 text-rose-500 hover:bg-rose-500/10" aria-label="Remove criterion"><Trash2 className="h-4 w-4" /></button>
                          </div>
                          <NumberInput label="Weight %" value={criterion.weight} min={0} max={100} onChange={(weight) => patchActive({ criteria: activeDecision.criteria.map((item) => item.id === criterion.id ? { ...item, weight } : item) })} />
                        </div>
                      ))}
                      {!filteredCriteria.length && <EmptyState text="No criteria yet." />}
                    </div>
                  </Panel>
                </div>

                <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
                  <Panel title="Real-Time Rankings" icon={Trophy}>
                    <div className="space-y-2">
                      {results.map((option) => (
                        <div key={option.id} className={`rounded-2xl border p-3 shadow-sm ${option.rank === 1 ? "border-(--primary) bg-(--background)" : "border-(--border) bg-(--background)"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="break-words text-sm font-black">#{option.rank} {option.name}</div>
                              <div className="mt-1 text-xs text-muted-foreground">Weighted total {option.total.toFixed(2)} / 10</div>
                            </div>
                            <span className="shrink-0 rounded-full bg-(--primary) px-3 py-1 text-xs font-black text-(--primary-foreground)">{option.total.toFixed(2)}</span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-500/10"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 transition-all duration-500" style={{ width: `${Math.min(100, option.total * 10)}%` }} /></div>
                        </div>
                      ))}
                      {!results.length && <EmptyState text="Rankings appear after you add options." />}
                    </div>
                  </Panel>

                  <Panel title="Charts & Export" icon={Download}>
                    <div className="space-y-3">
                      {results.map((option) => (
                        <Bar key={option.id} label={option.name} value={option.total} max={10} />
                      ))}
                      {!results.length && <EmptyState text="Live chart bars use only your scored options." />}
                    </div>
                    <pre className="max-h-52 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-(--border) bg-(--background) p-3 text-xs text-muted-foreground custom-scrollbar">{summary}</pre>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button onClick={copySummary} className="ActionButton"><Copy className="h-4 w-4" /> Copy</button>
                      <button onClick={exportSummary} className="ActionButton"><Download className="h-4 w-4" /> Export</button>
                      <button onClick={() => window.print()} className="ActionButton"><Printer className="h-4 w-4" /> Print</button>
                      <button onClick={() => deleteDecision(activeDecision.id)} className="ActionButton danger"><Trash2 className="h-4 w-4" /> Delete</button>
                    </div>
                  </Panel>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      <style jsx global>{`
        .decision-matrix-shell,
        .decision-matrix-shell * {
          min-width: 0;
          overflow-wrap: anywhere;
        }
        .decision-matrix-shell input,
        .decision-matrix-shell textarea,
        .decision-matrix-shell select {
          overflow-wrap: normal;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--primary) 35%, transparent); border-radius: 999px; }
        .ActionButton {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: .4rem;
          min-height: 2.6rem;
          border-radius: .75rem;
          border: 1px solid var(--secondary-border);
          background: var(--secondary-bg);
          padding: .6rem .7rem;
          color: var(--secondary-foreground);
          font-size: .8rem;
          font-weight: 800;
          line-height: 1.15;
          text-align: center;
        }
        .ActionButton:hover { background: var(--secondary-hover); color: var(--foreground); }
        .ActionButton.danger { border-color: rgba(244, 63, 94, .24); background: rgba(244, 63, 94, .10); color: rgb(244, 63, 94); }
        @media print {
          header, aside, button, input, select { display: none !important; }
          pre { max-height: none !important; color: #111827 !important; }
        }
      `}</style>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="min-w-0 overflow-visible rounded-3xl border border-(--border) bg-(--card) p-4 shadow-md transition duration-300 hover:border-(--primary) sm:p-5">
      <div className="mb-2.5 flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-(--background) text-(--primary) shadow-sm"><Icon className="h-4 w-4" /></div>
        <h2 className="min-w-0 break-words text-xs font-black uppercase leading-relaxed tracking-[.16em]">{title}</h2>
      </div>
      <div className="min-w-0 space-y-3">{children}</div>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background) px-3 py-2.5 shadow-sm transition hover:border-(--primary)">
      <div className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-xl font-black leading-tight">{value}</div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-2xl border border-(--border) bg-(--background) px-3 py-2.5 shadow-sm transition hover:border-(--primary)">
      <div className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 break-words text-base font-black leading-tight">{value}</div>
    </div>
  );
}

function Field({ label, value, onChange, textarea = false }) {
  const className = "w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none transition placeholder:text-(--input-placeholder) focus:border-(--primary)";
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span>
      {textarea ? <textarea value={value} onChange={(event) => onChange(event.target.value)} className={`${className} min-h-16 resize-y break-words`} /> : <input value={value} onChange={(event) => onChange(event.target.value)} className={className} />}
    </label>
  );
}

function NumberInput({ label, value, min, max, onChange, compact = false }) {
  return (
    <label className={`block min-w-0 ${compact ? "mt-2" : ""}`}>
      {label && <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[.16em] text-muted-foreground">{label}</span>}
      {!compact && <input type="range" min={min} max={max} value={value} onChange={(event) => onChange(clampNumber(event.target.value, min, max))} className="mb-2 w-full accent-(--primary)" />}
      <input type="number" min={min} max={max} value={value} onChange={(event) => onChange(clampNumber(event.target.value, min, max))} className="w-full rounded-xl border border-(--border) bg-(--card) px-2 py-1.5 text-sm font-bold text-(--foreground) outline-none focus:border-(--primary)" />
    </label>
  );
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative min-w-0">
      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-(--border) bg-(--background) py-2 pl-9 pr-3 text-sm text-(--foreground) outline-none focus:border-(--primary)" />
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--primary)">
      {options.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
    </select>
  );
}

function Bar({ label, value, max }) {
  const width = max ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black">
        <span className="min-w-0 break-words">{label}</span>
        <span className="shrink-0 text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-500/10">
        <div className="h-full rounded-full bg-(--primary) transition-all duration-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="inline-flex w-full items-center justify-center rounded-2xl border border-dashed border-(--border) bg-(--background) px-3 py-3 text-center text-sm leading-snug text-muted-foreground">{text}</div>;
}


