"use client";

import React, { useState, useEffect } from "react";
import { Percent, CheckCircle2, RefreshCw, BarChart3, TrendingDown, DollarSign } from "lucide-react";

export default function ToolHome() {
  const [originalPrice, setOriginalPrice] = useState(100);
  const [discount1, setDiscount1] = useState(20);
  const [useStacked, setUseStacked] = useState(false);
  const [discount2, setDiscount2] = useState(10);
  const [taxRate, setTaxRate] = useState(8);

  const [finalPrice, setFinalPrice] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);

  useEffect(() => {
    let price = parseFloat(originalPrice) || 0;
    if (price < 0) price = 0;

    // Apply primary discount
    const discAmount1 = price * (discount1 / 100);
    let discountedPrice = price - discAmount1;

    // Apply stacked discount if checked
    let discAmount2 = 0;
    if (useStacked) {
      discAmount2 = discountedPrice * (discount2 / 100);
      discountedPrice -= discAmount2;
    }

    const saved = price - discountedPrice;

    // Apply tax
    const tax = discountedPrice * (taxRate / 100);
    const finalVal = discountedPrice + tax;

    setTotalSaved(Number(saved.toFixed(2)));
    setTaxAmount(Number(tax.toFixed(2)));
    setFinalPrice(Number(finalVal.toFixed(2)));
  }, [originalPrice, discount1, useStacked, discount2, taxRate]);

  // Compute breakdown bar proportions
  const totalBar = originalPrice > 0 ? originalPrice : 1;
  const savedPercent = originalPrice > 0 ? (totalSaved / totalBar) * 100 : 0;
  const paidPercent = originalPrice > 0 ? ((finalPrice - taxAmount) / totalBar) * 100 : 100;
  const taxPercent = originalPrice > 0 ? (taxAmount / totalBar) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <Percent className="h-5 w-5 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Discount Calculator
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Math, Finance
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Calculate savings on promotional prices. Supports stacked discounts (e.g. 20% + 10% off), custom sales tax margins, and proportional savings breakdowns.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Calculators", "Sales Tax", "Double Discount"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Input Panel - 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-border/60">
                <Percent size={14} className="text-primary" />
                Price & Promotion Configuration
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Original Price */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-bold text-foreground uppercase flex items-center gap-1">
                    <DollarSign size={14} className="text-primary" />
                    Original Item Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface-soft border border-border rounded-xl p-3 text-sm font-bold text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Primary Discount */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <span>Discount Rate</span>
                    <span className="text-primary font-mono">{discount1}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={discount1}
                    onChange={(e) => setDiscount1(parseInt(e.target.value))}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Tax Rate */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-foreground font-semibold">
                    <span>Sales Tax Rate</span>
                    <span className="text-primary font-mono">{taxRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseInt(e.target.value))}
                    className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

              </div>

              {/* Stacked Discount Check */}
              <div className="pt-4 border-t border-border mt-4 space-y-4">
                <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useStacked}
                    onChange={(e) => setUseStacked(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  Add Secondary Stacked Discount (e.g. 20% + additional 10% off)
                </label>

                {useStacked && (
                  <div className="space-y-1.5 bg-surface-soft p-4 rounded-xl border border-border/60 animate-fade-in">
                    <div className="flex justify-between text-xs text-foreground font-semibold">
                      <span>Secondary Discount Rate</span>
                      <span className="text-primary font-mono">{discount2}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={discount2}
                      onChange={(e) => setDiscount2(parseInt(e.target.value))}
                      className="w-full bg-border accent-primary h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Results breakdown panel - 5 Cols */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Display Results */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
              
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-3">
                <BarChart3 size={14} className="text-primary" />
                Financial Summary
              </span>

              {/* Final Price Display */}
              <div className="bg-surface-soft border border-border rounded-2xl p-5 text-center space-y-1 relative overflow-hidden group">
                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Final Price Paid</div>
                <div className="text-4xl font-black text-foreground font-mono">${finalPrice.toFixed(2)}</div>
                {totalSaved > 0 && (
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded-full inline-block mt-2">
                    Saving {Math.round((totalSaved / originalPrice) * 100)}% Overall
                  </div>
                )}
              </div>

              {/* Individual Details list */}
              <div className="space-y-3">
                
                {/* Original Price */}
                <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-surface-soft/60 border border-border/60">
                  <span className="text-muted-foreground">Original Price</span>
                  <span className="font-mono text-foreground">${originalPrice.toFixed(2)}</span>
                </div>

                {/* Total Saved */}
                <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/10">
                  <span className="text-teal-600 dark:text-teal-400 flex items-center gap-1"><TrendingDown size={14} /> Total Discount Savings</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">-${totalSaved.toFixed(2)}</span>
                </div>

                {/* Tax paid */}
                <div className="flex items-center justify-between text-xs font-semibold p-2.5 rounded-lg bg-surface-soft/60 border border-border/60">
                  <span className="text-muted-foreground">Sales Tax Amount</span>
                  <span className="font-mono text-foreground">+${taxAmount.toFixed(2)}</span>
                </div>

              </div>

              {/* Proportional breakdown bar */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider block">
                  Price Breakdown Proportions
                </span>
                
                {/* Bar */}
                <div className="h-4 w-full rounded-full overflow-hidden flex bg-border">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${paidPercent}%` }}
                    title={`Paid: ${paidPercent.toFixed(1)}%`}
                  />
                  <div
                    className="bg-teal-500/30 h-full transition-all duration-300"
                    style={{ width: `${savedPercent}%` }}
                    title={`Saved: ${savedPercent.toFixed(1)}%`}
                  />
                  <div
                    className="bg-accent-violet h-full transition-all duration-300"
                    style={{ width: `${taxPercent}%` }}
                    title={`Tax: ${taxPercent.toFixed(1)}%`}
                  />
                </div>

                {/* Bar Labels Legend */}
                <div className="flex flex-wrap gap-4 text-[9px] font-bold text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Paid Value</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-teal-500/30" /> Savings Value</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent-violet" /> Sales Tax</span>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
