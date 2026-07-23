"use client";

import { useState } from "react";
import {
  Calculator, Scale, Calendar, Columns, Book, Lightbulb,
  ChevronRight, BarChart, Percent, CreditCard, PlusCircle,
  RefreshCcw, Wand2, Shield, ArrowRight, CheckCircle2,
  AlertTriangle, DollarSign, Target, MousePointerClick, TrendingUp, XCircle, Play
} from "lucide-react";

// Utility helpers
const fmt = (val, dec = 2) => (val === null || isNaN(val) ? "—" : Number(val).toFixed(dec));
const n = (val) => Number(val) || 0;
const fmtCurr = (val, cur = "PLN") => {
  if (val === null || isNaN(val)) return "—";
  return `${Number(val).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
};

const TABS = [
  { id: "calculator", label: "ROAS Calculator", icon: Calculator },
  { id: "breakeven", label: "Break-even", icon: Scale },
  { id: "budget", label: "Budget planner", icon: Calendar },
  { id: "compare", label: "Compare campaigns", icon: Columns },
  { id: "guide", label: "Guide", icon: Book },
];

export default function RoasCalculator() {
  const [activeTab, setActiveTab] = useState("calculator");

  // Tab 1: Calculator State
  const [spend, setSpend] = useState("10000");
  const [revenue, setRevenue] = useState("50000");
  const [conversions, setConversions] = useState("");
  const [clicks, setClicks] = useState("");
  const [margin, setMargin] = useState(30);
  const [otherCosts, setOtherCosts] = useState(0); // Using 0 for this exact UI match
  const [currency, setCurrency] = useState("PLN");
  const [showOptional, setShowOptional] = useState(false);
  const [showEdu, setShowEdu] = useState(false);
  const [showSecondary, setShowSecondary] = useState(false);

  // Tab 2: Break-even State
  const [beMargin, setBeMargin] = useState(30);
  const [beVarCosts, setBeVarCosts] = useState(5);
  const [beTargetProfit, setBeTargetProfit] = useState(0);

  // Tab 3: Budget Planner State
  const [bpTargetRoas, setBpTargetRoas] = useState("");
  const [bpSpend, setBpSpend] = useState("");
  const [bpTargetRev, setBpTargetRev] = useState("");

  // Tab 4: Compare State
  const [campaigns, setCampaigns] = useState([
    { id: 1, name: "Campaign A", spend: "", rev: "", color: "bg-indigo-500" },
    { id: 2, name: "Campaign B", spend: "", rev: "", color: "bg-emerald-500" }
  ]);
  const PALETTE = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-purple-500", "bg-pink-500"];

  // ====================
  // CALCULATOR LOGIC
  // ====================
  const netMarginPercent = margin - otherCosts;
  const netMarginFrac = netMarginPercent / 100;

  const calcRoas = n(spend) && n(revenue) ? n(revenue) / n(spend) : null;
  const calcProfit = n(revenue) && n(spend) ? (n(revenue) * netMarginFrac) - n(spend) : null;
  const calcRoi = n(spend) && calcProfit !== null ? (calcProfit / n(spend)) * 100 : null;
  const calcBreakeven = netMarginFrac > 0 ? 1 / netMarginFrac : null;

  const cpa = n(spend) && n(conversions) ? n(spend) / n(conversions) : null;
  const cpc = n(spend) && n(clicks) ? n(spend) / n(clicks) : null;
  const aov = n(revenue) && n(conversions) ? n(revenue) / n(conversions) : null;
  const cr = n(conversions) && n(clicks) ? (n(conversions) / n(clicks)) * 100 : null;

  const isProfitable = calcProfit !== null && calcProfit >= 0;

  // Indicator Bar Positioning
  const getIndicatorPosition = () => {
    if (!calcRoas || !calcBreakeven) return 0;
    const maxDisplay = calcBreakeven * 2.5;
    return Math.min(100, Math.max(0, (calcRoas / maxDisplay) * 100));
  };
  const breakevenPos = 40; // 40% of the bar represents break-even visually

  // ====================
  // BREAK-EVEN LOGIC
  // ====================
  const beNetMarginFrac = (beMargin - beVarCosts) / 100;
  const requiredMargin = (beMargin - beVarCosts - beTargetProfit) / 100;
  const beRoasFinal = requiredMargin > 0 ? 1 / requiredMargin : null;
  const canAchieveProfit = requiredMargin > 0;

  // ====================
  // BUDGET PLANNER LOGIC
  // ====================
  const neededRev = n(bpTargetRoas) && n(bpSpend) ? n(bpSpend) * n(bpTargetRoas) : null;
  const maxSpend = n(bpTargetRoas) && n(bpTargetRev) ? n(bpTargetRev) / n(bpTargetRoas) : null;
  const impliedRoas = n(bpSpend) && n(bpTargetRev) ? n(bpTargetRev) / n(bpSpend) : null;


  return (
    <div className="mx-auto w-full max-w-5xl my-8 font-sans text-slate-800 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200 relative overflow-hidden">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-indigo-500 to-teal-400"></div>

      <div className="p-6 md:p-10">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-teal-600 mb-2 font-bold tracking-widest text-[11px] uppercase">
              <TrendingUp className="w-4 h-4" /> Campaign Profitability
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight mb-3">
              ROAS and ROI Calculator
            </h1>
            <p className="text-slate-500 text-sm md:text-base max-w-2xl">
              Enter spend, attributed revenue and margin. You will see ROAS, the break-even threshold and the estimated result after the costs you provide.
            </p>
          </div>
          <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4 max-w-[240px] flex items-start gap-3 w-full md:w-auto">
            <Shield className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-bold text-slate-800">Verified July 14, 2026</div>
              <div className="text-xs text-slate-500 mt-1">Calculations run locally in your browser.</div>
            </div>
          </div>
        </div>

        {/* Edu Banner */}
        <div
          onClick={() => setShowEdu(!showEdu)}
          className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 mb-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h4 className="font-bold text-slate-800 text-sm">ROAS vs ROI - what's the difference?</h4>
          </div>
          <ChevronRight className={`w-5 h-5 text-blue-500 transition-transform ${showEdu ? "rotate-90" : ""}`} />
        </div>

        {showEdu && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 mb-5 grid md:grid-cols-2 gap-6 text-sm text-slate-700 animate-in fade-in slide-in-from-top-2">
            <div>
              <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> ROAS (Return on Ad Spend)
              </h5>
              <p className="bg-blue-50 py-1 px-3 rounded text-blue-800 font-mono text-xs inline-block mb-3">ROAS = Revenue / Ad spend</p>
              <p className="mb-2">Measures <strong>campaign efficiency</strong>: how much attributed revenue is generated by each unit of ad spend.</p>
            </div>
            <div>
              <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> ROI (Return on Investment)
              </h5>
              <p className="bg-emerald-50 py-1 px-3 rounded text-emerald-800 font-mono text-xs inline-block mb-3">ROI = (Profit / Costs) × 100%</p>
              <p className="mb-2">Estimates the <strong>return after the costs entered</strong>. The result is only as complete as the cost data you provide.</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-1.5 flex flex-wrap gap-1 mb-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-5 py-3 font-bold text-[13px] transition-all rounded-lg flex-1 md:flex-none
                  ${isActive
                    ? "bg-white text-slate-800 shadow-sm border-b-2 border-amber-400"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100/50"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-slate-700" : "opacity-60"}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div>
          {/* TAB 1: CALCULATOR */}
          {activeTab === "calculator" && (
            <div className="animate-in fade-in duration-300">
              <div className="grid lg:grid-cols-[1fr_1.3fr] gap-6">

                {/* Inputs Column */}
                <div className="space-y-6">

                  {/* Campaign Data */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h5 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-amber-500" /> Campaign data
                    </h5>

                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ad spend</label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                          <input
                            type="number"
                            className="flex-1 bg-white py-2.5 pl-4 pr-3 text-slate-800 focus:outline-none"
                            placeholder="10000"
                            value={spend}
                            onChange={(e) => setSpend(e.target.value)}
                          />
                          <select
                            className="bg-slate-100/80 border-l border-slate-200 text-slate-600 font-bold text-sm py-2 px-4 focus:outline-none cursor-pointer"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                          >
                            <option value="PLN">PLN</option>
                            <option value="INR">INR</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Campaign revenue</label>
                        <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                          <input
                            type="number"
                            className="flex-1 bg-white py-2.5 pl-4 pr-3 text-slate-800 focus:outline-none"
                            placeholder="50000"
                            value={revenue}
                            onChange={(e) => setRevenue(e.target.value)}
                          />
                          <div className="bg-slate-100/80 border-l border-slate-200 text-slate-600 font-bold text-sm py-2.5 px-6 flex items-center justify-center">
                            {currency}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-b border-slate-100 pb-4">
                        <button
                          onClick={() => setShowOptional(!showOptional)}
                          className="flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors"
                        >
                          {showOptional ? <PlusCircle className="w-4 h-4 rotate-45 transition-transform" /> : <PlusCircle className="w-4 h-4 transition-transform" />}
                          Add optional data: conversions and clicks
                        </button>

                        {showOptional && (
                          <div className="mt-4 grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1.5">Conversions</label>
                              <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="100" value={conversions} onChange={e=>setConversions(e.target.value)} />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-600 mb-1.5">Clicks</label>
                              <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="5000" value={clicks} onChange={e=>setClicks(e.target.value)} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Margin & Costs */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h5 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-amber-500" /> Margin and costs
                    </h5>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-3">Gross margin (%)</label>
                      <div className="flex items-center gap-4 mb-4">
                        <input
                          type="number"
                          className="w-20 bg-white border border-slate-200 rounded-lg py-2 px-3 text-center font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                        />
                        <input
                          type="range"
                          min="0" max="100"
                          className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          value={margin}
                          onChange={(e) => setMargin(Number(e.target.value))}
                        />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {[15, 25, 35, 50, 70].map(val => (
                          <button
                            key={val}
                            onClick={() => setMargin(val)}
                            className="text-xs px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg font-bold text-slate-500 transition-colors shadow-sm"
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Column */}
                <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200 shadow-sm h-fit">
                  <h4 className="font-bold text-lg text-slate-900 mb-4">
                    Analysis results
                  </h4>

                  {/* Main Result Card */}
                  <div className="bg-[#1e3a5f] rounded-xl p-6 mb-4 text-white shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-teal-400 mb-8">Campaign Result</div>
                    <div className="text-4xl md:text-5xl font-black font-mono tracking-tighter mb-4">
                      {calcProfit === null ? "—" : `${isProfitable ? "" : ""}${fmtCurr(calcProfit, currency)}`}
                    </div>
                    <div className="text-sm font-bold">Estimated result</div>
                    <div className="text-xs text-slate-300 font-medium mt-0.5">after the costs entered</div>
                  </div>

                  {/* Top Metric Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm">
                      <div className="text-2xl font-black text-slate-900 font-mono mb-2">{calcRoas ? `${fmt(calcRoas)}` : "—"}</div>
                      <div className="text-[13px] font-bold text-slate-600">ROAS</div>
                      <div className="text-[10px] text-slate-400 mt-1">-</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm">
                      <div className="text-2xl font-black text-slate-900 font-mono mb-2">{calcRoi !== null ? `${calcRoi > 0 ? "" : ""}${fmt(calcRoi)}%` : "—"}</div>
                      <div className="text-[13px] font-bold text-slate-600">ROI</div>
                      <div className="text-[10px] text-slate-400 mt-1">return on investment</div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-center shadow-sm">
                      <div className="text-2xl font-black text-slate-900 font-mono mb-2">{calcBreakeven ? `${fmt(calcBreakeven)}` : "—"}</div>
                      <div className="text-[13px] font-bold text-slate-600">Break-even ROAS</div>
                      <div className="text-[10px] text-slate-400 mt-1">minimum ROAS for zero profit</div>
                    </div>
                  </div>

                  {/* Secondary Metrics Toggle */}
                  <button
                    onClick={() => setShowSecondary(!showSecondary)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-800 transition-colors mb-4"
                  >
                    <Play className={`w-3 h-3 fill-current transition-transform ${showSecondary ? "rotate-90" : ""}`} />
                    Show supporting metrics: CPA, CPC, AOV and CR
                  </button>

                  {showSecondary && (
                    <div className="grid grid-cols-4 gap-2 mb-4 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-sm font-black text-slate-800 font-mono">{cpa !== null ? fmtCurr(cpa, currency) : "—"}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">CPA</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-sm font-black text-slate-800 font-mono">{cpc !== null ? fmtCurr(cpc, currency) : "—"}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">CPC</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-sm font-black text-slate-800 font-mono">{aov !== null ? fmtCurr(aov, currency) : "—"}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">AOV</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200 text-center">
                        <div className="text-sm font-black text-slate-800 font-mono">{cr !== null ? `${fmt(cr, 1)}%` : "—"}</div>
                        <div className="text-[9px] font-bold text-slate-500 uppercase mt-1">CR%</div>
                      </div>
                    </div>
                  )}

                  {/* Profitability Bar */}
                  {calcRoas && calcBreakeven && (
                    <div className="mt-6">
                      <div className="relative h-4 rounded-sm overflow-hidden bg-[--primary]">
                        {/* Current ROAS marker pointing down */}
                        <div
                          className="absolute -top-3 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-slate-800 z-20 transition-all duration-500"
                          style={{ left: `calc(${getIndicatorPosition()}% - 6px)` }}
                        ></div>
                        {/* Marker Line */}
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-slate-800 z-10 transition-all duration-500"
                          style={{ left: `${getIndicatorPosition()}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2">
                        <span>Loss</span>
                        <span className="text-slate-800 font-bold">Break-even: {fmt(calcBreakeven)}</span>
                        <span>Profit</span>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BREAKEVEN */}
          {activeTab === "breakeven" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-blue-50 text-blue-800 p-4 rounded-2xl text-sm mb-8 flex gap-3">
                <Shield className="w-5 h-5 shrink-0 text-blue-600" />
                <p><strong>Break-even ROAS</strong> is the threshold at which attributed revenue covers ad spend and the percentage costs entered. It does not include costs you have not provided.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-(--primary)" /> Your cost structure
                  </h5>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gross margin (%)</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-(--primary)" value={beMargin} onChange={e=>setBeMargin(Number(e.target.value))} />
                    <p className="text-xs text-slate-500 mt-1">(Selling price - product cost) / Selling price × 100</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Variable costs (% of revenue)</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-(--primary)" value={beVarCosts} onChange={e=>setBeVarCosts(Number(e.target.value))} />
                    <p className="text-xs text-slate-500 mt-1">Commissions, payments, packaging</p>
                  </div>
                  <hr className="border-slate-200" />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Profit Margin (%)</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 focus:outline-none focus:border-(--primary)" value={beTargetProfit} onChange={e=>setBeTargetProfit(Number(e.target.value))} />
                    <p className="text-xs text-slate-500 mt-1">Desired profit after ad spend & costs</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-extrabold text-xl text-slate-800 mb-5 flex items-center gap-2">
                    <Scale className="w-6 h-6 text-emerald-500" /> Results
                  </h4>

                  {canAchieveProfit ? (
                    <div className="space-y-4">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                        <div className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-2">Required ROAS</div>
                        <div className="text-5xl font-black font-mono text-emerald-600">{fmt(beRoasFinal)}x</div>
                        <div className="text-sm text-emerald-700 mt-2">To achieve {beTargetProfit}% profit margin</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Net Margin</div>
                          <div className="text-xl font-black text-slate-700 font-mono">{fmt(beMargin - beVarCosts, 1)}%</div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">Break-even ROAS</div>
                          <div className="text-xl font-black text-slate-700 font-mono">{fmt(1/beNetMarginFrac)}x</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-center">
                      <AlertTriangle className="w-8 h-8 mx-auto mb-3 text-red-500" />
                      <h5 className="font-bold text-lg mb-2">Unachievable target</h5>
                      <p className="text-sm">Your target profit ({beTargetProfit}%) exceeds your net margin ({fmt(beMargin - beVarCosts, 1)}%). You cannot achieve this profit margin regardless of how high your ROAS is.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUDGET PLANNER */}
          {activeTab === "budget" && (
            <div className="animate-in fade-in duration-300">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <h5 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Target className="w-5 h-5 text-(--primary)" /> Planner inputs
                  </h5>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target ROAS</label>
                    <div className="relative">
                      <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 pr-8 focus:outline-none focus:border-(--primary)" placeholder="4.0" value={bpTargetRoas} onChange={e=>setBpTargetRoas(e.target.value)} />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">x</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ad Budget (Planned Spend)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">PLN</span>
                      <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-12 pr-3 focus:outline-none focus:border-(--primary)" placeholder="50000" value={bpSpend} onChange={e=>setBpSpend(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Revenue</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">PLN</span>
                      <input type="number" className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-12 pr-3 focus:outline-none focus:border-(--primary)" placeholder="200000" value={bpTargetRev} onChange={e=>setBpTargetRev(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-extrabold text-xl text-slate-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-6 h-6 text-indigo-500" /> Planning Results
                  </h4>

                  {neededRev !== null && (
                    <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-indigo-500 uppercase tracking-wide">Revenue needed for {bpTargetRoas}x ROAS</div>
                        <div className="text-sm text-indigo-700 mt-1">from {fmtCurr(n(bpSpend))} spend</div>
                      </div>
                      <div className="text-3xl font-black font-mono text-indigo-600">{fmtCurr(neededRev)}</div>
                    </div>
                  )}

                  {maxSpend !== null && (
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Max spend for {fmtCurr(n(bpTargetRev))}</div>
                        <div className="text-sm text-emerald-700 mt-1">at {bpTargetRoas}x ROAS target</div>
                      </div>
                      <div className="text-3xl font-black font-mono text-emerald-600">{fmtCurr(maxSpend)}</div>
                    </div>
                  )}

                  {impliedRoas !== null && (
                    <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-500 uppercase tracking-wide">Implied ROAS</div>
                        <div className="text-sm text-amber-700 mt-1">to hit revenue with your budget</div>
                      </div>
                      <div className="text-3xl font-black font-mono text-amber-600">{fmt(impliedRoas)}x</div>
                    </div>
                  )}

                  {!bpTargetRoas && !bpSpend && !bpTargetRev && (
                    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
                      <Target className="w-8 h-8 mb-3 opacity-50" />
                      <p className="text-sm font-medium">Fill in at least two fields to see planning results.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: COMPARE */}
          {activeTab === "compare" && (
            <div className="animate-in fade-in duration-300">
              <p className="text-sm text-slate-600 mb-6">Compare multiple campaigns or channels side by side to see which performs best.</p>

              <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
                <div className="space-y-4">
                  {campaigns.map((camp, i) => (
                    <div key={camp.id} className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`w-4 h-4 rounded-full ${camp.color}`}></div>
                        <input
                          type="text"
                          className="font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-(--primary) focus:outline-none transition-colors px-1 py-0.5"
                          value={camp.name}
                          onChange={(e) => {
                            const newC = [...campaigns];
                            newC[i].name = e.target.value;
                            setCampaigns(newC);
                          }}
                        />
                        {campaigns.length > 2 && (
                          <button
                            onClick={() => setCampaigns(c => c.filter(x => x.id !== camp.id))}
                            className="ml-auto text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-1 bg-red-50 rounded"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Ad Spend (PLN)</label>
                          <input type="number" className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-(--primary)" value={camp.spend} onChange={(e) => {
                            const newC = [...campaigns];
                            newC[i].spend = e.target.value;
                            setCampaigns(newC);
                          }} />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Revenue (PLN)</label>
                          <input type="number" className="w-full bg-white border border-slate-200 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-(--primary)" value={camp.rev} onChange={(e) => {
                            const newC = [...campaigns];
                            newC[i].rev = e.target.value;
                            setCampaigns(newC);
                          }} />
                        </div>
                      </div>
                    </div>
                  ))}

                  {campaigns.length < 5 && (
                    <button
                      onClick={() => setCampaigns([...campaigns, { id: Date.now(), name: `Campaign ${String.fromCharCode(65 + campaigns.length)}`, spend: "", rev: "", color: PALETTE[campaigns.length % PALETTE.length] }])}
                      className="w-full py-4 border-2 border-dashed border-slate-200 bg-white rounded-2xl text-slate-500 font-bold hover:bg-slate-50 hover:text-(--primary) hover:border-(--primary)/50 transition-colors flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" /> Add Campaign
                    </button>
                  )}
                </div>

                <div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-6">
                    <h4 className="font-extrabold text-lg text-slate-800 mb-5 flex items-center gap-2">
                      <BarChart className="w-5 h-5 text-indigo-500" /> Comparison Results
                    </h4>

                    <div className="space-y-6">
                      {campaigns.map(camp => {
                        const roas = n(camp.spend) && n(camp.rev) ? n(camp.rev) / n(camp.spend) : 0;
                        const maxRoas = Math.max(...campaigns.map(c => (n(c.spend) && n(c.rev) ? n(c.rev) / n(c.spend) : 0)));
                        const isWinner = roas > 0 && roas === maxRoas;

                        return (
                          <div key={camp.id}>
                            <div className="flex justify-between items-end mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${camp.color}`}></div>
                                <span className={`font-bold text-sm ${isWinner ? "text-slate-900" : "text-slate-600"}`}>
                                  {camp.name} {isWinner && "🏆"}
                                </span>
                              </div>
                              <span className="font-black font-mono text-lg text-slate-800">{roas > 0 ? `${fmt(roas)}x` : "—"}</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${camp.color} rounded-full transition-all duration-500`}
                                style={{ width: maxRoas > 0 ? `${(roas / maxRoas) * 100}%` : "0%" }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: GUIDE */}
          {activeTab === "guide" && (
            <div className="animate-in fade-in duration-300 max-w-3xl">
              <h3 className="text-2xl font-bold text-slate-800 mb-6">Comprehensive Guide to ROAS</h3>

              <div className="prose prose-slate max-w-none">
                <p className="text-lg text-slate-600 mb-8">
                  <strong>ROAS (Return on Ad Spend)</strong> is one of the most important metrics in digital marketing. It measures the gross revenue generated for every dollar spent on advertising.
                </p>

                <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-6 mb-8">
                  <h4 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-(--primary)" /> The Formula
                  </h4>
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-center text-lg text-slate-700 mb-4">
                    ROAS = Total Campaign Revenue / Total Ad Spend
                  </div>
                  <p className="text-sm text-slate-600">
                    If you spend PLN 10,000 on ads and generate PLN 40,000 in sales, your ROAS is 4.0x (or 400%). This means you made PLN 4 for every PLN 1 spent on ads.
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8">
                  <h4 className="font-bold text-amber-900 text-lg mb-3 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-600" /> Break-Even ROAS
                  </h4>
                  <p className="text-sm text-amber-800 mb-4">
                    Knowing your ROAS is useless if you don't know your break-even point. A ROAS of 3.0x sounds great, but if your product margins are low, you might actually be losing money!
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-amber-900/80">
                    <li><strong>Gross Margin:</strong> (Selling Price - Cost of Goods) / Selling Price</li>
                    <li><strong>Break-Even ROAS =</strong> 1 / Gross Margin %</li>
                  </ul>
                  <p className="text-sm text-amber-800 mt-4 font-medium">
                    Example: If your margin is 25%, your break-even ROAS is 4.0x (1 / 0.25). You need a ROAS higher than 4.0x to make a profit.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
