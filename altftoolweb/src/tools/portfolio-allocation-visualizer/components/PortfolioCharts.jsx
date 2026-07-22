import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from "recharts";

// Modern harmonious color palette tailored for finance dashboard
const COLORS = [
  "#2563EB", // Blue (Stocks)
  "#8B5CF6", // Purple (Crypto)
  "#10B981", // Emerald (Cash)
  "#F59E0B", // Amber (Gold)
  "#EC4899", // Pink (Mutual Funds)
  "#06B6D4", // Cyan (ETFs)
  "#F97316", // Orange (Real Estate)
  "#14B8A6", // Teal (Bonds)
  "#64748B", // Slate (Custom)
];

const RISK_COLORS = {
  Low: "#10B981",    // Emerald
  Medium: "#F59E0B", // Amber
  High: "#EF4444",   // Red
};

const CustomTooltip = ({ active, payload, isCurrency = true }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#18181b] border border-gray-800 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 font-sans">
        <p className="font-semibold text-gray-200">{data.name}</p>
        <div className="flex items-center gap-3">
          <span className="text-(--muted-foreground)">Value:</span>
          <span className="font-mono font-bold text-gray-100">
            {isCurrency
              ? `$${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : data.value}
          </span>
        </div>
        {data.percentage !== undefined && (
          <div className="flex items-center gap-3">
            <span className="text-(--muted-foreground)">Weight:</span>
            <span className="font-mono font-bold text-[var(--primary)]">
              {data.percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const PortfolioCharts = ({ assets, view }) => {
  const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

  // 1. Process Category Data
  const categoryTotals = assets.reduce((acc, a) => {
    const category = a.category || "Custom Assets";
    acc[category] = (acc[category] || 0) + (parseFloat(a.amount) || 0);
    return acc;
  }, {});

  const categoryData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);

  // 2. Process Risk Distribution Data
  const riskTotals = assets.reduce((acc, a) => {
    const risk = a.riskLevel || "Medium";
    acc[risk] = (acc[risk] || 0) + (parseFloat(a.amount) || 0);
    return acc;
  }, { Low: 0, Medium: 0, High: 0 });

  const riskData = Object.entries(riskTotals)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
    }))
    .filter(item => item.value > 0);

  const showPies = !view || view === "pies";
  const showBreakdown = !view || view === "breakdown";

  return (
    <div className="space-y-6">
      {showPies && (
        <div className="grid grid-cols-1 gap-6">
          {/* Category Allocation Donut Chart */}
          <div className="bg-(--card) border border-(--border) p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-(--foreground)">Category Allocation</h3>
              <p className="text-xs text-(--muted-foreground) mt-0.5">Diversification weight by asset category</p>
            </div>
            <div className="h-[210px] w-full mt-4 flex items-center justify-center">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="80%"
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-(--muted-foreground) text-sm">No investment assets to chart</p>
              )}
            </div>
            {/* Custom HTML legend list */}
            {categoryData.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs border-t border-(--border) pt-4">
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-(--foreground)">{entry.name}</span>
                    <span className="text-(--muted-foreground) font-mono">({entry.percentage.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risk Distribution Pie Chart */}
          <div className="bg-(--card) border border-(--border) p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold text-(--foreground)">Risk Distribution</h3>
              <p className="text-xs text-(--muted-foreground) mt-0.5">Asset allocation by risk exposure tier</p>
            </div>
            <div className="h-[210px] w-full mt-4 flex items-center justify-center">
              {riskData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius="80%"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={RISK_COLORS[entry.name] || "#CBD5E1"} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-(--muted-foreground) text-sm">No investment assets to chart</p>
              )}
            </div>
            {/* Custom HTML legend list for Risk */}
            {riskData.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs border-t border-(--border) pt-4">
                {riskData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 font-medium whitespace-nowrap">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: RISK_COLORS[entry.name] }}
                    />
                    <span className="text-(--foreground)">{entry.name} Risk</span>
                    <span className="text-(--muted-foreground) font-mono">({entry.percentage.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category Wise Bar Graph */}
      {showBreakdown && categoryData.length > 0 && (
        <div className="bg-(--card) p-6 rounded-2xl shadow-sm border border-(--border)">
          <div>
            <h3 className="text-lg font-semibold text-(--foreground)">Asset Category Value Comparison</h3>
            <p className="text-xs text-(--muted-foreground) mt-0.5">Comparing absolute holdings in USD across categories</p>
          </div>
          <div className="h-[280px] w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.15} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.05)", radius: 6 }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Diversification Progress Breakdown Cards */}
      {showBreakdown && categoryData.length > 0 && (
        <div className="bg-(--card) border border-(--border) rounded-2xl p-6">
          <h3 className="text-base font-bold text-(--foreground) mb-4">Diversification Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryData.map((cat, index) => {
              const barColor = COLORS[index % COLORS.length];
              return (
                <div
                  key={cat.name}
                  className="flex flex-col gap-2.5 p-4 bg-(--background) rounded-xl border border-(--border) hover:border-[var(--primary)]/30 transition-all duration-300"
                >
                  {/* Row 1: Category Name + Color Dot */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <span className="text-xs font-semibold text-(--muted-foreground) flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: barColor }} />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="text-xs font-bold text-[var(--primary)] font-mono flex-shrink-0">
                      {cat.percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Row 2: Big Premium Dollar Amount */}
                  <div className="text-lg font-bold text-(--foreground) font-mono leading-none tracking-tight">
                    ${cat.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>

                  {/* Row 3: Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full bg-(--muted) rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${cat.percentage}%`, backgroundColor: barColor }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[9px] text-(--muted-foreground)">
                      <span>Portfolio Weight</span>
                      <span className="font-bold">{cat.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCharts;
