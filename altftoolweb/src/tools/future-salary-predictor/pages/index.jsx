"use client";

import { useState } from "react";
import { TrendingUp, Calculator, DollarSign } from "lucide-react";
import { calculateSalaryProjection } from "../utils/salaryLogic";
import { Button } from "@altftool/ui";

export default function FutureSalaryPredictor() {
  const [currentSalary, setCurrentSalary] = useState("50000");
  const [increment, setIncrement] = useState("5");
  const [years, setYears] = useState("10");
  const [result, setResult] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const parsedSalary = parseFloat(currentSalary);
    const parsedIncrement = parseFloat(increment);
    const parsedYears = parseInt(years, 10);

    if (isNaN(parsedSalary) || isNaN(parsedIncrement) || isNaN(parsedYears)) return;
    if (parsedSalary <= 0 || parsedYears <= 0) return;

    setResult(calculateSalaryProjection(parsedSalary, parsedIncrement, Math.min(parsedYears, 50)));
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <div className="text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
          <TrendingUp className="h-4 w-4" />
          Finance & Career
        </div>
        <h1 className="tool-heading-accent text-3xl font-bold sm:text-5xl mb-4">
          Future Salary Predictor
        </h1>
        <p className="text-[var(--muted-foreground)] text-lg max-w-2xl mx-auto">
          Project your long-term earnings and salary growth over time based on your expected annual raise.
        </p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Input Form */}
        <div className="bg-[var(--card)] p-6 sm:p-8 rounded-2xl shadow-sm border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-5 w-5 text-[var(--primary)]" />
            <h2 className="text-xl font-bold text-[var(--foreground)]">Calculate Growth</h2>
          </div>

          <form onSubmit={handleCalculate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Current Annual Salary
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <DollarSign className="h-5 w-5 text-[var(--muted-foreground)]" />
                </div>
                <input
                  type="number"
                  min="1"
                  required
                  value={currentSalary}
                  onChange={(e) => setCurrentSalary(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-11 pr-4 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                  placeholder="e.g. 50000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Expected Annual Raise (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={increment}
                  onChange={(e) => setIncrement(e.target.value)}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-3 pl-4 pr-10 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                  placeholder="e.g. 5"
                />
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                  <span className="text-[var(--muted-foreground)] font-medium">%</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Years to Predict
              </label>
              <input
                type="number"
                min="1"
                max="50"
                required
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                placeholder="e.g. 10"
              />
            </div>

            <Button type="submit" className="w-full py-6 text-lg rounded-xl flex items-center justify-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Predict Future Salary
            </Button>
          </form>
        </div>

        {/* Results Area */}
        <div className="space-y-8">
          {!result ? (
            <div className="h-full min-h-[400px] flex items-center justify-center border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/30">
              <div className="text-center p-6">
                <TrendingUp className="h-12 w-12 text-[var(--muted-foreground)] opacity-50 mx-auto mb-4" />
                <p className="text-[var(--muted-foreground)] font-medium">
                  Enter your details and click predict to see your future salary growth.
                </p>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2 truncate">
                    Final Salary (Year {years})
                  </p>
                  <p className="font-black text-[var(--primary)] break-all text-xl sm:text-2xl leading-tight">
                    {formatCurrency(result.summary.finalSalary)}
                  </p>
                </div>
                <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2 truncate">
                    Total Lifetime Earnings
                  </p>
                  <p className="font-black text-[var(--foreground)] break-all text-xl sm:text-2xl leading-tight">
                    {formatCurrency(result.summary.totalEarned)}
                  </p>
                </div>
                <div className="bg-[var(--card)] p-5 rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden min-w-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--muted-foreground)] mb-2 truncate">
                    Average Annual Salary
                  </p>
                  <p className="font-black text-[var(--foreground)] break-all text-xl sm:text-2xl leading-tight">
                    {formatCurrency(result.summary.averageSalary)}
                  </p>
                </div>
              </div>

              {/* Visual CSS Bar Chart */}
              <div className="bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Salary Growth Over Time</h3>
                <div className="relative h-64 flex items-end gap-2 px-2 overflow-x-auto pb-6">
                  {result.yearlyData.map((data, index) => {
                    const maxSalary = result.summary.finalSalary;
                    const heightPercent = Math.max((data.salary / maxSalary) * 100, 5);
                    return (
                      <div key={data.year} className="group relative flex flex-col items-center flex-1 min-w-[40px]">
                        {/* Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--foreground)] text-[var(--background)] text-xs font-bold py-1 px-2 rounded whitespace-nowrap z-10 pointer-events-none">
                          {formatCurrency(data.salary)}
                        </div>
                        {/* Bar */}
                        <div 
                          className="w-full bg-gradient-to-t from-[var(--primary)] to-cyan-400 rounded-t-sm transition-all duration-700 ease-out hover:brightness-110"
                          style={{ 
                            height: `${heightPercent}%`, 
                            animationDelay: `${index * 50}ms`,
                            animationFillMode: 'both'
                          }}
                        ></div>
                        {/* Year Label */}
                        <span className="absolute -bottom-6 text-xs font-medium text-[var(--muted-foreground)]">
                          Yr {data.year}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Year-by-Year Table */}
              <div className="bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="p-5 border-b border-[var(--border)]">
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Year-by-Year Breakdown</h3>
                </div>
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-[var(--muted)]">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Year</th>
                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Annual Salary</th>
                        <th className="px-5 py-3 text-right text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Total Earned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {result.yearlyData.map((data) => (
                        <tr key={data.year} className="hover:bg-[var(--muted)]/50 transition-colors">
                          <td className="px-5 py-3 font-semibold text-[var(--foreground)]">Year {data.year}</td>
                          <td className="px-5 py-3 text-right font-bold text-[var(--primary)]">{formatCurrency(data.salary)}</td>
                          <td className="px-5 py-3 text-right text-[var(--muted-foreground)]">{formatCurrency(data.totalEarnedSoFar)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setResult(null)}
                  className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors underline underline-offset-4"
                >
                  Reset & calculate again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
