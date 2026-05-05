import { Minus, Plus, Trash2, Zap } from "lucide-react";
import { roomCategories } from "../data/applianceDefaults";

const numberOrZero = (value) => Math.max(0, Number(value) || 0);

export function ApplianceCard({ appliance, onUpdate, onRemove }) {
  const monthlyUnits =
    (appliance.wattage *
      appliance.quantity *
      appliance.hoursPerDay *
      30) /
    1000;

  return (
    <article className="group rounded-2xl border border-(--border) bg-(--card) p-5 hover:border-(--primary)/40 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-(--background) text-(--primary) group-hover:bg-(--primary) group-hover:text-white transition-all duration-300">
          <Zap size={22} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <input
                value={appliance.name}
                onChange={(event) =>
                  onUpdate(appliance.id, {
                    name: event.target.value,
                  })
                }
                className="w-full bg-transparent text-lg font-bold text-(--foreground) outline-none focus:text-(--primary) transition-colors"
                aria-label="Appliance name"
              />
              <p className="text-xs font-medium text-(--secondary) tracking-wide uppercase mt-0.5">
                {monthlyUnits.toFixed(1)} kWh / month
              </p>
            </div>

            <button
              type="button"
              onClick={() => onRemove(appliance.id)}
              className="rounded-lg p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all"
              aria-label={`Remove ${appliance.name}`}
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="grid gap-4 grid-cols-2">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest text-(--secondary)">Wattage</span>
              <input
                type="number"
                value={appliance.wattage}
                onChange={(event) =>
                  onUpdate(appliance.id, {
                    wattage: numberOrZero(event.target.value),
                  })
                }
                className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--foreground) outline-none focus:border-(--primary) transition"
              />
            </div>

            {appliance.subType && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-(--secondary)">Model / Type</span>
                <div className="text-sm font-semibold text-(--foreground) bg-(--background) rounded-xl border border-(--border) px-3 py-2">
                  {appliance.subType}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-(--secondary)">Usage</span>
                <span className="text-xs font-bold text-(--foreground)">{appliance.hoursPerDay}h/d</span>
              </div>
              <input
                type="range"
                min={0}
                max={24}
                step={0.5}
                value={appliance.hoursPerDay}
                onChange={(event) =>
                  onUpdate(appliance.id, {
                    hoursPerDay: Number(event.target.value),
                  })
                }
                className="w-full h-1.5 bg-(--background) rounded-lg appearance-none cursor-pointer accent-(--primary)"
              />
            </div>

            <div className="flex items-center gap-2 bg-(--background) rounded-xl p-1 border border-(--border)">
              <button
                type="button"
                onClick={() =>
                  onUpdate(appliance.id, {
                    quantity: Math.max(1, appliance.quantity - 1),
                  })
                }
                className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-(--card) text-(--secondary) hover:text-(--foreground) transition"
              >
                <Minus size={14} />
              </button>
              <span className="w-6 text-center text-sm font-bold">{appliance.quantity}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdate(appliance.id, {
                    quantity: appliance.quantity + 1,
                  })
                }
                className="h-8 w-8 flex items-center justify-center rounded-lg bg-(--primary) text-white shadow-lg shadow-indigo-500/20"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}