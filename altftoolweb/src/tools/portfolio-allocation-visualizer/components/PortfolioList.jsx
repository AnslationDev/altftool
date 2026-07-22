import React from "react";
import { Edit2, Trash2, Shield, Info, ArrowUpRight, TrendingUp } from "lucide-react";

const RISK_BADGES = {
  Low: "bg-gray-100 text-gray-700 dark:bg-gray-950/40 dark:text-(--muted-foreground)",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  High: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const CATEGORY_COLORS = {
  Stocks: "bg-gray-500",
  "Mutual Funds": "bg-gray-500",
  ETFs: "bg-gray-500",
  Gold: "bg-yellow-500",
  Crypto: "bg-gray-500",
  Bonds: "bg-gray-500",
  "Real Estate": "bg-amber-600",
  Cash: "bg-gray-500",
  "Custom Assets": "bg-slate-500",
};

const PortfolioList = ({
  assets,
  searchTerm,
  filterCategory,
  filterRisk,
  sortBy,
  onEdit,
  onDelete,
}) => {
  const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.amount) || 0), 0);

  const filteredAssets = assets
    .filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (a.notes && a.notes.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        filterCategory === "All" || a.category === filterCategory;
      const matchesRisk = filterRisk === "All" || a.riskLevel === matchesRisk || a.riskLevel === filterRisk;
      return matchesSearch && matchesCategory && matchesRisk;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "amount-desc":
          return b.amount - a.amount;
        case "amount-asc":
          return a.amount - b.amount;
        case "return-desc":
          return b.expectedReturn - a.expectedReturn;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "risk-desc": {
          const riskVal = { High: 3, Medium: 2, Low: 1 };
          return riskVal[b.riskLevel] - riskVal[a.riskLevel];
        }
        default:
          return 0;
      }
    });

  if (filteredAssets.length === 0) {
    return (
      <div className="py-12 text-center bg-(--card) border border-(--border) rounded-2xl p-6">
        <p className="text-(--muted-foreground) text-sm">
          No assets match your search, category filters, or risk filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop view: Beautiful brokerage-style table */}
      <div className="hidden lg:block overflow-x-auto bg-(--card) border border-(--border) rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-(--border) bg-gray-50/50 dark:bg-gray-800/10 text-xs font-semibold text-(--muted-foreground) uppercase tracking-wider">
              <th className="px-6 py-4">Asset Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-right">Amount Invested</th>
              <th className="px-6 py-4">Allocation %</th>
              <th className="px-6 py-4 text-right">Expected Return</th>
              <th className="px-6 py-4 text-center">Risk Level</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-(--border) text-sm">
            {filteredAssets.map((asset) => {
              const allocationPercentage = totalValue > 0 ? (asset.amount / totalValue) * 100 : 0;
              const catColor = CATEGORY_COLORS[asset.category] || "bg-gray-400";

              return (
                <tr
                  key={asset.id}
                  className="hover:bg-(--muted)/20 transition-colors"
                >
                  {/* Name + Notes */}
                  <td className="px-6 py-4 max-w-xs">
                    <div className="font-semibold text-(--foreground) break-words">
                      {asset.name}
                    </div>
                    {asset.notes && (
                      <div className="text-xs text-(--muted-foreground) truncate mt-0.5" title={asset.notes}>
                        {asset.notes}
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${catColor}`} />
                      <span className="text-(--foreground) font-medium">{asset.category}</span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4 text-right font-mono font-bold text-(--foreground)">
                    ${asset.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Allocation % with mini bar */}
                  <td className="px-6 py-4 min-w-[140px]">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-(--foreground)">
                        <span>{allocationPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-(--muted) rounded-full h-1">
                        <div
                          className={`h-1 rounded-full ${catColor}`}
                          style={{ width: `${allocationPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Expected Return */}
                  <td className="px-6 py-4 text-right text-(--foreground) font-mono">
                    <span className="flex items-center justify-end gap-0.5 text-(--muted-foreground) font-bold">
                      <ArrowUpRight size={14} />
                      {asset.expectedReturn.toFixed(1)}%
                    </span>
                  </td>

                  {/* Risk Badge */}
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        RISK_BADGES[asset.riskLevel] || RISK_BADGES["Medium"]
                      }`}
                    >
                      {asset.riskLevel}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEdit(asset)}
                        className="p-1.5 rounded-lg text-(--muted-foreground) hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-950/20 transition-all"
                        title="Edit Asset"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(asset.id)}
                        className="p-1.5 rounded-lg text-(--muted-foreground) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                        title="Delete Asset"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet view: Responsive Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {filteredAssets.map((asset) => {
          const allocationPercentage = totalValue > 0 ? (asset.amount / totalValue) * 100 : 0;
          const catColor = CATEGORY_COLORS[asset.category] || "bg-gray-400";

          return (
            <div
              key={asset.id}
              className="bg-(--card) border border-(--border) rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
            >
              {/* Header Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-(--foreground) leading-snug break-words">
                      {asset.name}
                    </h4>
                    <span className="inline-flex items-center gap-1.5 text-xs text-(--muted-foreground) mt-1">
                      <span className={`w-2 h-2 rounded-full ${catColor}`} />
                      {asset.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(asset)}
                      className="p-1.5 rounded-lg text-(--muted-foreground) hover:text-[var(--primary)] hover:bg-gray-50 dark:hover:bg-gray-950/20 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => onDelete(asset.id)}
                      className="p-1.5 rounded-lg text-(--muted-foreground) hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {asset.notes && (
                  <p className="text-xs text-(--muted-foreground) leading-relaxed line-clamp-2">
                    {asset.notes}
                  </p>
                )}
              </div>

              {/* Data Values Grid */}
              <div className="grid grid-cols-2 gap-3 bg-(--background) p-3 rounded-xl border border-(--border) text-xs">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-(--muted-foreground) mb-0.5">
                    Invested
                  </p>
                  <p className="font-mono font-bold text-(--foreground)">
                    ${asset.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-(--muted-foreground) mb-0.5">
                    Yield / Return
                  </p>
                  <p className="font-mono font-bold text-(--muted-foreground) flex items-center gap-0.5">
                    <TrendingUp size={12} />
                    {asset.expectedReturn.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-(--muted-foreground) mb-0.5">
                    Risk Level
                  </p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5 ${
                      RISK_BADGES[asset.riskLevel] || RISK_BADGES["Medium"]
                    }`}
                  >
                    {asset.riskLevel}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-(--muted-foreground) mb-0.5">
                    Share Weight
                  </p>
                  <p className="font-mono font-bold text-(--foreground)">
                    {allocationPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>

              {/* Share Weight Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-(--muted) rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-1.5 rounded-full ${catColor}`}
                    style={{ width: `${allocationPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioList;
