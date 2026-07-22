import React from "react";
import { motion } from "framer-motion";
import { calculateApplianceMetrics, formatCurrency } from "../utils/calculations";

export default function ApplianceAnalytics({ appliances, rate, totalMonthlyCost }) {
  if (appliances.length === 0) return null;

  const analyticsData = appliances.map(app => {
    const metrics = calculateApplianceMetrics(app, rate);
    const percentage = totalMonthlyCost > 0 ? (metrics.monthlyCost / totalMonthlyCost) * 100 : 0;
    return {
      name: app.name,
      cost: metrics.monthlyCost,
      percentage
    };
  }).sort((a, b) => b.cost - a.cost);

  return (
    <div className="p-6 rounded-3xl bg-(--card) border border-(--border) shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-(--foreground)">Consumption Analytics</h2>
        <span className="text-xs font-bold text-(--muted-foreground) uppercase tracking-widest">Share of Total Bill</span>
      </div>

      <div className="space-y-6">
        {analyticsData.map((data, index) => (
          <div key={data.name} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-bold text-(--foreground)">{data.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-(--muted-foreground)">{formatCurrency(data.cost)}</span>
                <span className="font-black text-(--primary)">{data.percentage.toFixed(1)}%</span>
              </div>
            </div>

            <div className="h-3 w-full bg-(--background) rounded-full overflow-hidden border border-(--border)">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${data.percentage}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  index === 0 ? "from-blue-500 to-indigo-500" : "from-blue-400 to-blue-600"
                }`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-2xl bg-(--background) border border-(--border) border-dashed">
        <p className="text-xs text-(--muted-foreground) leading-relaxed">
          <span className="font-bold text-(--foreground)">Note:</span> The percentages are calculated based on the total monthly cost of all appliances listed above. Adjust usage hours to see how individual items impact your overall bill.
        </p>
      </div>
    </div>
  );
}
