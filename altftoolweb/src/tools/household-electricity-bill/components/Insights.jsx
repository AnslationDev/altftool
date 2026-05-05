import { useMemo } from "react";
import {
  Lightbulb,
  ShieldCheck,
  Sparkles,
  TrendingDown,
} from "lucide-react";

import {
  estimateOneHourSaving,
  formatINR,
} from "../lib/calculateBill";

function findByName(appliances, term) {
  return appliances.find((appliance) =>
    appliance.name.toLowerCase().includes(term)
  );
}

export function Insights({
  appliances,
  summary,
  efficientSummary,
  starSavings,
  onStarSavingsToggle,
}) {
  const groupedBreakdown = useMemo(() => {
    const groups = {};
    summary.applianceBreakdown.forEach((item) => {
      if (!groups[item.name]) {
        groups[item.name] = {
          name: item.name,
          monthlyUnits: 0,
          sharePercent: 0,
        };
      }
      groups[item.name].monthlyUnits += item.monthlyUnits;
      groups[item.name].sharePercent += item.sharePercent;
    });
    return Object.values(groups).sort((a, b) => b.monthlyUnits - a.monthlyUnits);
  }, [summary.applianceBreakdown]);

  const biggest = groupedBreakdown[0];
  const monthlySavings = Math.max(0, summary.monthlyCost - efficientSummary.monthlyCost);

  const ac = findByName(appliances, "ac");
  const fan = findByName(appliances, "fan");
  const lights = findByName(appliances, "light");
  const geyser = findByName(appliances, "geyser");

  const tips = [
    ac
      ? `Reduce ${ac.name} by 1h/day to save ${formatINR(estimateOneHourSaving(ac, summary.effectiveCostPerUnit))} monthly.`
      : "Add AC usage to unlock cooling specific savings tips.",
    fan
      ? `Replace ${fan.name} with BLDC fan to save up to ${formatINR(estimateOneHourSaving(fan, summary.effectiveCostPerUnit) * 0.35)} monthly.`
      : "BLDC fans can cut electricity usage by nearly one-third.",
    lights
      ? `Use LED or 5-star alternatives for ${lights.name} to save ${formatINR(estimateOneHourSaving(lights, summary.effectiveCostPerUnit) * 0.35)} monthly.`
      : "LED lights use much less power than CFL bulbs.",
    geyser
      ? `Use ${geyser.name} 15m less daily to save nearly ${formatINR(estimateOneHourSaving(geyser, summary.effectiveCostPerUnit) * 0.25)} monthly.`
      : "Set geysers to moderate temperature and switch off after use.",
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
      {/* Consumer Insight Card */}
      <div className="p-6 rounded-2xl border border-(--border) bg-(--card) flex flex-col justify-between">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-(--primary) uppercase tracking-widest mb-1">
              <Sparkles size={16} />
              Consumer Insight
            </div>
            <h3 className="text-xl font-bold">Primary Load Analysis</h3>
          </div>

          <button
            type="button"
            onClick={() => onStarSavingsToggle(!starSavings)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              starSavings
                ? "bg-(--primary) text-white shadow-lg shadow-indigo-500/20"
                : "bg-(--background) text-(--secondary) border border-(--border) hover:border-(--primary)/50"
            }`}
          >
            <ShieldCheck size={14} />
            {starSavings ? "5-Star Optimization Active" : "Enable 5-Star Optimization"}
          </button>
        </div>

        {biggest ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-(--secondary) leading-relaxed">
                Your <span className="text-(--foreground) font-bold">{biggest.name}</span> is currently the heaviest load, accounting for <span className="text-(--primary) font-bold">{biggest.sharePercent.toFixed(0)}%</span> of your total energy consumption.
              </p>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-(--secondary)">
                  <span>Load Distribution</span>
                  <span>{biggest.sharePercent.toFixed(0)}% Impact</span>
                </div>
                <div className="h-2 rounded-full bg-(--background) overflow-hidden border border-(--border)">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000"
                    style={{ width: `${Math.min(100, biggest.sharePercent)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-(--border)">
              <div className="p-3 rounded-xl bg-(--background)/50 border border-(--border)">
                <p className="text-[10px] font-bold uppercase tracking-widest text-(--secondary) mb-1">Optimized</p>
                <p className="text-lg font-bold text-(--foreground)">{formatINR(efficientSummary.monthlyCost)}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Monthly Save</p>
                <p className="text-lg font-bold text-blue-400">{formatINR(monthlySavings)}</p>
              </div>
              <div className="p-3 rounded-xl bg-(--background)/50 border border-(--border)">
                <p className="text-[10px] font-bold uppercase tracking-widest text-(--secondary) mb-1">Yearly Save</p>
                <p className="text-lg font-bold text-(--foreground)">{formatINR(monthlySavings * 12)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8 border border-dashed border-(--border) rounded-xl bg-(--background)/30">
            <p className="text-sm text-(--secondary) italic">Add appliances to analyze consumption impact.</p>
          </div>
        )}
      </div>

      {/* Savings Playbook Card */}
      <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-400 uppercase tracking-widest mb-6">
          <Lightbulb size={16} />
          Savings Playbook
        </div>

        <div className="space-y-4">
          {tips.map((tip, idx) => (
            <div
              key={idx}
              className="group flex gap-4 p-3 rounded-xl bg-(--background)/50 border border-(--border) hover:border-blue-500/30 transition-all"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <TrendingDown size={16} />
              </div>
              <p className="text-xs text-(--secondary) leading-relaxed group-hover:text-(--foreground) transition-colors">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}