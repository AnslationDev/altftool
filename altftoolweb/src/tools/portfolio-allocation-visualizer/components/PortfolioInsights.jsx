import React from "react";
import { AlertCircle, CheckCircle, Lightbulb, TrendingUp, Info } from "lucide-react";

const PortfolioInsights = ({ assets }) => {
  const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

  if (totalValue === 0) {
    return (
      <div className="bg-(--card) border border-(--border) p-6 rounded-2xl text-center space-y-2">
        <Lightbulb size={24} className="text-(--muted-foreground) mx-auto" />
        <h4 className="font-bold text-(--foreground)">Portfolio Insights</h4>
        <p className="text-xs text-(--muted-foreground) max-w-sm mx-auto">
          Add assets to your portfolio to generate instant personalized financial diversification recommendations.
        </p>
      </div>
    );
  }

  // Gather stats
  const categoryTotals = assets.reduce((acc, a) => {
    const category = a.category || "Custom Assets";
    acc[category] = (acc[category] || 0) + (parseFloat(a.amount) || 0);
    return acc;
  }, {});

  const riskTotals = assets.reduce((acc, a) => {
    const risk = a.riskLevel || "Medium";
    acc[risk] = (acc[risk] || 0) + (parseFloat(a.amount) || 0);
    return acc;
  }, { Low: 0, Medium: 0, High: 0 });

  const sortedCats = Object.entries(categoryTotals)
    .map(([name, val]) => ({ name, val, pct: (val / totalValue) * 100 }))
    .sort((a, b) => b.val - a.val);

  const highRiskPct = (riskTotals.High / totalValue) * 100;
  const lowRiskPct = (riskTotals.Low / totalValue) * 100;
  const goldPct = ((categoryTotals["Gold"] || 0) / totalValue) * 100;
  const cashPct = ((categoryTotals["Cash"] || 0) / totalValue) * 100;

  const insights = [];

  // Concentration Check
  if (sortedCats.length > 0 && sortedCats[0].pct > 45) {
    insights.push({
      type: "warning",
      title: `High Concentration in ${sortedCats[0].name}`,
      desc: `Your allocation of ${sortedCats[0].pct.toFixed(0)}% in ${sortedCats[0].name} exceeds standard recommended caps. If this asset class experiences a correction, your entire portfolio will be highly vulnerable. Consider rebalancing into other sectors.`,
    });
  }

  // Risk Check
  if (highRiskPct > 60) {
    insights.push({
      type: "warning",
      title: "Aggressive Risk Exposure",
      desc: `High-risk assets constitute ${highRiskPct.toFixed(0)}% of your portfolio. While this offers excellent upside, the potential for steep short-term drawdown is elevated. Verify that this matches your financial timeline and risk tolerance.`,
    });
  } else if (lowRiskPct > 75) {
    insights.push({
      type: "info",
      title: "Highly Defensive Stance",
      desc: `${lowRiskPct.toFixed(0)}% of your portfolio is in Low-risk assets. This provides outstanding capital protection, but inflation could erode purchasing power over long horizons. Consider a small growth allocation like ETFs.`,
    });
  }

  // Gold Check
  if (goldPct < 5 && sortedCats.length > 2) {
    insights.push({
      type: "suggestion",
      title: "Consider Hedging with Precious Metals",
      desc: `Precious metals like Gold represent only ${goldPct.toFixed(1)}% of your portfolio. Standard allocation theories suggest 5-10% in Gold or real assets to act as a hedge during equity and token market down-cycles.`,
    });
  }

  // Cash Cushion Check
  if (cashPct < 5) {
    insights.push({
      type: "suggestion",
      title: "Lower Liquidity / Cash Cushion",
      desc: `Your liquidity cash reserves are at ${cashPct.toFixed(1)}%. Keeping 5-10% of your portfolio in cash allows you to capitalize on sudden market discounts ('buying the dip') without liquidating active holdings.`,
    });
  }

  // Healthy Allocation Check
  const isHealthy = sortedCats.every(c => c.pct <= 35) && sortedCats.length >= 3;
  if (isHealthy) {
    insights.push({
      type: "success",
      title: "Portfolio appears beautifully balanced!",
      desc: "Your assets are spread elegantly across multiple classes with no single sector overloading your exposure (all below 35%). This lowers overall correlation risk and promotes steady compounding.",
    });
  }

  // Unique Asset Count Insight (Too few/many)
  if (assets.length < 3) {
    insights.push({
      type: "info",
      title: "Expand Holding Diversity",
      desc: "You have very few active assets. To build a robust financial foundation, consider adding highly-liquid indexes, mutual funds, or bonds to offset individual asset volatility.",
    });
  } else if (assets.length > 12) {
    insights.push({
      type: "info",
      title: "Potential 'Diworseification'",
      desc: "Having more than 12 assets can make tracking, tax reporting, and rebalancing highly complex. Sometimes, consolidating minor holdings into index ETFs simplifies portfolio management and enhances focus.",
    });
  }

  return (
    <div className="bg-(--card) border border-(--border) rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-(--foreground) flex items-center gap-2">
          <Lightbulb className="text-[var(--primary)]" size={20} />
          Smart Allocation Analytics & Insights
        </h3>
        <p className="text-xs text-(--muted-foreground) mt-0.5">
          Intelligent real-time alerts based on diversification, modern portfolio theory, and category risk thresholds
        </p>
      </div>

      <div className="space-y-3 pt-2">
        {insights.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl text-sm transition-all">
            <CheckCircle size={16} className="text-(--muted-foreground) flex-shrink-0" />
            <span className="text-(--foreground) font-medium">Your portfolio is solid and meets all key diversification heuristics.</span>
          </div>
        ) : (
          insights.map((ins, index) => {
            let containerStyle = "bg-gray-500/10 border-gray-500/20";
            let icon = <Info size={16} className="text-(--muted-foreground) flex-shrink-0 mt-0.5" />;

            if (ins.type === "warning") {
              containerStyle = "bg-red-500/10 border-red-500/20";
              icon = <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />;
            } else if (ins.type === "success") {
              containerStyle = "bg-gray-500/10 border-gray-500/20";
              icon = <CheckCircle size={16} className="text-(--muted-foreground) flex-shrink-0 mt-0.5" />;
            } else if (ins.type === "suggestion") {
              containerStyle = "bg-amber-500/10 border-amber-500/20";
              icon = <Lightbulb size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />;
            }

            return (
              <div
                key={index}
                className={`flex gap-3 p-4 border rounded-xl text-xs leading-relaxed transition-all ${containerStyle}`}
              >
                {icon}
                <div className="space-y-0.5">
                  <h4 className="font-bold text-(--foreground) text-sm">{ins.title}</h4>
                  <p className="text-(--muted-foreground) text-xs leading-relaxed">{ins.desc}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PortfolioInsights;
