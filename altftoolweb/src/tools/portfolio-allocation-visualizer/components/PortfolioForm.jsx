import React, { useState, useEffect } from "react";
import { X, Save, TrendingUp, DollarSign, Tag, Info, AlertTriangle, ShieldAlert } from "lucide-react";

export const CATEGORIES = [
  "Stocks",
  "Mutual Funds",
  "ETFs",
  "Gold",
  "Crypto",
  "Bonds",
  "Real Estate",
  "Cash",
  "Custom Assets"
];

const RISK_LEVELS = ["Low", "Medium", "High"];

const PortfolioForm = ({ asset, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    category: "Stocks",
    amount: "",
    riskLevel: "Medium",
    expectedReturn: "",
    notes: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || "",
        category: asset.category || "Stocks",
        amount: asset.amount || "",
        riskLevel: asset.riskLevel || "Medium",
        expectedReturn: asset.expectedReturn || "",
        notes: asset.notes || "",
      });
    }
  }, [asset]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error on change
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) {
      setError("Asset name is required.");
      return;
    }

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Investment amount must be a number greater than 0.");
      return;
    }

    const returnNum = parseFloat(formData.expectedReturn);
    if (isNaN(returnNum) || returnNum < 0 || returnNum > 100) {
      setError("Expected return must be a percentage between 0% and 100%.");
      return;
    }

    onSave({
      ...formData,
      id: asset?.id || Date.now().toString(),
      name: formData.name.trim(),
      amount: amountNum,
      expectedReturn: returnNum,
      notes: formData.notes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-(--card) rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col border border-(--border)">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-(--border) flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
          <h2 className="text-xl font-bold text-(--foreground) flex items-center gap-2">
            <TrendingUp className="text-[var(--primary)]" />
            {asset ? "Edit Asset / Investment" : "Add New Asset / Investment"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-(--muted-foreground) hover:text-(--foreground) hover:bg-gray-100 dark:hover:bg-gray-850 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 px-4 py-3 rounded-xl">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Asset Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--foreground) flex items-center gap-1.5">
                <Info size={14} className="text-(--muted-foreground)" /> Asset Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Apple Inc. (AAPL) or S&P 500 ETF"
                className="w-full px-4 py-2.5 bg-(--background) border border-(--border) rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all dark:text-white text-sm"
              />
            </div>

            {/* Asset Category */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--foreground) flex items-center gap-1.5">
                <Tag size={14} className="text-(--muted-foreground)" /> Asset Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-(--background) border border-(--border) rounded-xl focus:ring-2 focus:ring-[var(--primary)] outline-none transition-all dark:text-white text-sm cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount Invested */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--foreground) flex items-center gap-1.5">
                <DollarSign size={14} className="text-(--muted-foreground)" /> Amount Invested ($) *
              </label>
              <input
                type="number"
                name="amount"
                required
                min="0.01"
                step="any"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-(--background) border border-(--border) rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all dark:text-white text-sm"
              />
            </div>

            {/* Expected Return */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--foreground) flex items-center gap-1.5">
                <TrendingUp size={14} className="text-(--muted-foreground)" /> Expected Annual Return (%) *
              </label>
              <input
                type="number"
                name="expectedReturn"
                required
                min="0"
                max="100"
                step="0.01"
                value={formData.expectedReturn}
                onChange={handleChange}
                placeholder="e.g. 8.5"
                className="w-full px-4 py-2.5 bg-(--background) border border-(--border) rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all dark:text-white text-sm"
              />
            </div>

            {/* Risk Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-(--foreground) flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-(--muted-foreground)" /> Risk Level *
              </label>
              <div className="flex gap-2">
                {RISK_LEVELS.map((level) => {
                  const isActive = formData.riskLevel === level;
                  let colorClass = "border-(--border) text-(--muted-foreground) hover:bg-(--muted)/50";
                  if (isActive) {
                    if (level === "Low") colorClass = "bg-gray-500 text-white border-gray-500 shadow-sm";
                    if (level === "Medium") colorClass = "bg-yellow-500 text-white border-yellow-500 shadow-sm";
                    if (level === "High") colorClass = "bg-red-500 text-white border-red-500 shadow-sm";
                  }
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, riskLevel: level }))}
                      className={`flex-1 py-2.5 border rounded-xl font-medium text-xs transition-all duration-200 ${colorClass}`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-(--foreground)">Notes / Description (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="e.g. Long term retirement holding, high dividend yield, tech sector hedge..."
                rows="3"
                className="w-full px-4 py-2.5 bg-(--background) border border-(--border) rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition-all dark:text-white resize-none text-sm"
              ></textarea>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-8 pt-4 border-t border-(--border) flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-(--muted-foreground) hover:text-(--foreground) hover:bg-gray-100 dark:hover:bg-gray-600/40 font-medium rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[var(--primary)] hover:opacity-95 text-white font-medium rounded-xl transition-colors shadow-md text-sm"
            >
              <Save size={18} />
              {asset ? "Save Changes" : "Add Asset"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PortfolioForm;
