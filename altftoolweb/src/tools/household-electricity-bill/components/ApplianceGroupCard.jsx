import { Minus, Plus, Trash2, Zap, MoreVertical, Layers } from "lucide-react";
import { formatINR, formatUnits } from "../lib/calculateBill";

export function ApplianceGroupCard({ group, onRemoveItem, onRemoveGroup }) {
  return (
    <article className="group rounded-3xl border border-(--border) bg-(--card) overflow-hidden hover:border-(--primary)/40 transition-all duration-300 shadow-sm hover:shadow-xl">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-(--background) to-transparent border-b border-(--border)">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20 group-hover:scale-110 transition-transform duration-300">
              <Zap size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-(--foreground) capitalize tracking-tight">
                {group.name}
              </h3>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                <p className="text-[10px] font-bold text-(--secondary) uppercase tracking-widest">
                  {group.items.length} {group.items.length === 1 ? "Variant" : "Variants"}
                </p>
                <p className="text-[10px] font-bold text-(--secondary) uppercase tracking-widest">
                  {group.totalWattage}W Total
                </p>
                <p className="text-[10px] font-bold text-(--secondary) uppercase tracking-widest">
                  {group.totalDailyUnits.toFixed(1)} kWh/day
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right mr-2">
              <p className="text-[10px] font-bold text-(--secondary) uppercase mb-0.5">Monthly Cost</p>
              <p className="text-lg font-black text-blue-400 tabular-nums">
                {formatINR(group.totalCost)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onRemoveGroup(group.name)}
              className="rounded-xl p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
              aria-label={`Remove all ${group.name}`}
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Variants List */}
      <div className="p-2 bg-(--background)/30">
        <div className="space-y-1">
          {group.items.map((item) => (
            <div 
              key={item.id} 
              className="relative bg-(--card) rounded-2xl p-4 border border-(--border)/50 flex items-center justify-between group/item hover:bg-(--background) transition-colors"
            >
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 flex-1">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-(--secondary)">Variant</span>
                  <p className="text-sm font-bold text-(--foreground) truncate" title={item.subType || "Standard"}>
                    {item.subType || "Standard"}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-(--secondary)">Wattage</span>
                  <p className="text-sm font-bold text-(--foreground)">{item.wattage}W</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-(--secondary)">Usage</span>
                  <p className="text-sm font-bold text-(--foreground)">{item.hoursPerDay}h/d</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-(--secondary)">Qty</span>
                  <p className="text-sm font-bold text-(--foreground)">x{item.quantity}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-(--secondary)">Units</span>
                  <p className="text-sm font-bold text-(--foreground)">{item.monthlyUnits.toFixed(1)} kWh</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 pl-4 border-l border-(--border)/50 ml-4">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-bold text-blue-400/80 uppercase mb-0.5">Cost</p>
                  <p className="text-sm font-bold tabular-nums">{formatINR(item.monthlyCost)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover/item:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer / Total Info */}
      <div className="px-5 py-3 bg-(--card) border-t border-(--border)/50 flex items-center justify-between">
         <div className="flex items-center gap-2 text-(--secondary)">
           <Layers size={14} />
           <span className="text-xs font-semibold">Group Monthly Total:</span>
           <span className="text-xs font-bold text-(--foreground)">{formatUnits(group.totalUnits)}</span>
         </div>
      </div>
    </article>
  );
}
