"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  CircleDollarSign,
  Plus,
  Trash2,
  TrendingDown,
  ShoppingCart,
  Zap,
  Info,
  ChevronRight,
  RefreshCw,
  Tag,
  CreditCard,
  Wallet,
  ArrowRightLeft,
  Share2,
  Check,
  History,
  Settings,
  HelpCircle,
  Percent,
  Gift,
  BadgePercent,
  Calculator,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  calculateEffectiveSavings,
  formatCurrency,
  formatPercent
} from "./utils/calculatorLogic";

// --- Shared Components ---

const GlassCard = ({ children, title, icon: Icon, className = "", delay = 0, headerActions }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={`bg-(--card) border border-(--border) rounded-3xl p-5 md:p-6 backdrop-blur-md shadow-xl hover:border-blue-500/30 transition-all break-words ${className}`}
  >
    {title && (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500">
            {Icon && <Icon size={20} />}
          </div>
          <h3 className="text-lg font-bold text-(--foreground)">{title}</h3>
        </div>
        {headerActions}
      </div>
    )}
    {children}
  </motion.div>
);

const Header = () => {
  const [text, setText] = useState("");
  const fullText = "Discount Stacking Calculator";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-12"
    >
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-500 text-[11px] font-bold uppercase tracking-wider mb-6">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Smart Savings Optimizer Active
      </div>
      <h1 className="heading !text-4xl sm:!text-5xl md:!text-7xl font-black mb-4 tracking-tight">
        {text}
      </h1>
      <p className="description text-base md:text-xl opacity-80 max-w-2xl mx-auto">
        Stack coupons, bank offers, and cashback to find your true effective price. Don't just shop—optimize.
      </p>
    </motion.div>
  );
};

// --- Main App ---

