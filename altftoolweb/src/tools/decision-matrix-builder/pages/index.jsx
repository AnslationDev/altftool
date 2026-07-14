"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  Grid3x3,
  GripVertical,
  ListChecks,
  Plus,
  RefreshCw,
  Scale,
  Star,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const generateId = () => Math.random().toString(36).substring(2, 11);

const normalizeWeights = (list) => {
  const total = list.reduce((sum, c) => sum + c.weight, 0);
  if (total === 0) return list.map((c) => ({ ...c, weight: 0 }));
  return list.map((c) => ({
    ...c,
    weight: Math.round((c.weight / total) * 100),
  }));
};

const DEFAULT_OPTIONS = [
  { id: generateId(), name: "Option A" },
  { id: generateId(), name: "Option B" },
  { id: generateId(), name: "Option C" },
];

const DEFAULT_CRITERIA = [
  { id: generateId(), name: "Cost", weight: 30 },
  { id: generateId(), name: "Quality", weight: 25 },
  { id: generateId(), name: "Ease of Use", weight: 20 },
  { id: generateId(), name: "Support", weight: 25 },
];

const buildDefaultScores = (opts, crits) => {
  const map = {};
  const prefill = {};
  crits.forEach((c, ci) => {
    prefill[c.id] = [7, 8, 6, 5][ci] || 5;
  });
  opts.forEach((o, oi) => {
    map[o.id] = {};
    crits.forEach((c, ci) => {
      const matrix = [
        [7, 8, 6, 5],
        [5, 7, 9, 8],
        [8, 6, 7, 9],
      ];
      map[o.id][c.id] = matrix[oi]?.[ci] || 5;
    });
  });
  return map;
};

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <div className="mb-4 flex items-start gap-3">
        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">{description}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

function RankBadge({ rank }) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-bold text-amber-600">
        <Star className="h-3 w-3 fill-amber-500" /> 1st
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-bold text-slate-400">
        2nd
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-bold text-orange-600">
      {rank}th
    </span>
  );
}

