// rent-buy-calc.jsx - Rent vs Buy Calculator (Memory Test UI Theme)
"use client";

import { useState } from 'react';
import {
  Home, Calculator, TrendingUp, TrendingDown, DollarSign,
  RotateCcw, Share2, Copy, Download, Target,
  Zap, Calendar, Percent, Banknote, Building,
  Car, Shield, Wrench, Clock, ArrowRight,
  CheckCircle2, AlertCircle, BarChart3, Play,
  Lightbulb, Users, Star, ChevronDown, Sparkles
} from 'lucide-react';

export default function RentBuyCalc({ toolConfig }) {
  const [showCalculator, setShowCalculator] = useState(false);

  const [propertyPrice, setPropertyPrice] = useState(5000000);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [loanInterestRate, setLoanInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [propertyAppreciation, setPropertyAppreciation] = useState(6);
  const [maintenanceCost, setMaintenanceCost] = useState(3000);
  const [propertyTax, setPropertyTax] = useState(10000);
  const [insurance, setInsurance] = useState(5000);
  const [registrationCharges, setRegistrationCharges] = useState(7);
  const [furnishingCost, setFurnishingCost] = useState(300000);
  const [monthlyRent, setMonthlyRent] = useState(20000);
  const [rentIncrement, setRentIncrement] = useState(5);
  const [securityDeposit, setSecurityDeposit] = useState(50000);
  const [investmentReturn, setInvestmentReturn] = useState(10);
  const [results, setResults] = useState(null);

  const formatINR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const formatINRShort = (value) => {
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value}`;
  };

  const calculateEMI = (principal, rate, years) => {
    const monthlyRate = rate / 12 / 100;
    const months = years * 12;
    if (monthlyRate === 0) return principal / months;
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(emi);
  };

  const calculateResults = () => {
    const downPayment = (propertyPrice * downPaymentPercent) / 100;
    const loanAmount = propertyPrice - downPayment;
    const emi = calculateEMI(loanAmount, loanInterestRate, loanTenure);
    const regCharges = (propertyPrice * registrationCharges) / 100;
    const totalYears = loanTenure;

    let totalBuyingCost = downPayment + regCharges + furnishingCost;
    for (let year = 1; year <= totalYears; year++) {
      for (let month = 1; month <= 12; month++) {
        const currentMonth = (year - 1) * 12 + month;
        if (currentMonth < totalYears * 12) totalBuyingCost += emi;
        totalBuyingCost += maintenanceCost + (propertyTax + insurance) / 12;
      }
    }

    const futurePropertyValue = propertyPrice * Math.pow(1 + propertyAppreciation / 100, totalYears);
    const netBuyingCost = totalBuyingCost - futurePropertyValue;

    let currentRent = monthlyRent;
    let totalRentCost = securityDeposit;
    let investmentValue = downPayment + regCharges + furnishingCost;

    for (let year = 1; year <= totalYears; year++) {
      for (let month = 1; month <= 12; month++) {
        totalRentCost += currentRent;
        const monthlySavings = Math.max(0, emi + maintenanceCost + (propertyTax + insurance) / 12 - currentRent);
        investmentValue += monthlySavings;
        investmentValue *= (1 + investmentReturn / 100 / 12);
      }
      currentRent *= (1 + rentIncrement / 100);
    }

    const netRentCost = totalRentCost - securityDeposit - investmentValue;

    setResults({
      downPayment, loanAmount, emi, regCharges,
      totalBuyingCost: Math.round(totalBuyingCost),
      futurePropertyValue: Math.round(futurePropertyValue),
      netBuyingCost: Math.round(netBuyingCost),
      totalRentCost: Math.round(totalRentCost),
      investmentValue: Math.round(investmentValue),
      netRentCost: Math.round(netRentCost),
      buyingBetter: netBuyingCost < netRentCost,
      savingsIfBuy: Math.round(Math.abs(netRentCost - netBuyingCost)),
    });

    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const resetAll = () => {
    setPropertyPrice(5000000); setDownPaymentPercent(20); setLoanInterestRate(8.5);
    setLoanTenure(20); setPropertyAppreciation(6); setMaintenanceCost(3000);
    setPropertyTax(10000); setInsurance(5000); setRegistrationCharges(7);
    setFurnishingCost(300000); setMonthlyRent(20000); setRentIncrement(5);
    setSecurityDeposit(50000); setInvestmentReturn(10); setResults(null);
    setShowCalculator(false);
  };

  // ==================== LANDING PAGE (Memory Test Style) ====================
  if (!results && !showCalculator) {
    return (
      <div className="min-h-screen bg-(--background) p-4 md:p-8">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Home className="w-12 h-12 text-(--primary)" />
              <h1 className="heading text-center">{toolConfig?.name || "Rent vs Buy Calculator"}</h1>
            </div>
            <p className="description">EMI + maintenance vs rent + opportunity cost — Make the right financial decision</p>
          </div>

          {/* Main Card */}
          <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="text-center max-w-3xl mx-auto">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-(--primary) rounded-full flex items-center justify-center mx-auto mb-6">
                    <Home className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-(--foreground) mb-4">
                    Should You Rent or Buy?
                  </h2>
                  <p className="text-lg text-(--muted-foreground) mb-6">
                    Compare every aspect — EMI, maintenance, rent increases, property appreciation, and opportunity cost.
                  </p>

                  <div className="bg-(--muted) border border-(--border) rounded-xl p-6 mb-8">
                    <h3 className="font-semibold text-(--foreground) mb-3">How it works:</h3>
                    <div className="space-y-2 text-left text-(--muted-foreground)">
                      <p>👀 <strong>Enter Details</strong> — Property price, loan info, rent, and costs</p>
                      <p>🧠 <strong>Calculate</strong> — EMI, future value, investment returns</p>
                      <p>📈 <strong>Compare</strong> — Side-by-side cost breakdown with verdict</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCalculator(true)}
                    className="btn-primary px-8 py-4 rounded-xl text-lg font-semibold inline-flex items-center gap-3 shadow-lg"
                  >
                    <Play className="w-6 h-6" /> Start Calculating
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-(--muted) rounded-xl p-4">
                  {[
                    { label: 'Time', value: '30 sec' },
                    { label: 'Factors', value: '12+' },
                    { label: 'Scenarios', value: 'Buy/Rent' },
                    { label: 'Free', value: 'Always' },
                  ].map((f, i) => (
                    <div key={i} className="text-center">
                      <div className="text-lg font-bold text-(--primary)">{f.value}</div>
                      <div className="text-xs text-(--muted-foreground)">{f.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== CALCULATOR & RESULTS ====================
  return (
    <div className="min-h-screen bg-(--background) p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Home className="w-12 h-12 text-(--primary)" />
            <h1 className="heading text-center">Rent vs Buy Calculator</h1>
          </div>
          <p className="description">EMI + maintenance vs rent + opportunity cost</p>
          {!showCalculator && (
            <button onClick={() => { setShowCalculator(true); setResults(null); }}
              className="mt-4 text-sm text-(--primary) hover:underline">
              ← Back to Calculator
            </button>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden mb-6">
          <div className="p-6 md:p-8 border-b border-(--border)">
            <h3 className="text-xl font-bold text-(--foreground) flex items-center gap-2 mb-6">
              <Building className="w-5 h-5 text-(--primary)" /> Property & Loan Details
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Property Price (₹)</label>
                <input type="number" value={propertyPrice} onChange={(e) => setPropertyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none" />
                <p className="text-xs text-(--muted-foreground) mt-1">{formatINRShort(propertyPrice)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Down Payment (%)</label>
                <div className="relative">
                  <input type="number" value={downPaymentPercent} onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)">%</span>
                </div>
                <p className="text-xs text-(--muted-foreground) mt-1">{formatINRShort(propertyPrice * downPaymentPercent / 100)}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Interest Rate (%)</label>
                <div className="relative">
                  <input type="number" value={loanInterestRate} onChange={(e) => setLoanInterestRate(parseFloat(e.target.value) || 0)} step="0.1"
                    className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Loan Tenure (Years)</label>
                <input type="number" value={loanTenure} onChange={(e) => setLoanTenure(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Appreciation (%/yr)</label>
                <div className="relative">
                  <input type="number" value={propertyAppreciation} onChange={(e) => setPropertyAppreciation(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Monthly Rent (₹)</label>
                <input type="number" value={monthlyRent} onChange={(e) => setMonthlyRent(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 border-b border-(--border)">
            <h3 className="text-xl font-bold text-(--foreground) flex items-center gap-2 mb-6">
              <Wrench className="w-5 h-5 text-orange-500" /> Additional Costs
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { label: 'Maintenance/Month (₹)', value: maintenanceCost, setter: setMaintenanceCost },
                { label: 'Property Tax/Year (₹)', value: propertyTax, setter: setPropertyTax },
                { label: 'Insurance/Year (₹)', value: insurance, setter: setInsurance },
                { label: 'Furnishing (₹)', value: furnishingCost, setter: setFurnishingCost },
              ].map((field, i) => (
                <div key={i}>
                  <label className="block text-sm font-semibold text-(--foreground) mb-1">{field.label}</label>
                  <input type="number" value={field.value} onChange={(e) => field.setter(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Registration (%)</label>
                <div className="relative">
                  <input type="number" value={registrationCharges} onChange={(e) => setRegistrationCharges(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Rent Increase (%/yr)</label>
                <div className="relative">
                  <input type="number" value={rentIncrement} onChange={(e) => setRentIncrement(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)">%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Investment Return (%/yr)</label>
                <div className="relative">
                  <input type="number" value={investmentReturn} onChange={(e) => setInvestmentReturn(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)">%</span>
                </div>
                <p className="text-xs text-(--muted-foreground) mt-1">Return on savings if you rent</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-(--foreground) mb-1">Security Deposit (₹)</label>
                <input type="number" value={securityDeposit} onChange={(e) => setSecurityDeposit(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-(--background) border-2 border-(--border) rounded-xl text-(--foreground) font-semibold focus:border-(--primary) focus:outline-none" />
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 flex gap-3">
            <button onClick={calculateResults} className="btn-primary px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-3 shadow-xl">
              <Calculator className="w-5 h-5" /> Calculate
            </button>
            <button onClick={resetAll} className="btn-secondary px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-3">
              <RotateCcw className="w-5 h-5" /> Reset
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div id="results-section" className="bg-(--card) border border-(--border) rounded-3xl shadow-xl overflow-hidden">

            <div className={`p-6 md:p-10 text-center ${results.buyingBetter ? 'bg-green-500' : 'bg-blue-500'}`}>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
                {results.buyingBetter ? 'Buying is Better!' : 'Renting is Better!'}
              </h2>
              <p className="text-white/80 text-lg">
                You could save {formatINR(results.savingsIfBuy)} over {loanTenure} years
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 md:p-8">
              <div className="bg-(--muted) rounded-xl p-4 text-center">
                <p className="text-xs text-(--muted-foreground) mb-1">Monthly EMI</p>
                <p className="text-xl font-black text-(--foreground)">{formatINR(results.emi)}</p>
              </div>
              <div className="bg-(--muted) rounded-xl p-4 text-center">
                <p className="text-xs text-(--muted-foreground) mb-1">Down Payment</p>
                <p className="text-xl font-black text-(--foreground)">{formatINR(results.downPayment)}</p>
              </div>
              <div className="bg-(--muted) rounded-xl p-4 text-center">
                <p className="text-xs text-(--muted-foreground) mb-1">Future Property Value</p>
                <p className="text-xl font-black text-green-600">{formatINR(results.futurePropertyValue)}</p>
              </div>
              <div className="bg-(--muted) rounded-xl p-4 text-center">
                <p className="text-xs text-(--muted-foreground) mb-1">Investment Value (if Rent)</p>
                <p className="text-xl font-black text-blue-600">{formatINR(results.investmentValue)}</p>
              </div>
            </div>

            <div className="p-6 md:p-8 border-t border-(--border)">
              <h3 className="text-xl font-bold text-(--foreground) mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-(--primary)" /> Cost Comparison
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-(--border)">
                      <th className="text-left py-3 px-4 font-semibold text-(--foreground)">Particulars</th>
                      <th className="text-center py-3 px-4 font-semibold text-green-600">🏠 Buying</th>
                      <th className="text-center py-3 px-4 font-semibold text-blue-600">🏢 Renting</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-(--border)">
                    <tr><td className="py-3 px-4">Initial Payment</td><td className="text-center py-3 px-4 font-semibold">{formatINR(results.downPayment + results.regCharges + furnishingCost)}</td><td className="text-center py-3 px-4 font-semibold">{formatINR(securityDeposit)}</td></tr>
                    <tr><td className="py-3 px-4">Monthly Cost</td><td className="text-center py-3 px-4 font-semibold">{formatINR(results.emi)}</td><td className="text-center py-3 px-4 font-semibold">{formatINR(monthlyRent)}</td></tr>
                    <tr><td className="py-3 px-4">Maintenance/Month</td><td className="text-center py-3 px-4 text-red-500">{formatINR(maintenanceCost)}</td><td className="text-center py-3 px-4 text-green-500">₹0</td></tr>
                    <tr><td className="py-3 px-4">Tax + Insurance/Month</td><td className="text-center py-3 px-4 text-red-500">{formatINR(Math.round((propertyTax + insurance) / 12))}</td><td className="text-center py-3 px-4 text-green-500">₹0</td></tr>
                    <tr><td className="py-3 px-4">Total Cost ({loanTenure} years)</td><td className="text-center py-3 px-4 font-bold text-red-600">{formatINR(results.totalBuyingCost)}</td><td className="text-center py-3 px-4 font-bold text-red-600">{formatINR(results.totalRentCost)}</td></tr>
                    <tr><td className="py-3 px-4">Asset/Investment Value</td><td className="text-center py-3 px-4 font-bold text-green-600">+{formatINR(results.futurePropertyValue)}</td><td className="text-center py-3 px-4 font-bold text-green-600">+{formatINR(results.investmentValue)}</td></tr>
                    <tr className="bg-(--primary)/5 border-t-2 border-(--primary)"><td className="py-4 px-4 font-black text-lg">NET COST</td><td className={`text-center py-4 px-4 font-black text-lg ${results.buyingBetter ? 'text-green-600' : 'text-red-600'}`}>{formatINR(results.netBuyingCost)}</td><td className={`text-center py-4 px-4 font-black text-lg ${!results.buyingBetter ? 'text-green-600' : 'text-red-600'}`}>{formatINR(results.netRentCost)}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
