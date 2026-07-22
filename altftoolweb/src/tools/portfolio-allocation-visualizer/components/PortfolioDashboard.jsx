import React from "react";
import {
  DollarSign,
  TrendingUp,
  Shield,
  Layers,
  Briefcase,
  TrendingDown
} from "lucide-react";

const PortfolioDashboard = ({ assets }) => {
  const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);
  const totalAssetsCount = assets.length;

  // 1. Expected Return % (Weighted Average)
  const weightedReturn = totalValue > 0
    ? assets.reduce((sum, a) => sum + ((parseFloat(a.amount) || 0) * (parseFloat(a.expectedReturn) || 0)), 0) / totalValue
    : 0;

  // 2. Risk Level Analysis
  // Assign numeric weights: Low = 1, Medium = 2, High = 3
  const riskScore = totalValue > 0
    ? assets.reduce((sum, a) => {
        const weight = a.riskLevel === "High" ? 3 : a.riskLevel === "Medium" ? 2 : 1;
        return sum + ((parseFloat(a.amount) || 0) * weight);
      }, 0) / totalValue
    : 0;

  let riskLabel = "Low";
  let riskColorClass = "text-(--muted-foreground) bg-gray-50 dark:bg-gray-950/20";
  let riskBarColor = "bg-gray-500";

  if (riskScore > 2.3) {
    riskLabel = "Aggressive";
    riskColorClass = "text-red-500 bg-red-50 dark:bg-red-950/20";
    riskBarColor = "bg-red-500";
  } else if (riskScore > 1.7) {
    riskLabel = "Moderate";
    riskColorClass = "text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20";
    riskBarColor = "bg-yellow-500";
  } else if (totalValue > 0) {
    riskLabel = "Conservative";
    riskColorClass = "text-(--muted-foreground) bg-gray-50 dark:bg-gray-950/20";
    riskBarColor = "bg-gray-500";
  } else {
    riskLabel = "N/A";
    riskColorClass = "text-(--muted-foreground) bg-(--muted)";
    riskBarColor = "bg-gray-400";
  }

  // 3. Diversification Score (HHI based + asset / category counts)
  let diversificationScore = 0;
  let divLabel = "Unhedged";
  let divColor = "text-red-500";

  if (totalValue > 0) {
    // Category distribution
    const categoryTotals = assets.reduce((acc, a) => {
      const category = a.category || "Custom Assets";
      acc[category] = (acc[category] || 0) + (parseFloat(a.amount) || 0);
      return acc;
    }, {});

    const hhi = Object.values(categoryTotals).reduce((sum, amt) => {
      const share = amt / totalValue;
      return sum + (share * share);
    }, 0);

    // HHI-based base score (perfectly diversified across infinite categories would have HHI approaching 0 -> score 100)
    // HHI = 1 means 100% in 1 category -> score = 0
    let baseScore = Math.round(100 * (1 - hhi));

    // Boost score slightly for unique asset count and unique category count to reward balanced spreads
    const uniqueCategories = Object.keys(categoryTotals).length;
    const categoryBonus = Math.min(uniqueCategories * 5, 20); // max +20 points
    const assetBonus = Math.min(totalAssetsCount * 2, 10); // max +10 points

    diversificationScore = Math.min(baseScore + categoryBonus + assetBonus, 100);

    if (diversificationScore > 75) {
      divLabel = "Excellent";
      divColor = "text-(--muted-foreground)";
    } else if (diversificationScore > 45) {
      divLabel = "Good";
      divColor = "text-yellow-500";
    } else {
      divLabel = "Poor";
      divColor = "text-red-500";
    }
  }

  // 4. Highest & Lowest Allocation
  let highestCategory = "None";
  let highestPercentage = 0;
  if (totalValue > 0) {
    const categoryTotals = assets.reduce((acc, a) => {
      const category = a.category || "Custom Assets";
      acc[category] = (acc[category] || 0) + (parseFloat(a.amount) || 0);
      return acc;
    }, {});

    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    if (sortedCats.length > 0) {
      highestCategory = sortedCats[0][0];
      highestPercentage = (sortedCats[0][1] / totalValue) * 100;
    }
  }

  const cards = [
    {
      label: "Total Portfolio",
      value: totalValue >= 1000000
        ? `$${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${totalAssetsCount} Active Asset${totalAssetsCount !== 1 ? "s" : ""}`,
      icon: <DollarSign size={20} />,
      iconBg: "bg-gray-100 dark:bg-gray-900/40",
      iconColor: "text-(--muted-foreground) dark:text-(--muted-foreground)",
      showProgress: false,
    },
    {
      label: "Expected Return",
      value: `${weightedReturn.toFixed(2)}%`,
      sub: "Avg annual yield",
      icon: <TrendingUp size={20} />,
      iconBg: "bg-gray-100 dark:bg-gray-900/40",
      iconColor: "text-(--muted-foreground) dark:text-(--muted-foreground)",
      progress: Math.min(Math.max(weightedReturn * 4, 0), 100), // Visual display mapping for expected return
      progressColor: "bg-gray-500",
      showProgress: totalValue > 0,
    },
    {
      label: "Risk Profile",
      value: riskLabel,
      sub: totalValue > 0 ? `Risk Factor: ${riskScore.toFixed(1)}` : "No assets added",
      icon: <Shield size={20} />,
      iconBg: riskColorClass,
      iconColor: riskScore > 2.3 ? "text-red-500" : riskScore > 1.7 ? "text-yellow-500" : "text-(--muted-foreground)",
      progress: totalValue > 0 ? (riskScore / 3) * 100 : 0,
      progressColor: riskBarColor,
      showProgress: totalValue > 0,
    },
    {
      label: "Diversification",
      value: totalValue > 0 ? `${diversificationScore}/100` : "0/100",
      sub: totalValue > 0 ? `Rating: ${divLabel}` : "Requires asset entries",
      icon: <Layers size={20} />,
      iconBg: "bg-gray-100 dark:bg-gray-900/40",
      iconColor: "text-(--muted-foreground) dark:text-(--muted-foreground)",
      progress: diversificationScore,
      progressColor: diversificationScore > 75 ? "bg-gray-500" : diversificationScore > 45 ? "bg-yellow-500" : "bg-red-500",
      showProgress: totalValue > 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-(--card) border border-(--border) rounded-2xl p-5 shadow-sm flex flex-col gap-4 overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-(--muted-foreground) leading-tight truncate" title={card.label}>
                {card.label}
              </p>
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${card.iconBg} ${card.iconColor}`}
              >
                {card.icon}
              </div>
            </div>

            <p className="text-2xl font-bold leading-none text-(--foreground) tracking-tight truncate" title={card.value}>
              {card.value}
            </p>

            {card.showProgress ? (
              <div className="space-y-1.5">
                <div className="w-full bg-(--muted) rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${card.progressColor}`}
                    style={{ width: `${card.progress}%` }}
                  />
                </div>
                <p className="text-xs text-(--muted-foreground) truncate" title={card.sub}>{card.sub}</p>
              </div>
            ) : (
              <p className="text-xs text-(--muted-foreground) truncate" title={card.sub}>{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Diversification Quick Stats (Only if assets exist) */}
      {totalValue > 0 && (
        <div className="bg-(--card) border border-(--border) rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-950/20 text-(--muted-foreground) dark:text-(--muted-foreground) flex items-center justify-center flex-shrink-0">
              <Briefcase size={16} />
            </div>
            <div>
              <p className="font-medium text-(--foreground)">
                Highest Allocated Asset Class:{" "}
                <span className="text-[var(--primary)] font-bold">{highestCategory}</span>
              </p>
              <p className="text-xs text-(--muted-foreground)">
                Represents <span className="font-medium text-(--foreground)">{highestPercentage.toFixed(1)}%</span> of your entire portfolio weight.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto bg-(--background) border border-(--border) px-3 py-1.5 rounded-xl">
            <span className="text-xs text-(--muted-foreground)">Status:</span>
            <span
              className={`text-xs font-bold ${
                diversificationScore > 75
                  ? "text-(--muted-foreground)"
                  : diversificationScore > 45
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {diversificationScore > 75
                ? "Highly Diversified"
                : diversificationScore > 45
                ? "Moderately Balanced"
                : "High Concentration Risk"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioDashboard;
