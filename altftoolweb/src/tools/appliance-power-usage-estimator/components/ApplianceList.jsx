import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Edit3, Power, Clock, Hash } from "lucide-react";
import { calculateApplianceMetrics, formatCurrency, formatUnits } from "../utils/calculations";

export default function ApplianceList({ appliances, rate, onRemove }) {
  if (appliances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-3xl bg-(--card) border border-(--border) border-dashed opacity-60 text-center">
        <div className="w-16 h-16 rounded-full bg-(--muted) flex items-center justify-center mb-4">
          <Power className="w-8 h-8 text-(--muted-foreground)" />
        </div>
        <h3 className="text-lg font-bold text-(--foreground)">No Appliances Added</h3>
        <p className="text-sm text-(--muted-foreground)">Start by adding an appliance to see the breakdown.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-black text-(--foreground)">Your Appliances</h2>
        <span className="px-3 py-1 rounded-full bg-(--primary)/10 text-(--primary) text-xs font-black">
          {appliances.length} Items
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {appliances.map((app) => {
            const metrics = calculateApplianceMetrics(app, rate);
            return (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group p-5 rounded-3xl bg-(--card) border border-(--border) hover:border-(--primary)/20 transition-all shadow-sm hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-(--background) flex items-center justify-center text-(--primary) shadow-inner">
                      <Power className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-(--foreground) leading-tight">
                        {app.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-xs font-medium text-(--muted-foreground)">
                          <Hash className="w-3 h-3" />
                          {app.quantity} Unit(s)
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-(--muted-foreground)">
                          <Clock className="w-3 h-3" />
                          {app.hoursPerDay}h/Day
                        </span>
                        <span className="px-2 py-0.5 rounded-lg bg-(--background) text-(--primary) text-[10px] font-black uppercase tracking-wider border border-(--border)">
                          {app.wattage} Watts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onRemove(app.id)}
                      className="p-2.5 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-(--border) border-dashed">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) mb-1">
                      Monthly Units
                    </p>
                    <p className="font-bold text-(--foreground)">
                      {formatUnits(metrics.monthlyUnits)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-(--muted-foreground) mb-1">
                      Monthly Cost
                    </p>
                    <p className="font-black text-(--primary) text-lg">
                      {formatCurrency(metrics.monthlyCost)}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
