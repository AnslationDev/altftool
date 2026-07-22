"use client";
import React, { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Calendar, Percent, ArrowRight, Info, CheckCircle2 } from "lucide-react";

function StakingCalculator() {
  const [stakingAmount, setStakingAmount] = useState('');
  const [annualRate, setAnnualRate] = useState('5');
  const [stakingPeriod, setStakingPeriod] = useState('12');
  const [compoundFrequency, setCompoundFrequency] = useState('monthly');
  const [results, setResults] = useState(null);

  useEffect(() => {
    const calculateResults = () => {
      if (!stakingAmount || isNaN(parseFloat(stakingAmount))) {
        setResults(null);
        return;
      }

      const principal = parseFloat(stakingAmount);
      const rate = parseFloat(annualRate) / 100;
      const periods = parseInt(stakingPeriod);

      let futureValue, interestEarned, apy;

      switch (compoundFrequency) {
        case 'daily':
          futureValue = principal * Math.pow(1 + rate / 365, 365 * periods);
          interestEarned = futureValue - principal;
          apy = (Math.pow(1 + rate / 365, 365 * periods) - 1) * 100;
          break;
        case 'monthly':
          futureValue = principal * Math.pow(1 + rate / 12, 12 * periods);
          interestEarned = futureValue - principal;
          apy = (Math.pow(1 + rate / 12, 12 * periods) - 1) * 100;
          break;
        case 'quarterly':
          futureValue = principal * Math.pow(1 + rate / 4, 4 * periods);
          interestEarned = futureValue - principal;
          apy = (Math.pow(1 + rate / 4, 4 * periods) - 1) * 100;
          break;
        case 'annual':
          futureValue = principal * Math.pow(1 + rate, periods);
          interestEarned = futureValue - principal;
          apy = (Math.pow(1 + rate, periods) - 1) * 100;
          break;
        default:
          futureValue = principal * Math.pow(1 + rate, periods);
          interestEarned = futureValue - principal;
          apy = (Math.pow(1 + rate, periods) - 1) * 100;
      }

      const monthlyReturn = (interestEarned / periods).toFixed(2);
      const dailyReturn = (interestEarned / (periods * 30)).toFixed(2);

      setResults({
        principal,
        futureValue: futureValue.toFixed(2),
        interestEarned: interestEarned.toFixed(2),
        apy: apy.toFixed(2),
        monthlyReturn,
        dailyReturn,
        totalPeriods: periods * 12,
        compoundFrequency
      });
    };

    calculateResults();
  }, [stakingAmount, annualRate, stakingPeriod, compoundFrequency]);

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (/^\\d*\\\\.?\\\\d*$/.test(value) || value === '') {
      setter(value);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--secondary-foreground)] mb-2 uppercase tracking-wider">
            Staking Amount (USD)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={stakingAmount}
              onChange={handleInputChange(setStakingAmount)}
              placeholder="1000"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-10 py-3.5 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--secondary-foreground)] mb-2 uppercase tracking-wider">
            Annual Interest Rate (%)
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={annualRate}
              onChange={handleInputChange(setAnnualRate)}
              placeholder="5"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-10 py-3.5 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted-foreground)]"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--secondary-foreground)] mb-2 uppercase tracking-wider">
            Staking Period (Months)
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="text"
              value={stakingPeriod}
              onChange={handleInputChange(setStakingPeriod)}
              placeholder="12"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-10 py-3.5 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted-foreground)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--secondary-foreground)] mb-2 uppercase tracking-wider">
            Compound Frequency
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'daily', label: 'Daily' },
              { id: 'monthly', label: 'Monthly' },
              { id: 'quarterly', label: 'Quarterly' },
              { id: 'annual', label: 'Annual' }
            ].map((freq) => (
              <button
                key={freq.id}
                onClick={() => setCompoundFrequency(freq.id)}
                className={`rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-200 ${compoundFrequency === freq.id
                    ? 'bg-[var(--primary)] text-white shadow-md'
                    : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--secondary-foreground)] hover:bg-[var(--surface-soft)]'
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {results && (
        <div className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-5">
          <h3 className="text-sm font-bold text-[var(--primary)] mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Investment Summary
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Initial Amount</div>
              <div className="text-lg font-bold text-[var(--foreground)]">{formatCurrency(results.principal)}</div>
            </div>

            <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Final Value</div>
              <div className="text-lg font-bold text-[var(--primary)]">{formatCurrency(parseFloat(results.futureValue))}</div>
            </div>

            <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">Interest Earned</div>
              <div className="text-lg font-bold text-[var(--success)]">{formatCurrency(parseFloat(results.interestEarned))}</div>
            </div>

            <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-4">
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-1">APY</div>
              <div className="text-lg font-bold text-[var(--info)]">{results.apy}%</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Monthly Return</div>
              <div className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(parseFloat(results.monthlyReturn))}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Daily Return</div>
              <div className="text-sm font-bold text-[var(--foreground)]">{formatCurrency(parseFloat(results.dailyReturn))}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider">Total Periods</div>
              <div className="text-sm font-bold text-[var(--foreground)]">{results.totalPeriods}</div>
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-[var(--success)]/10 border border-[var(--success)]/20 p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
              <div className="text-xs font-medium text-[var(--success)]">Optimized for {results.compoundFrequency} compounding</div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[var(--info)]/20 bg-[var(--info)]/10 p-3.5">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-[var(--info)] mt-0.5" />
          <div className="text-xs text-[var(--secondary-foreground)] leading-relaxed">
            The actual return depends on market conditions and cryptocurrency volatility. This calculator provides estimates based on your specified interest rate and compounding frequency.
          </div>
        </div>
      </div>
    </div>
  );
}

export default StakingCalculator;
