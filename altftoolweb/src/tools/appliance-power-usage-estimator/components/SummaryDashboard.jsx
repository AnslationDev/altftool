import React from "react";
import { motion } from "framer-motion";
import { Zap, Calendar, CreditCard, TrendingUp } from "lucide-react";
import { formatCurrency, formatUnits } from "../utils/calculations";

export default function SummaryDashboard({ totals }) {
  const cards = [
    {
      title: "Daily Consumption",
      value: formatUnits(totals.totalDailyUnits),
      icon: Zap,
      color: "blue",
      desc: "Estimated units per day"
    },
    {
      title: "Monthly Units",
      value: formatUnits(totals.totalMonthlyUnits),
      icon: Calendar,
      color: "indigo",
      desc: "Estimated units per month"
    },
    {
      title: "Monthly Bill",
      value: formatCurrency(totals.totalMonthlyCost),
      icon: CreditCard,
      color: "emerald",
      desc: "Based on your electricity rate"
    },
    {
      title: "Top Consumer",
      value: totals.highestConsumingAppliance,
      icon: TrendingUp,
      color: "amber",
      desc: `Consumes ${formatCurrency(totals.highestConsumingValue)}/mo`
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="relative group overflow-hidden p-3 rounded-2xl bg-(--card) border border-(--border) hover:border-(--primary)/30 transition-all duration-300 shadow-sm"
        >
          {/* Background Glow */}
          <div className={`absolute -right-8 -top-8 w-20 h-20 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity bg-${card.color}-500`} />

          <div className="flex items-center gap-3 relative z-10">
            <div className={`w-8 h-8 shrink-0 rounded-xl flex items-center justify-center bg-${card.color}-500/10 text-${card.color}-500`}>
              <card.icon className="w-4 h-4" />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-black text-(--muted-foreground) uppercase tracking-widest leading-none mb-1">
                {card.title}
              </p>
              <h3 className="text-base font-black text-(--foreground) truncate leading-tight">
                {card.value}
              </h3>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
