import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Gauge,
  IndianRupee,
  ReceiptText,
  Zap,
} from "lucide-react";

import {
  formatINR,
  formatUnits,
} from "../lib/calculateBill";

function AnimatedCounter({ value, formatter }) {
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);

  useEffect(() => {
    const start = displayValueRef.current;
    const change = value - start;
    const startedAt = performance.now();
    const duration = 650;
    let frame = 0;

    const tick = (time) => {
      const progress = Math.min(
        (time - startedAt) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      const nextValue = start + change * eased;
      displayValueRef.current = nextValue;
      setDisplayValue(nextValue);

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatter(displayValue)}</>;
}

export function SummaryPanel({
  summary,
  includeTaxes,
  taxPercent,
  onTaxToggle,
  onTaxPercentChange,
}) {
  const metrics = [
    {
      label: "Daily Units",
      value: summary.dailyUnits,
      formatter: formatUnits,
      icon: Zap,
      color: "blue",
    },
    {
      label: "Monthly Units",
      value: summary.monthlyUnits,
      formatter: formatUnits,
      icon: Gauge,
      color: "indigo",
    },
    {
      label: "Monthly Cost",
      value: summary.monthlyCost,
      formatter: formatINR,
      icon: ReceiptText,
      color: "blue",
    },
    {
      label: "Yearly Cost",
      value: summary.yearlyCost,
      formatter: formatINR,
      icon: CalendarDays,
      color: "amber",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-6 rounded-2xl border border-(--border) bg-(--background)/50">
        {/* Left: Inputs Stack */}
        <div className="flex flex-col gap-4 min-w-[240px]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-(--secondary) uppercase tracking-wider w-16">Tax (%):</span>
            <input
              type="text"
              inputMode="decimal"
              placeholder="Enter %"
              value={taxPercent}
              onChange={(event) => {
                const val = event.target.value;
                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                  onTaxPercentChange(val);
                }
              }}
              className="flex-1 rounded-xl border border-(--border) bg-(--card) px-3 py-2.5 text-sm outline-none focus:border-(--primary) transition"
            />
          </div>
        </div>

        {/* Center: Toggle */}
        <div className="flex items-center gap-4 border-x border-(--border) px-8 h-12">
          <button
            type="button"
            onClick={() => onTaxToggle(!includeTaxes)}
            className="flex items-center gap-3 group"
          >
            <div className={`flex h-6 w-11 items-center rounded-full p-1 transition ${includeTaxes ? "bg-(--primary)" : "bg-slate-700"}`}>
              <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition ${includeTaxes ? "translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm font-semibold text-(--secondary) group-hover:text-(--foreground) transition">Include Taxes</span>
          </button>
        </div>

        {/* Right: Summary Info */}
        <div className="flex flex-col justify-center gap-2 text-sm min-w-[150px]">
          <div className="flex items-center justify-between gap-4">
            <span className="text-(--secondary) font-medium">Energy cost:</span>
            <span className="font-bold text-(--foreground)">{formatINR(summary.energyCharge)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-(--secondary) font-medium">Tax:</span>
            <span className="font-bold text-blue-400">{formatINR(summary.taxAmount)}</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="group p-5 rounded-2xl border border-(--border) bg-(--card) hover:border-(--primary)/50 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-(--secondary)">{metric.label}</span>
                <div className="p-2 rounded-xl bg-(--background) text-(--primary) group-hover:bg-(--primary) group-hover:text-white transition-colors">
                  <Icon size={18} />
                </div>
              </div>
              <div className="text-2xl font-bold tracking-tight tabular-nums">
                <AnimatedCounter
                  value={metric.value}
                  formatter={metric.formatter}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
