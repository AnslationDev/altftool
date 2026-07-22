import React from "react";
import { motion } from "framer-motion";
import { Lightbulb, AlertTriangle, TrendingDown, Sparkles } from "lucide-react";
import { calculateApplianceMetrics, formatCurrency } from "../utils/calculations";

export default function SmartInsights({ appliances, rate }) {
  if (appliances.length === 0) return null;

  const generateInsights = () => {
    const insights = [];
    const sorted = [...appliances].map(app => ({
      ...app,
      metrics: calculateApplianceMetrics(app, rate)
    })).sort((a, b) => b.metrics.monthlyCost - a.metrics.monthlyCost);

    const highest = sorted[0];

    // Insight 1: Highest consumer
    insights.push({
      title: "Highest Consumption Alert",
      text: `Your ${highest.name} is the biggest contributor to your bill, costing ${formatCurrency(highest.metrics.monthlyCost)} per month.`,
      icon: AlertTriangle,
      color: "amber"
    });

    // Insight 2: Potential savings
    const reductionCost = (highest.metrics.monthlyCost / highest.hoursPerDay) * 1;
    if (highest.hoursPerDay > 1) {
      insights.push({
        title: "Potential Savings",
        text: `Reducing ${highest.name} usage by just 1 hour daily could save you approximately ${formatCurrency(reductionCost)} monthly.`,
        icon: TrendingDown,
        color: "emerald"
      });
    }

    // Insight 3: LED Tip
    const bulbs = appliances.filter(a => a.name.toLowerCase().includes("bulb") || a.name.toLowerCase().includes("light"));
    if (bulbs.length > 0) {
      insights.push({
        title: "Energy Efficiency Tip",
        text: "Switching to high-efficiency LED bulbs (8-12W) can reduce lighting costs by up to 80% compared to traditional bulbs.",
        icon: Lightbulb,
        color: "blue"
      });
    }

    // Insight 4: General tip
    insights.push({
      title: "Smart Monitoring",
      text: "Unplugging appliances when not in use can prevent 'vampire power' draw, which can add up to 10% to your annual bill.",
      icon: Sparkles,
      color: "indigo"
    });

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="grid grid-cols-1 gap-4">
      {insights.map((insight, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`p-6 rounded-3xl border border-(--border) bg-(--card) flex gap-4 hover:shadow-md transition-shadow`}
        >
          <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center bg-${insight.color}-500/10 text-${insight.color}-500`}>
            <insight.icon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-(--foreground) mb-1">{insight.title}</h4>
            <p className="text-sm text-(--muted-foreground) leading-relaxed">
              {insight.text}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
