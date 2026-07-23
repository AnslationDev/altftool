"use client";

import { useState } from "react";
import {
  Calculator, PieChart, Shield, Package, Truck,
  TrendingUp, Tags, Lightbulb, ChevronRight, BarChart3,
  DollarSign, Activity
} from "lucide-react";
import Description from "../components/Description";

// Utility formatting
const fmtCurr = (val) => {
  if (val === null || isNaN(val)) return "—";
  return `${Number(val).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};
const n = (val) => Number(val) || 0;

export default function PricingCalculator() {
  // Base Costs
  const [productCost, setProductCost] = useState(1500);
  const [shippingCost, setShippingCost] = useState(100);
  const [packagingCost, setPackagingCost] = useState(50);
  const [otherCost, setOtherCost] = useState(0);

  // Profit Settings
  const [profitStrategy, setProfitStrategy] = useState("margin"); // "margin", "markup"
  const [targetValue, setTargetValue] = useState(20);

  // Tax Settings
  const [taxRate, setTaxRate] = useState(18); // GST or VAT
  const [currency, setCurrency] = useState("INR");

  const [showEdu, setShowEdu] = useState(false);

  // ====================
  // CALCULATIONS
  // ====================
  const totalCost = n(productCost) + n(shippingCost) + n(packagingCost) + n(otherCost);

  let sellingPricePreTax = 0;
  let netProfit = 0;

  if (profitStrategy === "margin") {
    const marginFrac = n(targetValue) / 100;
    if (marginFrac >= 1) {
      sellingPricePreTax = totalCost; // Prevent division by zero
    } else {
      sellingPricePreTax = totalCost / (1 - marginFrac);
    }
    netProfit = sellingPricePreTax - totalCost;
  } else {
    // Markup
    netProfit = totalCost * (n(targetValue) / 100);
    sellingPricePreTax = totalCost + netProfit;
  }

  const taxAmount = sellingPricePreTax * (n(taxRate) / 100);
  const finalSellingPrice = sellingPricePreTax + taxAmount;

  const effectiveMargin = finalSellingPrice > 0 ? (netProfit / sellingPricePreTax) * 100 : 0;

  // Breakdown percentages for visual bar
  const costPct = finalSellingPrice > 0 ? (totalCost / finalSellingPrice) * 100 : 0;
  const profitPct = finalSellingPrice > 0 ? (netProfit / finalSellingPrice) * 100 : 0;
  const taxPct = finalSellingPrice > 0 ? (taxAmount / finalSellingPrice) * 100 : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="mx-auto w-full max-w-5xl my-8 font-sans text-slate-800 bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-200/60 relative overflow-hidden">
        {/* Top Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#FF6B35] via-[#ed6126] to-amber-400"></div>

        <div className="p-6 md:p-10">
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#ed6126]/10 text-[#ed6126] px-3 py-1.5 rounded-full mb-4 font-bold tracking-widest text-[10px] uppercase">
                <Tags className="w-3.5 h-3.5" /> Intelligent Pricing Engine
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
                Product Price Calculator
              </h1>
              <p className="text-slate-500 text-lg max-w-2xl leading-relaxed">
                Interactively simulate costs, margins, and taxes to find the perfect retail price. Slide to adjust values and watch your profitability update in real-time.
              </p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200 rounded-2xl p-5 max-w-[260px] flex items-start gap-4 shadow-sm w-full md:w-auto hover:shadow-md transition-shadow">
              <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
                <Shield className="w-6 h-6 text-teal-600 shrink-0" />
              </div>
              <div>
                <div className="text-sm font-extrabold text-slate-800">100% Secure & Free</div>
                <div className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">Calculations execute instantly in your local browser.</div>
              </div>
            </div>
          </div>

          {/* Edu Banner */}
          <div
            onClick={() => setShowEdu(!showEdu)}
            className="group bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/60 rounded-2xl p-5 mb-8 flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-full shadow-sm">
                <Lightbulb className="w-5 h-5 text-amber-500" />
              </div>
              <h4 className="font-bold text-amber-900 text-sm">Confused between Margin vs. Markup?</h4>
            </div>
            <div className="bg-white p-1.5 rounded-full shadow-sm group-hover:scale-110 transition-transform">
              <ChevronRight className={`w-5 h-5 text-amber-600 transition-transform duration-300 ${showEdu ? "rotate-90" : ""}`} />
            </div>
          </div>

          {showEdu && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-8 grid md:grid-cols-2 gap-8 text-sm text-slate-700 animate-in fade-in slide-in-from-top-4 shadow-sm">
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                  <PieChart className="w-5 h-5 text-indigo-500" /> Gross Margin
                </h5>
                <div className="bg-indigo-50/80 p-3 rounded-xl border border-indigo-100/50">
                  <p className="text-indigo-800 font-mono text-xs font-semibold">Margin = (Profit / Selling Price) × 100</p>
                </div>
                <p className="leading-relaxed">Margin shows the percentage of the <strong>final selling price</strong> that is profit. A 20% margin means for every $100 you sell, you keep $20.</p>
              </div>
              <div className="space-y-3">
                <h5 className="font-bold text-slate-900 flex items-center gap-2 text-base">
                  <TrendingUp className="w-5 h-5 text-emerald-500" /> Markup
                </h5>
                <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100/50">
                  <p className="text-emerald-800 font-mono text-xs font-semibold">Markup = (Profit / Total Cost) × 100</p>
                </div>
                <p className="leading-relaxed">Markup shows how much you added to the <strong>base cost</strong> to get the selling price. A 50% markup on a $100 cost makes the selling price $150.</p>
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 xl:gap-12">

            {/* Inputs Column */}
            <div className="space-y-8">

              {/* Cost Data */}
              <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <h5 className="font-extrabold text-slate-800 text-lg mb-6 flex items-center gap-3">
                  <div className="bg-indigo-50 p-2 rounded-xl">
                    <Package className="w-5 h-5 text-indigo-600" />
                  </div>
                  Base Product Costs
                </h5>

                <div className="space-y-6">
                  {/* Currency & Base Cost */}
                  <div className="grid grid-cols-[100px_1fr] gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Currency</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-black text-sm py-3 px-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer appearance-none text-center"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                      >
                        <option value="INR">₹ INR</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                        <option value="GBP">£ GBP</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Manufacturing Cost</label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-slate-800 font-black text-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          value={productCost}
                          onChange={(e) => setProductCost(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-2 uppercase tracking-wide"><Truck className="w-3.5 h-3.5 text-slate-400"/> Shipping</label>
                      <input
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={shippingCost}
                        onChange={e=>setShippingCost(e.target.value)}
                      />
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                      <label className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-2 uppercase tracking-wide"><Package className="w-3.5 h-3.5 text-slate-400"/> Packaging</label>
                      <input
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={packagingCost}
                        onChange={e=>setPackagingCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Other Variable Costs</label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                        value={otherCost}
                        onChange={e=>setOtherCost(e.target.value)}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                        <DollarSign className="w-3 h-3"/> FEES/MARKETING
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Strategy & Tax */}
              <div className="bg-white rounded-[1.5rem] p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <h5 className="font-extrabold text-slate-800 text-lg mb-6 flex items-center gap-3">
                  <div className="bg-emerald-50 p-2 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  Profit Strategy & Tax
                </h5>

                <div className="space-y-8">
                  {/* Strategy Toggle */}
                  <div className="bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60 flex">
                    <button
                      onClick={() => setProfitStrategy("margin")}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex justify-center items-center gap-2 ${profitStrategy === "margin" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Target Margin
                    </button>
                    <button
                      onClick={() => setProfitStrategy("markup")}
                      className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex justify-center items-center gap-2 ${profitStrategy === "markup" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      Target Markup
                    </button>
                  </div>

                  {/* Profit Slider */}
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-bold text-slate-700">
                        Desired {profitStrategy === "margin" ? "Margin" : "Markup"} (%)
                      </label>
                      <span className="text-2xl font-black text-emerald-600 font-mono">{targetValue}%</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0" max={profitStrategy === "margin" ? "99" : "300"}
                        className="flex-1 h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                      />
                      <input
                        type="number"
                        className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-3 text-center font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                        value={targetValue}
                        onChange={(e) => setTargetValue(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

                  {/* Tax Slider */}
                  <div>
                    <div className="flex justify-between items-end mb-4">
                      <label className="block text-sm font-bold text-slate-700">Applicable Tax / GST (%)</label>
                      <span className="text-2xl font-black text-teal-600 font-mono">{taxRate}%</span>
                    </div>
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {["0", "5", "12", "18", "28"].map(val => (
                        <button
                          key={val}
                          onClick={() => setTaxRate(val)}
                          className={`flex-1 text-xs px-2 py-2 border rounded-xl font-bold transition-all ${taxRate == val ? "bg-teal-50 border-teal-500 text-teal-700 shadow-sm" : "border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:border-slate-300"}`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0" max="50"
                        className="flex-1 h-2.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-teal-500"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                      />
                      <input
                        type="number"
                        className="w-20 bg-white border border-slate-200 rounded-xl py-2 px-3 text-center font-bold text-slate-800 focus:outline-none focus:border-teal-500"
                        value={taxRate}
                        onChange={(e) => setTaxRate(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div>
              <div className="bg-[#0f172a] rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-slate-900/20 h-fit sticky top-6 border border-slate-800/50 relative overflow-hidden">
                {/* Visual Flair */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ed6126] rounded-full blur-[80px] opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500 rounded-full blur-[80px] opacity-20"></div>

                <h4 className="font-extrabold text-xl text-white mb-8 flex items-center gap-3 relative z-10">
                  <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                    <Activity className="w-5 h-5 text-amber-400" />
                  </div>
                  Pricing Engine Output
                </h4>

                {/* Final Selling Price Box */}
                <div className="bg-slate-800/50 rounded-2xl p-6 sm:p-8 mb-6 border border-slate-700/50 backdrop-blur-md relative z-10">
                  <div className="text-[11px] font-black uppercase tracking-[0.2em] text-teal-400 mb-3 flex justify-between items-center">
                    <span>Retail Selling Price</span>
                    <span className="bg-teal-400/10 text-teal-300 px-2.5 py-1 rounded-full text-[9px] border border-teal-400/20">Incl. Tax</span>
                  </div>
                  <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter mb-6 text-white drop-shadow-md">
                    {fmtCurr(finalSellingPrice)}
                  </div>

                  {/* Visual Composition Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      <span>Price Composition Breakdown</span>
                    </div>
                    <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex ring-1 ring-slate-700/50 shadow-inner">
                      <div className="bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${costPct}%` }} title={`Costs: ${costPct.toFixed(1)}%`}></div>
                      <div className="bg-emerald-500 transition-all duration-500 ease-out" style={{ width: `${profitPct}%` }} title={`Profit: ${profitPct.toFixed(1)}%`}></div>
                      <div className="bg-teal-500 transition-all duration-500 ease-out" style={{ width: `${taxPct}%` }} title={`Tax: ${taxPct.toFixed(1)}%`}></div>
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-semibold text-slate-300">
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-indigo-500"></div> Costs</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-500"></div> Profit</div>
                      <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-teal-500"></div> Tax</div>
                    </div>
                  </div>
                </div>

                {/* Profit & Margin Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl hover:bg-emerald-500/15 transition-colors">
                    <div className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest mb-1">Net Profit / Unit</div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">{fmtCurr(netProfit)}</div>
                  </div>

                  <div className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-2xl hover:bg-slate-800/80 transition-colors">
                    <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Gross Margin</div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono">
                      {profitStrategy === "margin" && n(targetValue) < 100 ? targetValue : fmtCurr(effectiveMargin)}%
                    </div>
                  </div>
                </div>

                {/* Pre-tax and Tax breakdown */}
                <div className="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-5 mb-6 relative z-10 grid grid-cols-2 divide-x divide-slate-700/50">
                  <div className="pr-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pre-Tax Price</div>
                    <div className="text-lg font-bold font-mono text-slate-200">{fmtCurr(sellingPricePreTax)}</div>
                  </div>
                  <div className="pl-4 text-right">
                    <div className="text-[10px] font-bold text-teal-400/80 uppercase tracking-wider mb-1">Tax Amount ({taxRate}%)</div>
                    <div className="text-lg font-bold font-mono text-teal-300">+{fmtCurr(taxAmount)}</div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-sm relative z-10">
                  <div className="text-[11px] font-black uppercase tracking-widest text-slate-300 border-b border-white/10 pb-3 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5"/> Cost Breakdown
                  </div>

                  <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Product Cost</span>
                      <span className="font-semibold text-slate-200">{fmtCurr(n(productCost))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shipping</span>
                      <span className="font-semibold text-slate-200">{fmtCurr(n(shippingCost))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Packaging & Extras</span>
                      <span className="font-semibold text-slate-200">{fmtCurr(n(packagingCost) + n(otherCost))}</span>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex justify-between">
                      <span className="font-bold text-slate-300 font-sans text-xs uppercase tracking-wider">Total Cost Base</span>
                      <span className="font-black text-indigo-400 text-base">{fmtCurr(totalCost)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Descriptive SEO block outside the card */}
      <Description />
    </div>
  );
}