"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  PieChart,
  Download,
  Trash2,
  Database,
  Search,
  Filter,
  TrendingUp,
  HelpCircle
} from "lucide-react";
import PortfolioDashboard from "../components/PortfolioDashboard";
import PortfolioForm from "../components/PortfolioForm";
import PortfolioList from "../components/PortfolioList";
import PortfolioCharts from "../components/PortfolioCharts";
import PortfolioInsights from "../components/PortfolioInsights";

// Sample premium diversified asset list for quick demonstration
const SAMPLE_PORTFOLIO = [
  { id: "1", name: "Apple Inc. Common Stock (AAPL)", category: "Stocks", amount: 15000, riskLevel: "Medium", expectedReturn: 12.5, notes: "Blue-chip tech giant with steady compounding dividend yield." },
  { id: "2", name: "Vanguard S&P 500 ETF (VOO)", category: "ETFs", amount: 28000, riskLevel: "Low", expectedReturn: 8.8, notes: "Core market index fund anchoring long-term wealth stability." },
  { id: "3", name: "Ethereum Layer 1 Token (ETH)", category: "Crypto", amount: 7500, riskLevel: "High", expectedReturn: 22.0, notes: "High volatility exposure for decentralized application layer growth." },
  { id: "4", name: "Physical Gold Bullion Bar", category: "Gold", amount: 6000, riskLevel: "Low", expectedReturn: 5.5, notes: "Commodity defensive hedge during global market recessions." },
  { id: "5", name: "High Yield Corporate Bond ETF", category: "Bonds", amount: 11000, riskLevel: "Low", expectedReturn: 4.8, notes: "Fixed-income yield cushioning overall portfolio drawback risk." },
  { id: "6", name: "Emergency Liquid Savings Cushion", category: "Cash", amount: 5000, riskLevel: "Low", expectedReturn: 3.8, notes: "Highly liquid money market account for market dips." }
];

