"use client";

import { Clock, Gauge, Target, TrendingUp } from "lucide-react";
import { useAuth } from "../providers/AuthProvider";
import ToolLogo from "./ToolLogo";

/** End-of-workflow recap: why the stack works, headline stats, daily cadence, and free alternatives. */
export default function ComboSummaryCard({ pack }) {
  const { requireAuth } = useAuth();
  const { summary } = pack;

  const openAlt = (item) => {
    requireAuth(() => window.open(item.url, "_blank", "noopener,noreferrer"));
  };

  const stats = [
    { icon: TrendingUp, label: "Productivity increase", value: summary.productivityIncrease },
    { icon: Clock, label: "Hours saved / week", value: summary.hoursSavedPerWeek },
    { icon: Gauge, label: "Difficulty level", value: pack.difficulty },
    { icon: Target, label: "Best for", value: summary.bestFor },
  ];

  return (
    <div className="fat-card mt-6 rounded-3xl p-6 sm:p-8">
      <h4 className="text-base font-bold text-slate-900">Why these tools work together</h4>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{summary.whyTheyWork}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="fat-tile rounded-2xl p-4"
            style={{ "--fat-tile-a": `${pack.hue[0]}1a`, "--fat-tile-b": `${pack.hue[1]}0f` }}
          >
            <Icon className="h-4 w-4" style={{ color: pack.hue[0] }} aria-hidden="true" />
            <p className="mt-2 text-sm font-bold text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Recommended daily workflow</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{summary.dailyWorkflow}</p>
      </div>

      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Alternative free tools</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {summary.alternatives.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => openAlt(item)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-violet-300 hover:text-violet-700"
            >
              <ToolLogo name={item.name} domain={item.domain} size={18} />
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
