

import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Calculator, Download, TrendingDown, DollarSign, Calendar, Percent } from 'lucide-react';
import Description from "../components/Description";

export default function ToolHome() {
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [tenure, setTenure] = useState(20);
  const [prepayment, setPrepayment] = useState(0);
  const [prepaymentMonth, setPrepaymentMonth] = useState(12);
  const [income, setIncome] = useState(50000);
  const [activeTab, setActiveTab] = useState('calculator');

  const calculations = useMemo(() => {
    const P = loanAmount;
    const r = interestRate / 12 / 100;
    const n = tenure * 12;
    
    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - P;
    
    // Amortization schedule
    let balance = P;
    const schedule = [];
    let totalPrincipalPaid = 0;
    let totalInterestPaid = 0;
    
    for (let month = 1; month <= n; month++) {
      const interestPayment = balance * r;
      const principalPayment = emi - interestPayment;
      
      // Apply prepayment
      if (month === prepaymentMonth && prepayment > 0) {
        balance -= prepayment;
      }
      
      balance -= principalPayment;
      totalPrincipalPaid += principalPayment;
      totalInterestPaid += interestPayment;
      
      if (balance < 0) balance = 0;
      
      schedule.push({
        month,
        emi: emi,
        principal: principalPayment,
        interest: interestPayment,
        balance: Math.max(0, balance),
        totalPrincipal: totalPrincipalPaid,
        totalInterest: totalInterestPaid
      });
      
      if (balance <= 0) break;
    }
    
    // Calculate with prepayment impact
    const savedInterest = prepayment > 0 ? totalInterest - totalInterestPaid : 0;
    const reducedMonths = prepayment > 0 ? n - schedule.length : 0;
    
    return {
      emi: Math.round(emi),
      totalAmount: Math.round(totalAmount),
      totalInterest: Math.round(totalInterest),
      schedule,
      savedInterest: Math.round(savedInterest),
      reducedMonths: Math.round(reducedMonths)
    };
  }, [loanAmount, interestRate, tenure, prepayment, prepaymentMonth]);

  const pieData = [
    { name: 'Principal', value: loanAmount, color: '#3b82f6' },
    { name: 'Interest', value: calculations.totalInterest, color: '#ef4444' }
  ];

  const yearlyData = useMemo(() => {
    const data = [];
    for (let year = 1; year <= Math.min(tenure, 10); year++) {
      const yearSchedule = calculations.schedule.slice((year - 1) * 12, year * 12);
      const yearPrincipal = yearSchedule.reduce((sum, m) => sum + m.principal, 0);
      const yearInterest = yearSchedule.reduce((sum, m) => sum + m.interest, 0);
      
      data.push({
        year: `Year ${year}`,
        Principal: Math.round(yearPrincipal),
        Interest: Math.round(yearInterest)
      });
    }
    return data;
  }, [calculations, tenure]);

  const affordabilityRatio = (calculations.emi / income * 100).toFixed(1);
  const isAffordable = affordabilityRatio <= 50;

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  const downloadReport = () => {
    const reportData = `
 Loan EMI Calculator - Report
=====================================

Loan Details:
-------------
Loan Amount: ${formatCurrency(loanAmount)}
Interest Rate: ${interestRate}% p.a.
Tenure: ${tenure} years (${tenure * 12} months)

EMI Breakdown:
--------------
Monthly EMI: ${formatCurrency(calculations.emi)}
Total Amount Payable: ${formatCurrency(calculations.totalAmount)}
Total Interest: ${formatCurrency(calculations.totalInterest)}

Affordability Analysis:
----------------------
Monthly Income: ${formatCurrency(income)}
EMI/Income Ratio: ${affordabilityRatio}%
Status: ${isAffordable ? 'Affordable' : 'High EMI Burden'}

${prepayment > 0 ? `Prepayment Impact:
-------------------
Prepayment Amount: ${formatCurrency(prepayment)}
Prepayment Month: ${prepaymentMonth}
Interest Saved: ${formatCurrency(calculations.savedInterest)}
Tenure Reduced: ${calculations.reducedMonths} months
` : ''}

Amortization Schedule (First 12 months):
-----------------------------------------
${calculations.schedule.slice(0, 12).map(m => 
  `Month ${m.month}: EMI: ${formatCurrency(m.emi)} | Principal: ${formatCurrency(m.principal)} | Interest: ${formatCurrency(m.interest)} | Balance: ${formatCurrency(m.balance)}`
).join('\n')}

Generated on: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan-emi-report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen  p-4 sm:p-6 bg-(--background)">
      <div className="max-w-7xl mx-auto">
      
          {/* Header */}
 
           
              <h1 className="heading text-center pt-5 animate-fade-up "> Loan EMI Calculator</h1>
            
            <p className="description text-center animate-fade-up mb-5">Smart financial planning for your loan decisions</p>
          



          <div className=" p-6 sm:p-8 ">
           

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {['calculator', 'breakdown', 'schedule', 'comparison'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-(--foreground) hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'calculator' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-(--foreground) mb-4">Loan Parameters</h2>
                  
                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="font-medium text-(--foreground)">Loan Amount</span>
                      <span className="text-blue-600 font-semibold">{formatCurrency(loanAmount)}</span>
                    </label>
                    <input
                      type="range"
                      min="100000"
                      max="10000000"
                      step="50000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-(--foreground) mt-1">
                      <span>₹1L</span>
                      <span>₹1Cr</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="font-medium text-(--foreground)">Interest Rate (% p.a.)</span>
                      <span className="text-blue-600 font-semibold">{interestRate}%</span>
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="20"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-(--foreground) mt-1">
                      <span>5%</span>
                      <span>20%</span>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center justify-between mb-2">
                      <span className="font-medium text-(--foreground)">Loan Tenure (Years)</span>
                      <span className="text-blue-600 font-semibold">{tenure} years</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      step="1"
                      value={tenure}
                      onChange={(e) => setTenure(Number(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-(--foreground) mt-1">
                      <span>1 year</span>
                      <span>30 years</span>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-bold text-(--foreground) mb-4">Prepayment (Optional)</h3>
                    
                    <div>
                      <label className="flex items-center justify-between mb-2">
                        <span className="font-medium text-(--foreground)">Prepayment Amount</span>
                        <span className="text-blue-500 font-semibold">{formatCurrency(prepayment)}</span>
                      </label>
                      <input
                        type="range"
                        min="0"
                        max={loanAmount / 2}
                        step="10000"
                        value={prepayment}
                        onChange={(e) => setPrepayment(Number(e.target.value))}
                        className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-400"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="flex items-center justify-between mb-2">
                        <span className="font-medium text-(--foreground)">Prepayment at Month</span>
                        <span className="text-blue-500 font-semibold">Month {prepaymentMonth}</span>
                      </label>
                      <input
                        type="range"
                        min="1"
                        max={tenure * 12}
                        step="1"
                        value={prepaymentMonth}
                        onChange={(e) => setPrepaymentMonth(Number(e.target.value))}
                        className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-400"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="font-bold text-(--foreground) mb-4">Affordability Check</h3> 
                    
                    <div>
                      <label className="flex items-center justify-between mb-2">
                        <span className="font-medium text-(--foreground)">Monthly Income</span>
                        <span className="text-blue-600 font-semibold">{formatCurrency(income)}</span>
                      </label>
                      <input
                        type="range"
                        min="10000"
                        max="500000"
                        step="5000"
                        value={income}
                        onChange={(e) => setIncome(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div className={`mt-4 p-4 rounded-lg ${isAffordable ? 'bg-(--backgeound) border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-(--foreground)">EMI/Income Ratio</span>
                        <span className={`font-bold text-lg ${isAffordable ? 'text-blue-600' : 'text-red-600'}`}>
                          {affordabilityRatio}%
                        </span>
                      </div>
                      <p className={`text-sm mt-2 ${isAffordable ? 'text-blue-700' : 'text-red-700'}`}>
                        {isAffordable ? '✓ Loan is affordable (below 50% of income)' : '⚠ High EMI burden (above 50% of income)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-(--foreground) mb-4">EMI Breakdown</h2>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-(--card) p-6 rounded-xl text-(--foreground) shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5" />
                        <span className="text-sm opacity-90">Monthly EMI</span>
                      </div>
                      <div className="text-3xl font-bold">{formatCurrency(calculations.emi)}</div>
                    </div>

                    <div className="bg-(--card) p-6 rounded-xl text-(--foreground) shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Percent className="w-5 h-5" />
                        <span className="text-sm opacity-90">Total Interest</span>
                      </div>
                      <div className="text-3xl font-bold">{formatCurrency(calculations.totalInterest)}</div>
                    </div>

                    <div className="bg-(--card) p-6 rounded-xl text-(--foreground) shadow-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5" />
                        <span className="text-sm opacity-90">Total Amount Payable</span>
                      </div>
                      <div className="text-3xl font-bold">{formatCurrency(calculations.totalAmount)}</div>
                    </div>
                  </div>

                  {prepayment > 0 && (
                    <div className="bg-(--background) border-2 border-blue-200 p-6 rounded-xl">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingDown className="w-6 h-6 text-blue-600" />
                        <h3 className="font-bold text-(--foreground)">Prepayment Impact</h3>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-(--foreground)">Interest Saved</span>
                          <span className="font-bold text-blue-600">{formatCurrency(calculations.savedInterest)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-(--foreground)">Tenure Reduced</span>
                          <span className="font-bold text-blue-600">{calculations.reducedMonths} months</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="h-64 overflow-hidden">
                    <PieChart width={360} height={256} className="mx-auto max-w-full">
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </div>

                  <button
                    onClick={downloadReport}
                    className="w-full bg-(--primary) text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    Download Report
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-(--foreground)">Yearly Payment Breakdown</h2>
                <div className="overflow-x-auto">
                  <BarChart width={760} height={384} data={yearlyData} className="max-w-full">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Principal" fill="#3b82f6" />
                    <Bar dataKey="Interest" fill="#ef4444" />
                  </BarChart>
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-(--foreground)">Amortization Schedule</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-(--background) text-(--foreground)">
                        <th className="border border-gray-300 p-3 text-left">Month</th>
                        <th className="border border-gray-300 p-3 text-right">EMI</th>
                        <th className="border border-gray-300 p-3 text-right">Principal</th>
                        <th className="border border-gray-300 p-3 text-right">Interest</th>
                        <th className="border border-gray-300 p-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.schedule.slice(0, 24).map((row) => (
                        <tr key={row.month} className=" bg-(--background) text-(--foreground) ">
                          <td className="border border-gray-300 p-3">{row.month}</td>
                          <td className="border border-gray-300 p-3 text-right">{formatCurrency(row.emi)}</td>
                          <td className="border border-gray-300 p-3 text-right text-blue-600">{formatCurrency(row.principal)}</td>
                          <td className="border border-gray-300 p-3 text-right text-red-600">{formatCurrency(row.interest)}</td>
                          <td className="border border-gray-300 p-3 text-right font-semibold">{formatCurrency(row.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {calculations.schedule.length > 24 && (
                    <p className="text-gray-500 text-sm mt-4">Showing first 24 months of {calculations.schedule.length} total months</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'comparison' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-(--foreground)">Loan Comparison</h2>
                <div className=" p-6 rounded-lg">
                  <p className="text-(--foreground)">
                    This feature allows you to compare multiple loan options. Adjust the parameters in the calculator tab to see how different loan amounts, interest rates, and tenures affect your EMI and total cost.
                  </p>
                  <div className="mt-4 grid sm:grid-cols-3 gap-4">
                    <div className="bg-(--card) p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-(--foreground) mb-2">Current Scenario</h3>
                      <p className="text-sm text-(--foreground)">EMI: {formatCurrency(calculations.emi)}</p>
                      <p className="text-sm text-(--foreground)">Total: {formatCurrency(calculations.totalAmount)}</p>
                      
                    </div>
                    <div className="bg-(--card) p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-(--foreground) mb-2">Lower Rate (-1%)</h3>
                      <p className="text-sm text-(--foreground)">Potential savings in total interest</p>
                    </div>
                    <div className="bg-(--card) p-4 rounded-lg shadow">
                      <h3 className="font-semibold text-(--foreground) mb-2">Shorter Tenure</h3>
                      <p className="text-sm text-(--foreground)">Higher EMI but less total interest</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Description Section */}
      <Description />
    </div>
    
  );
}