export default function ToolHome() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [scores, setScores] = useState(() => buildDefaultScores(DEFAULT_OPTIONS, DEFAULT_CRITERIA));
  const [copied, setCopied] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [editingOptionName, setEditingOptionName] = useState("");
  const [editingCriterionId, setEditingCriterionId] = useState(null);
  const [editingCriterionName, setEditingCriterionName] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionWeight, setNewCriterionWeight] = useState(10);
  const [showAddOption, setShowAddOption] = useState(false);
  const [showAddCriterion, setShowAddCriterion] = useState(false);

  const results = useMemo(() => {
    return options
      .map((option) => {
        let totalWeighted = 0;
        let totalWeight = 0;
        criteria.forEach((criterion) => {
          const score = scores[option.id]?.[criterion.id] || 0;
          totalWeighted += score * criterion.weight;
          totalWeight += criterion.weight;
        });
        return {
          ...option,
          totalScore: totalWeight > 0 ? (totalWeighted / totalWeight) * 10 : 0,
          weightedScore: totalWeighted,
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [options, criteria, scores]);

  const handleScoreChange = useCallback((optionId, criterionId, value) => {
    const num = Math.min(10, Math.max(0, Number(value) || 0));
    setScores((prev) => ({
      ...prev,
      [optionId]: { ...prev[optionId], [criterionId]: num },
    }));
  }, []);

  const addOption = useCallback(() => {
    const name = newOptionName.trim() || `Option ${options.length + 1}`;
    const id = generateId();
    setOptions((prev) => [...prev, { id, name }]);
    setScores((prev) => {
      const scoresForNew = {};
      criteria.forEach((c) => {
        scoresForNew[c.id] = 5;
      });
      return { ...prev, [id]: scoresForNew };
    });
    setNewOptionName("");
    setShowAddOption(false);
  }, [newOptionName, options.length, criteria]);

  const removeOption = useCallback(
    (id) => {
      setOptions((prev) => prev.filter((o) => o.id !== id));
      setScores((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    []
  );

  const startEditOption = useCallback((option) => {
    setEditingOptionId(option.id);
    setEditingOptionName(option.name);
  }, []);

  const saveEditOption = useCallback(() => {
    if (!editingOptionId) return;
    const name = editingOptionName.trim() || "Option";
    setOptions((prev) =>
      prev.map((o) => (o.id === editingOptionId ? { ...o, name } : o))
    );
    setEditingOptionId(null);
    setEditingOptionName("");
  }, [editingOptionId, editingOptionName]);

  const addCriterion = useCallback(() => {
    const name = newCriterionName.trim() || `Criterion ${criteria.length + 1}`;
    const weight = Math.max(1, Math.min(100, newCriterionWeight || 10));
    const id = generateId();
    setCriteria((prev) => {
      const updated = [...prev, { id, name, weight }];
      return normalizeWeights(updated);
    });
    setScores((prev) => {
      const next = { ...prev };
      options.forEach((o) => {
        next[o.id] = { ...next[o.id], [id]: 5 };
      });
      return next;
    });
    setNewCriterionName("");
    setNewCriterionWeight(10);
    setShowAddCriterion(false);
  }, [newCriterionName, newCriterionWeight, criteria.length, options]);

  const removeCriterion = useCallback(
    (id) => {
      setCriteria((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        return normalizeWeights(filtered);
      });
      setScores((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((optId) => {
          const scoresForOpt = { ...next[optId] };
          delete scoresForOpt[id];
          next[optId] = scoresForOpt;
        });
        return next;
      });
    },
    []
  );

  const startEditCriterion = useCallback((criterion) => {
    setEditingCriterionId(criterion.id);
    setEditingCriterionName(criterion.name);
  }, []);

  const saveEditCriterion = useCallback(() => {
    if (!editingCriterionId) return;
    const name = editingCriterionName.trim() || "Criterion";
    setCriteria((prev) =>
      prev.map((c) => (c.id === editingCriterionId ? { ...c, name } : c))
    );
    setEditingCriterionId(null);
    setEditingCriterionName("");
  }, [editingCriterionId, editingCriterionName]);

  const handleWeightChange = useCallback((id, value) => {
    const newWeight = Math.max(0, Math.min(100, Number(value) || 0));
    setCriteria((prev) => {
      const otherCriteria = prev.filter((c) => c.id !== id);
      const otherTotal = otherCriteria.reduce((sum, c) => sum + c.weight, 0);
      const remaining = Math.max(0, 100 - newWeight);
      return prev.map((c) => {
        if (c.id === id) return { ...c, weight: newWeight };
        const proportion =
          otherTotal > 0 ? c.weight / otherTotal : 1 / otherCriteria.length;
        return { ...c, weight: Math.round(remaining * proportion) };
      });
    });
  }, []);

  const totalWeight = useMemo(
    () => criteria.reduce((sum, c) => sum + c.weight, 0),
    [criteria]
  );

  const buildTextReport = useCallback(() => {
    const lines = [
      "DECISION MATRIX RESULTS",
      "=".repeat(50),
      "",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      "Options & Scores:",
      "-".repeat(50),
    ];
    results.forEach((option, i) => {
      lines.push(
        `${i + 1}. ${option.name} — Total Score: ${option.totalScore.toFixed(2)}/10`
      );
      criteria.forEach((c) => {
        const score = scores[option.id]?.[c.id] || 0;
        lines.push(`   ${c.name}: ${score}/10 (weight: ${c.weight}%)`);
      });
      lines.push("");
    });
    lines.push("=".repeat(50));
    lines.push("Criteria Weights:");
    criteria.forEach((c) => {
      lines.push(`  ${c.name}: ${c.weight}%`);
    });
    lines.push("");
    lines.push(`Total weight sum: ${totalWeight}%`);
    return lines.join("\n");
  }, [results, criteria, scores, totalWeight]);

  const copyResults = useCallback(async () => {
    const success = await safeCopyText(buildTextReport());
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [buildTextReport]);

  const exportCsv = useCallback(() => {
    const header = ["Criterion / Option", ...options.map((o) => o.name)];
    const rows = criteria.map((c) => [
      `${c.name} (${c.weight}%)`,
      ...options.map((o) => scores[o.id]?.[c.id] || 0),
    ]);
    const totalRow = [
      "Total Score (/10)",
      ...results.map((r) => r.totalScore.toFixed(2)),
    ];
    const csvLines = [header, ...rows, totalRow].map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = csvLines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "decision-matrix.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [options, criteria, scores, results]);

  const reset = useCallback(() => {
    const freshOpts = [
      { id: generateId(), name: "Option A" },
      { id: generateId(), name: "Option B" },
      { id: generateId(), name: "Option C" },
    ];
    const freshCrits = [
      { id: generateId(), name: "Cost", weight: 30 },
      { id: generateId(), name: "Quality", weight: 25 },
      { id: generateId(), name: "Ease of Use", weight: 20 },
      { id: generateId(), name: "Support", weight: 25 },
    ];
    setOptions(freshOpts);
    setCriteria(freshCrits);
    setScores(buildDefaultScores(freshOpts, freshCrits));
    setCopied(false);
    setEditingOptionId(null);
    setEditingCriterionId(null);
    setShowAddOption(false);
    setShowAddCriterion(false);
    setNewOptionName("");
    setNewCriterionName("");
    setNewCriterionWeight(10);
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-600">
              <Grid3x3 className="h-3.5 w-3.5" />
              Decision Tool
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
              <Scale className="h-3.5 w-3.5 text-[var(--primary)]" />
              Weighted Evaluation
            </span>
          </div>
          <h1 className="heading mx-auto max-w-5xl text-center">
            Decision Matrix Builder
          </h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center">
            Evaluate and compare options objectively using weighted criteria.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-6">
            <SectionCard
              icon={ListChecks}
              title="Options"
              description="Add the choices you want to evaluate."
            >
              <div className="space-y-2">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                    {editingOptionId === option.id ? (
                      <input
                        type="text"
                        value={editingOptionName}
                        onChange={(e) => setEditingOptionName(e.target.value)}
                        onBlur={saveEditOption}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditOption();
                          if (e.key === "Escape") setEditingOptionId(null);
                        }}
                        className="min-w-0 flex-1 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-sm font-medium text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditOption(option)}
                        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                      >
                        {option.name}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeOption(option.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500"
                      aria-label={`Remove ${option.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {showAddOption ? (
                <div className="mt-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={newOptionName}
                    onChange={(e) => setNewOptionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addOption();
                      if (e.key === "Escape") {
                        setShowAddOption(false);
                        setNewOptionName("");
                      }
                    }}
                    placeholder="Option name"
                    className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={addOption}
                    className="btn-primary flex h-9 items-center gap-1.5 px-3 text-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddOption(false);
                      setNewOptionName("");
                    }}
                    className="btn-secondary flex h-9 items-center px-3 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddOption(true)}
                  className="btn-secondary mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Option
                </button>
              )}
            </SectionCard>

            <SectionCard
              icon={Scale}
              title="Criteria"
              description="Define what matters and set importance weights. Weights auto-normalize to 100%."
            >
              {totalWeight !== 100 && criteria.length > 0 && (
                <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Weights sum to {totalWeight}%. Adjust to reach 100%.
                </div>
              )}
              <div className="space-y-2">
                {criteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <GripVertical className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                    {editingCriterionId === criterion.id ? (
                      <input
                        type="text"
                        value={editingCriterionName}
                        onChange={(e) =>
                          setEditingCriterionName(e.target.value)
                        }
                        onBlur={saveEditCriterion}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditCriterion();
                          if (e.key === "Escape") setEditingCriterionId(null);
                        }}
                        className="min-w-0 flex-1 rounded border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-sm font-medium text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditCriterion(criterion)}
                        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)]"
                      >
                        {criterion.name}
                      </button>
                    )}
                    <div className="flex shrink-0 items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={criterion.weight}
                        onChange={(e) =>
                          handleWeightChange(criterion.id, e.target.value)
                        }
                        className="h-7 w-14 rounded border border-[var(--border)] bg-[var(--card)] px-1.5 text-center text-xs font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        aria-label={`Weight for ${criterion.name}`}
                      />
                      <span className="text-xs font-bold text-[var(--muted-foreground)]">
                        %
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:bg-red-500/10 hover:text-red-500"
                      aria-label={`Remove ${criterion.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {criteria.length === 0 && (
                  <p className="py-4 text-center text-sm text-[var(--muted-foreground)]">
                    No criteria defined. Add at least one criterion.
                  </p>
                )}
              </div>
              {showAddCriterion ? (
                <div className="mt-3 space-y-2">
                  <input
                    type="text"
                    value={newCriterionName}
                    onChange={(e) => setNewCriterionName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addCriterion();
                      if (e.key === "Escape") {
                        setShowAddCriterion(false);
                        setNewCriterionName("");
                      }
                    }}
                    placeholder="Criterion name"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newCriterionWeight}
                      onChange={(e) =>
                        setNewCriterionWeight(
                          Math.min(100, Math.max(1, Number(e.target.value) || 1))
                        )
                      }
                      placeholder="Weight"
                      className="w-20 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <span className="text-xs font-bold text-[var(--muted-foreground)]">
                      %
                    </span>
                    <button
                      type="button"
                      onClick={addCriterion}
                      className="btn-primary ml-auto flex h-9 items-center gap-1.5 px-3 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCriterion(false);
                        setNewCriterionName("");
                        setNewCriterionWeight(10);
                      }}
                      className="btn-secondary flex h-9 items-center px-3 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAddCriterion(true)}
                  className="btn-secondary mt-3 flex w-full items-center justify-center gap-2 py-2 text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add Criterion
                </button>
              )}
            </SectionCard>

            <SectionCard
              icon={Grid3x3}
              title="Scoring Matrix"
              description="Rate each option against each criterion (1–10)."
            >
              {options.length === 0 || criteria.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                  {options.length === 0 && criteria.length === 0
                    ? "Add options and criteria to start scoring."
                    : options.length === 0
                      ? "Add at least one option to score."
                      : "Add at least one criterion to score."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <div
                    className="grid min-w-[500px] gap-px rounded-lg border border-[var(--border)] bg-[var(--border)] text-sm"
                    style={{
                      gridTemplateColumns: `160px repeat(${options.length}, minmax(90px, 1fr))`,
                    }}
                  >
                    <div className="flex items-center bg-[var(--card)] px-3 py-2.5 text-xs font-bold uppercase text-[var(--muted-foreground)]">
                      Criterion
                    </div>
                    {options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center justify-center bg-[var(--card)] px-2 py-2.5 text-center text-xs font-bold text-[var(--foreground)]"
                      >
                        {option.name}
                      </div>
                    ))}
                    {criteria.map((criterion) => (
                      <div key={criterion.id} className="contents">
                        <div className="flex items-center gap-1.5 bg-[var(--card)] px-3 py-2.5 text-xs font-semibold text-[var(--foreground)]">
                          {criterion.name}
                          <span className="text-[10px] text-[var(--muted-foreground)]">
                            ({criterion.weight}%)
                          </span>
                        </div>
                        {options.map((option) => (
                          <div
                            key={`${option.id}-${criterion.id}`}
                            className="flex items-center justify-center bg-[var(--card)] px-1 py-1.5"
                          >
                            <input
                              type="number"
                              min={0}
                              max={10}
                              value={scores[option.id]?.[criterion.id] || 0}
                              onChange={(e) =>
                                handleScoreChange(
                                  option.id,
                                  criterion.id,
                                  e.target.value
                                )
                              }
                              className="h-8 w-full max-w-[60px] rounded border border-[var(--border)] bg-[var(--background)] text-center text-sm font-bold text-[var(--foreground)] outline-none focus:ring-2 focus:ring-[var(--primary)] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                              aria-label={`${option.name} — ${criterion.name} score`}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          </div>

          <div className="min-w-0 space-y-6">
            <SectionCard
              icon={TrendingUp}
              title="Rankings"
              description="Sorted by weighted score."
            >
              {results.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                  No data to rank.
                </p>
              ) : (
                <div className="space-y-4">
                  {results.map((option, index) => {
                    const rank = index + 1;
                    const maxScore = results[0]?.totalScore || 1;
                    const barWidth =
                      maxScore > 0
                        ? (option.totalScore / maxScore) * 100
                        : 0;
                    return (
                      <div key={option.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <RankBadge rank={rank} />
                            <span className="truncate text-sm font-semibold text-[var(--foreground)]">
                              {option.name}
                            </span>
                          </div>
                          <span className="shrink-0 text-sm font-bold tabular-nums text-[var(--foreground)]">
                            {option.totalScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${barWidth}%`,
                              background:
                                rank === 1
                                  ? "linear-gradient(90deg, #F59E0B, #FBBF24)"
                                  : rank === 2
                                    ? "linear-gradient(90deg, #94A3B8, #CBD5E1)"
                                    : "linear-gradient(90deg, #B45309, #D97706)",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard
              icon={BarChart3}
              title="Score Breakdown"
              description="Per-criterion scores for each option."
            >
              {results.length === 0 || criteria.length === 0 ? (
                <p className="py-8 text-center text-sm text-[var(--muted-foreground)]">
                  No data available.
                </p>
              ) : (
                <div className="space-y-4">
                  {results.map((option) => (
                    <div key={option.id} className="space-y-2">
                      <p className="text-xs font-bold text-[var(--foreground)]">
                        {option.name}
                      </p>
                      {criteria.map((criterion) => {
                        const score = scores[option.id]?.[criterion.id] || 0;
                        const pct = (score / 10) * 100;
                        return (
                          <div key={criterion.id} className="space-y-0.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[var(--muted-foreground)]">
                                {criterion.name}
                              </span>
                              <span className="font-semibold text-[var(--foreground)]">
                                {score}/10
                              </span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                              <div
                                className="h-full rounded-full bg-[var(--primary)] transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={copyResults}
                className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy Results"}
              </button>
              <button
                type="button"
                onClick={exportCsv}
                className="btn-secondary flex items-center justify-center gap-2 py-3 text-sm"
              >
                <Download className="h-4 w-4" />
                Download CSV
              </button>
              <button
                type="button"
                onClick={reset}
                className="btn-primary flex items-center justify-center gap-2 py-3 text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Reset All
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-sm leading-6 text-orange-700">
          Scores are on a 1–10 scale. Weighted scores are normalized:{" "}
          <code className="rounded bg-orange-500/20 px-1.5 py-0.5 font-mono text-xs">
            totalScore = &Sigma;(weight &times; score) / &Sigma;(weights) &times; 10
          </code>
        </div>
      </div>
    </main>
  );
}