const PortfolioAllocationVisualizer = () => {
  const [assets, setAssets] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [sortBy, setSortBy] = useState("amount-desc");

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem("portfolioAllocationTrackerData");
    if (saved) {
      try {
        setAssets(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading portfolio assets", e);
      }
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("portfolioAllocationTrackerData", JSON.stringify(assets));
  }, [assets]);

  // Actions
  const handleSaveAsset = (assetData) => {
    if (editingAsset) {
      setAssets(assets.map((a) => (a.id === assetData.id ? assetData : a)));
    } else {
      setAssets([...assets, assetData]);
    }
    setIsFormOpen(false);
    setEditingAsset(null);
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setIsFormOpen(true);
  };

  const handleDeleteAsset = (id) => {
    if (window.confirm("Are you sure you want to remove this asset?")) {
      setAssets(assets.filter((a) => a.id !== id));
    }
  };

  const handleLoadSample = () => {
    if (assets.length > 0 && !window.confirm("Loading sample data will replace your current asset listings. Proceed?")) {
      return;
    }
    setAssets(SAMPLE_PORTFOLIO);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear your entire portfolio list? This action cannot be undone.")) {
      setAssets([]);
    }
  };

  const handleExportCSV = () => {
    if (assets.length === 0) return;

    const headers = ["Asset Name,Category,Amount Invested ($),Risk Level,Expected Return (%) ,Notes"];
    const csvRows = assets.map(
      (a) =>
        `"${a.name}","${a.category}",${a.amount},"${a.riskLevel}",${a.expectedReturn},"${a.notes || ""}"`
    );
    const csvContent = headers.concat(csvRows).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "portfolio_allocation_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-(--background) text-(--foreground) transition-colors py-6 px-4 min-h-screen">
      <div className="w-full max-w-6xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">

        {/* Main Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-(--card) p-6 rounded-2xl shadow-sm border border-(--border)">
          <div>
            <h1 className="text-2xl font-bold text-(--foreground) flex items-center gap-2">
              <PieChart className="text-[var(--primary)]" />
              Portfolio Allocation Visualizer
            </h1>
            <p className="text-(--muted-foreground) mt-1">
              Visualize, analyze, and optimize asset allocation weights, risks, and expected portfolio returns in real-time.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
            <button
              onClick={handleLoadSample}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-(--muted) hover:bg-(--muted)/80 text-(--foreground) font-medium rounded-xl transition-colors cursor-pointer"
            >
              <Database size={18} />
              <span>Load Sample</span>
            </button>

            {assets.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-(--muted) hover:bg-(--muted)/80 text-(--foreground) font-medium rounded-xl transition-colors cursor-pointer"
                >
                  <Download size={18} />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/15 text-red-500 font-medium rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 size={18} />
                  <span>Clear All</span>
                </button>
              </>
            )}

            <button
              onClick={() => {
                setEditingAsset(null);
                setIsFormOpen(true);
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded-xl transition-colors shadow-sm shadow-md cursor-pointer"
            >
              <Plus size={18} />
              <span>Add Asset</span>
            </button>
          </div>
        </div>

        {/* Empty State vs Dashboard grids */}
        {assets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center bg-(--card) rounded-2xl shadow-sm border border-(--border)">
            <div className="w-20 h-20 bg-[var(--primary)]/10 text-[var(--primary)] rounded-full flex items-center justify-center mb-4">
              <PieChart size={40} />
            </div>
            <h3 className="text-xl font-semibold text-(--foreground) mb-2">Build Your Portfolio Visualizer</h3>
            <p className="text-(--muted-foreground) max-w-sm mb-6">
              Add individual investments such as stocks, crypto, cash, ETFs, or gold to track real-time allocation percentage, portfolio health index, risk exposure, and expected returns.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLoadSample}
                className="flex items-center gap-2 px-5 py-2.5 bg-(--muted) hover:bg-(--muted)/80 text-(--foreground) font-medium rounded-xl transition-colors cursor-pointer"
              >
                <Database size={18} />
                Load Sample Portfolio
              </button>
              <button
                onClick={() => {
                  setEditingAsset(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] hover:opacity-90 text-white font-medium rounded-xl transition-colors shadow-sm shadow-md cursor-pointer"
              >
                <Plus size={20} />
                Add First Asset
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Stat Cards */}
            <PortfolioDashboard assets={assets} />

            {/* Dashboard Workspace Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Column: Asset Holdings & Breakdown Charts (Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-(--card) rounded-2xl shadow-sm border border-(--border) overflow-hidden">
                  <div className="p-5 border-b border-(--border) space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                      <h2 className="text-xl font-semibold text-(--foreground) flex items-center gap-2">
                        <TrendingUp size={20} className="text-(--muted-foreground)" />
                        Asset Holdings
                      </h2>

                      {/* Search & Filter Row */}
                      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" size={18} />
                          <input
                            type="text"
                            placeholder="Search assets, tickers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-(--background) border border-(--border) rounded-xl focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] outline-none transition-all dark:text-white text-sm"
                          />
                        </div>
                        <select
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                          className="px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] dark:text-white text-sm cursor-pointer"
                        >
                          <option value="All">All Categories</option>
                          <option value="Stocks">Stocks</option>
                          <option value="Mutual Funds">Mutual Funds</option>
                          <option value="ETFs">ETFs</option>
                          <option value="Gold">Gold</option>
                          <option value="Crypto">Crypto</option>
                          <option value="Bonds">Bonds</option>
                          <option value="Real Estate">Real Estate</option>
                          <option value="Cash">Cash</option>
                          <option value="Custom Assets">Custom Assets</option>
                        </select>
                        <select
                          value={filterRisk}
                          onChange={(e) => setFilterRisk(e.target.value)}
                          className="px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] dark:text-white text-sm cursor-pointer"
                        >
                          <option value="All">All Risks</option>
                          <option value="Low">Low Risk</option>
                          <option value="Medium">Medium Risk</option>
                          <option value="High">High Risk</option>
                        </select>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="px-3 py-2 bg-(--background) border border-(--border) rounded-xl outline-none focus:ring-2 focus:ring-[var(--primary)] dark:text-white text-sm cursor-pointer"
                        >
                          <option value="amount-desc">Amount: High to Low</option>
                          <option value="amount-asc">Amount: Low to High</option>
                          <option value="return-desc">Yield: High to Low</option>
                          <option value="name-asc">Name: A to Z</option>
                          <option value="risk-desc">Risk: High to Low</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Listing Body */}
                  <PortfolioList
                    assets={assets}
                    searchTerm={searchTerm}
                    filterCategory={filterCategory}
                    filterRisk={filterRisk}
                    sortBy={sortBy}
                    onEdit={handleEditAsset}
                    onDelete={handleDeleteAsset}
                  />
                </div>

                {/* Value comparison and Breakdown */}
                <PortfolioCharts assets={assets} view="breakdown" />
              </div>

              {/* Right Column: Category/Risk Pies & AI Insights (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <PortfolioCharts assets={assets} view="pies" />
                <PortfolioInsights assets={assets} />
              </div>

            </div>
          </div>
        )}

        {/* Asset Modal Dialog Form */}
        {isFormOpen && (
          <PortfolioForm
            asset={editingAsset}
            onSave={handleSaveAsset}
            onClose={() => {
              setIsFormOpen(false);
              setEditingAsset(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default PortfolioAllocationVisualizer;