export default function DiscountStackingCalculator() {
  const [basePrice, setBasePrice] = useState(1000);
  const [taxRate, setTaxRate] = useState(0);
  const [shipping, setShipping] = useState(0);
  
  const [discounts, setDiscounts] = useState([
    { id: 1, name: "Seasonal Sale", type: "percentage", value: 10 },
    { id: 2, name: "WELCOME50", type: "flat", value: 50 }
  ]);

  const [cardOffers, setCardOffers] = useState([
    { id: 'none', name: 'No Card Offer', type: 'flat', value: 0 },
    { id: 'bank_a', name: 'Elite Bank CC', type: 'percentage', value: 10, maxDiscount: 250 },
    { id: 'bank_b', name: 'UPI Instant Pay', type: 'flat', value: 100 }
  ]);
  const [selectedCardId, setSelectedCardId] = useState('none');

  const [cashbackRate, setCashbackRate] = useState(5);
  const [walletCashback, setWalletCashback] = useState(0);

  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [currency, setCurrency] = useState("USD");

  // Load history
  useEffect(() => {
    const saved = localStorage.getItem("discount_stacking_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("discount_stacking_history", JSON.stringify(history));
  }, [history]);

  const selectedCard = useMemo(() => 
    cardOffers.find(c => c.id === selectedCardId) || cardOffers[0]
  , [selectedCardId, cardOffers]);

  const results = useMemo(() => {
    return calculateEffectiveSavings({
      originalPrice: basePrice,
      taxRate: taxRate,
      shippingCharges: shipping,
      discounts: discounts,
      cardOffer: selectedCardId === 'none' ? null : selectedCard,
      cashbackRate: cashbackRate,
      walletCashback: walletCashback
    });
  }, [basePrice, taxRate, shipping, discounts, selectedCardId, selectedCard, cashbackRate, walletCashback]);

  const handleAddDiscount = () => {
    setDiscounts([...discounts, { id: Date.now(), name: "New Discount", type: "percentage", value: 5 }]);
  };

  const removeDiscount = (id) => {
    setDiscounts(discounts.filter(d => d.id !== id));
  };

  const updateDiscount = (id, field, value) => {
    setDiscounts(discounts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const saveToHistory = useCallback(() => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleTimeString(),
      price: results.effectiveFinalPrice,
      savings: results.effectiveSavingsPercentage,
      base: basePrice
    };
    setHistory(prev => [entry, ...prev].slice(0, 5));
    setToastMsg("Calculation Saved");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results, basePrice]);

  const handleCopyReport = () => {
    const text = `Savings Optimization Report:\nOriginal: ${formatCurrency(results.initialBase)}\nFinal Payable: ${formatCurrency(results.payableAmount)}\nEffective Price: ${formatCurrency(results.effectiveFinalPrice)}\nTotal Savings: ${formatPercent(results.effectiveSavingsPercentage)}`;
    navigator.clipboard.writeText(text);
    setToastMsg("Report Copied");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetSession = () => {
    setBasePrice(1000);
    setTaxRate(0);
    setShipping(0);
    setDiscounts([]);
    setSelectedCardId('none');
    setCashbackRate(0);
    setWalletCashback(0);
  };

  return (
    <div className="min-h-screen bg-(--background) px-4 py-12 font-secondary selection:bg-primary/30">
      <div className="max-w-[1400px] mx-auto">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Inputs */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Price Config */}
            <GlassCard title="Product Details" icon={ShoppingCart}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Original Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                    <input
                      type="number"
                      value={basePrice}
                      onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                      className="w-full bg-(--background) border border-(--border) rounded-xl pl-8 pr-4 py-3 text-sm font-mono focus:border-blue-500/50 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Tax (%)</label>
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Shipping</label>
                    <input
                      type="number"
                      value={shipping}
                      onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                      className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500/50 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Discount Stacking */}
            <GlassCard 
              title="Discount Stacking" 
              icon={Tag}
              headerActions={
                <button 
                  onClick={handleAddDiscount}
                  className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-all"
                >
                  <Plus size={16} />
                </button>
              }
            >
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {discounts.map((discount, idx) => (
                    <motion.div 
                      key={discount.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-2xl bg-(--background) border border-(--border) space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <input
                          type="text"
                          value={discount.name}
                          onChange={(e) => updateDiscount(discount.id, 'name', e.target.value)}
                          className="bg-transparent border-none p-0 text-xs font-bold text-(--foreground) focus:ring-0 outline-none w-2/3"
                        />
                        <button onClick={() => removeDiscount(discount.id)} className="text-red-500/50 hover:text-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center bg-(--card) rounded-lg border border-(--border) overflow-hidden">
                          <input
                            type="number"
                            value={discount.value}
                            onChange={(e) => updateDiscount(discount.id, 'value', parseFloat(e.target.value) || 0)}
                            className="w-full bg-transparent border-none px-3 py-1.5 text-xs font-mono focus:ring-0 outline-none"
                          />
                          <button 
                            onClick={() => updateDiscount(discount.id, 'type', discount.type === 'percentage' ? 'flat' : 'percentage')}
                            className="px-2 py-1.5 bg-blue-500/10 text-blue-500 border-l border-(--border)"
                          >
                            {discount.type === 'percentage' ? <Percent size={12} /> : <span className="text-[10px] font-bold">$</span>}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {discounts.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-[10px] uppercase font-bold tracking-widest opacity-50">
                    No discounts added
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Cashback & Rewards */}
            <GlassCard title="Cashback & Rewards" icon={Wallet}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Percentage Cashback (%)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="0.5"
                      value={cashbackRate}
                      onChange={(e) => setCashbackRate(parseFloat(e.target.value))}
                      className="flex-1 h-1.5 bg-blue-500/20 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-xs font-mono font-bold text-blue-500 w-12 text-right">{cashbackRate}%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">Flat Wallet Cashback</label>
                  <input
                    type="number"
                    value={walletCashback}
                    onChange={(e) => setWalletCashback(parseFloat(e.target.value) || 0)}
                    className="w-full bg-(--background) border border-(--border) rounded-xl px-4 py-3 text-sm font-mono focus:border-blue-500/50 outline-none transition-colors"
                  />
                </div>
              </div>
            </GlassCard>

            {/* Config & Stats */}
            <GlassCard title="Optimization Stats" icon={Settings}>
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Savings Efficiency</span>
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-blue-500/10 text-blue-500">
                    {results.effectiveSavingsPercentage > 20 ? 'HIGH' : 'MODERATE'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-(--background) rounded-full overflow-hidden border border-(--border)">
                  <motion.div
                    className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(results.effectiveSavingsPercentage, 100)}%` }}
                  />
                </div>
                <button
                  onClick={resetSession}
                  className="w-full py-3 px-3 rounded-xl bg-(--background) border border-red-500/30 text-red-500 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  <span>Reset All Offers</span>
                </button>
              </div>
            </GlassCard>

          </div>

          {/* Right Side: Dashboard */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Main Result Dashboard */}
            <GlassCard className="relative overflow-hidden group border-blue-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />
              
              <div className="relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1">Effective Final Price</div>
                    <div className="text-5xl md:text-6xl font-mono font-black text-(--foreground) tracking-tighter">
                      {formatCurrency(results.effectiveFinalPrice)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="px-4 py-2 rounded-2xl bg-green-500/10 border border-green-500/20">
                      <div className="text-[8px] font-black text-green-500 uppercase">You Save</div>
                      <div className="text-lg font-mono font-bold text-green-500">{formatCurrency(results.absoluteTotalSavings)}</div>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                      <div className="text-[8px] font-black text-blue-500 uppercase">Saving Score</div>
                      <div className="text-lg font-mono font-bold text-blue-500">{results.effectiveSavingsPercentage.toFixed(1)}%</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={saveToHistory}
                      className="px-6 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/30 hover:scale-[1.02] transition-all flex items-center gap-2"
                    >
                      <History size={16} />
                      Save Calc
                    </button>
                    <button 
                      onClick={handleCopyReport}
                      className="px-6 py-3 rounded-2xl bg-(--background) border border-(--border) text-(--foreground) font-black text-xs uppercase tracking-widest hover:border-blue-500/50 transition-all flex items-center gap-2"
                    >
                      <Share2 size={16} />
                      Share
                    </button>
                  </div>
                </div>

                <div className="bg-blue-500/5 rounded-3xl p-6 border border-blue-500/10 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                    <Calculator size={14} /> Price Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Base + Tax + Ship</span>
                      <span className="font-mono font-bold text-(--foreground)">{formatCurrency(results.initialBase)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Stacked Discounts</span>
                      <span className="font-mono font-bold text-red-400">-{formatCurrency(results.totalSavings)}</span>
                    </div>
                    <div className="pt-2 border-t border-(--border) flex justify-between text-sm font-bold">
                      <span className="text-(--foreground)">Payable Amount</span>
                      <span className="font-mono text-blue-500">{formatCurrency(results.payableAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs italic">
                      <span className="text-muted-foreground">Potential Cashback</span>
                      <span className="font-mono font-bold text-green-500">+{formatCurrency(results.totalCashback)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Offer Comparison Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card Selection */}
              <GlassCard title="Bank/Card Offers" icon={CreditCard}>
                <div className="space-y-3">
                  {cardOffers.map(card => (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`w-full p-4 rounded-2xl border transition-all text-left group relative overflow-hidden ${
                        selectedCardId === card.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                        : 'bg-(--background) border-(--border) text-muted-foreground hover:border-blue-500/30'
                      }`}
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div>
                          <div className={`text-[10px] font-black uppercase tracking-wider ${selectedCardId === card.id ? 'text-blue-100' : 'text-muted-foreground'}`}>
                            {card.type === 'percentage' ? `${card.value}% Instant Off` : `$${card.value} Flat Off`}
                          </div>
                          <div className={`text-sm font-bold ${selectedCardId === card.id ? 'text-white' : 'text-(--foreground)'}`}>{card.name}</div>
                        </div>
                        {selectedCardId === card.id && <Check size={18} className="text-white" />}
                      </div>
                      {card.maxDiscount && (
                        <div className={`mt-2 text-[8px] font-bold uppercase ${selectedCardId === card.id ? 'text-blue-200' : 'text-muted-foreground'}`}>
                          Max Discount: {formatCurrency(card.maxDiscount)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </GlassCard>

              {/* Smart Comparison Recommendation */}
              <GlassCard title="Savings Insight" icon={Zap}>
                <div className="flex flex-col justify-between space-y-4">
                  <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-500">
                        <Gift size={20} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Best Deal Strategy</div>
                        <div className="text-sm font-bold text-(--foreground)">Stacking Hierarchy</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold shrink-0">1</div>
                        <span className="text-muted-foreground truncate">Apply Sale Discount first</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold shrink-0">2</div>
                        <span className="text-muted-foreground truncate">Add Coupon Code WELCOME50</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold shrink-0">3</div>
                        <span className="text-muted-foreground truncate">Pay with {selectedCard.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-black text-blue-500 uppercase mb-1">Effective Savings</div>
                      <div className="text-2xl font-mono font-black text-blue-500">
                        {results.effectiveSavingsPercentage >= 100 ? "100" : results.effectiveSavingsPercentage.toFixed(1)}%
                      </div>
                    </div>
                    <motion.div 
                      animate={results.effectiveSavingsPercentage >= 100 ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : { scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${results.effectiveSavingsPercentage >= 100 ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}
                    >
                      {results.effectiveSavingsPercentage >= 100 ? <BadgePercent size={24} /> : <TrendingDown size={24} />}
                    </motion.div>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* History Table */}
            <GlassCard title="Recent Calculations" icon={History}>
              <div className="space-y-4">
                {history.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-(--border)">
                          <th className="pb-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Date</th>
                          <th className="pb-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Base</th>
                          <th className="pb-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Savings</th>
                          <th className="pb-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Final Price</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--border)">
                        {history.map(item => (
                          <tr key={item.id} className="group hover:bg-blue-500/5 transition-colors">
                            <td className="py-4 text-xs font-medium text-muted-foreground">{item.date}</td>
                            <td className="py-4 text-xs font-mono text-(--foreground)">{formatCurrency(item.base)}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black">
                                {item.savings.toFixed(1)}% OFF
                              </span>
                            </td>
                            <td className="py-4 text-xs font-mono font-black text-blue-500 text-right">{formatCurrency(item.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 opacity-50">
                    <BadgePercent size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No recent history</p>
                  </div>
                )}
              </div>
            </GlassCard>

          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-20">
          {[
            { icon: BadgePercent, title: "Stacking Logic", desc: "Our engine follows standard retail priority: Sale → Coupon → Card → Cashback." },
            { icon: ArrowRightLeft, title: "Effective vs Payable", desc: "Distinguish between what you pay at checkout and your final cost after rewards." },
            { icon: Zap, title: "Optimized Path", desc: "Instantly compare multiple bank offers to find the highest discount threshold." }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-(--card) border border-(--border) rounded-3xl p-6 hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <item.icon size={24} />
              </div>
              <h3 className="text-lg font-bold mb-2 text-(--foreground)">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="pt-20 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-(--foreground)">Shopping Intelligence FAQ</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="space-y-3">
              <h4 className="font-bold text-blue-500 flex items-center gap-2">
                <HelpCircle size={18} /> What is "Discount Stacking"?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stacking is the process of applying multiple distinct offers to a single purchase. Most retailers allow one coupon plus one bank offer on top of an existing sale price.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-blue-500 flex items-center gap-2">
                <HelpCircle size={18} /> Why is the stacking order important?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Percentage discounts applied earlier result in larger absolute savings since they act on a higher base price. Our calculator uses the most common retail sequence.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Notifications */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-blue-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl z-50 flex items-center gap-2"
          >
            <Check size={14} />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
