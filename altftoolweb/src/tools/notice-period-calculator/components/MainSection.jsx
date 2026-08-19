"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, FileText, Users, Calendar, Info } from "lucide-react";

const NoticePeriodCalculator = () => {
  const [employeeType, setEmployeeType] = useState('full-time');
  const [yearsWorked, setYearsWorked] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const calculateNoticePeriod = () => {
    if (!yearsWorked || !monthlySalary) return;

    const years = parseFloat(yearsWorked);
    // Keep digits AND the decimal point — stripping the point too (the old
    // /[^0-9]/g pattern) turned "5432.10" into "543210", inflating any salary
    // with cents by roughly 100x.
    const monthlyPay = parseFloat(monthlySalary.replace(/[^0-9.]/g, ''));

    if (!Number.isFinite(years) || !Number.isFinite(monthlyPay) || years < 0 || monthlyPay <= 0) {
      setResults(null);
      setError('Enter a valid years-worked value (0 or more) and a monthly salary greater than 0.');
      return;
    }
    setError('');

    let noticeMonths = 0;
    let severancePay = 0;
    let complianceNotes = [];

    // Notice-month accrual rates are deliberately much slower than the raw
    // "years" multipliers this used to use (years*12, years*6): those hit
    // their cap within 1-2 years for every employee type, which meant a
    // 2-year and a 30-year full-timer got an identical result. These rates
    // mirror the severance formulas' pacing (a plausible number of years to
    // reach the cap) and keep part-time notice at 60% of the full-time rate,
    // matching the tool's own advertised planning model.
    switch(employeeType) {
      case 'full-time':
        noticeMonths = Math.min(years, 24);
        severancePay = Math.min(years * 2, 24) * monthlyPay;
        // This note names the actual cap, so it must only fire once the
        // formula above has genuinely reached it (previously it fired at
        // years >= 3, back when years*12 hit the 24-month cap almost
        // immediately — that threshold no longer matches the real payout).
        if (years >= 24) complianceNotes.push('Eligible for 24-month notice period');
        if (years >= 10) complianceNotes.push('Eligible for enhanced severance benefits');
        break;
      case 'part-time':
        noticeMonths = Math.min(years * 0.6, 12);
        severancePay = Math.min(years * 1.5, 12) * monthlyPay;
        if (years >= 5) complianceNotes.push('Long-service part-time benefits apply');
        break;
      case 'contract':
        noticeMonths = Math.min(years, 6);
        severancePay = Math.min(years * 1, 6) * monthlyPay;
        complianceNotes.push('Contract worker statutory minimum applies');
        break;
      case 'executive':
        noticeMonths = Math.min(years, 6);
        severancePay = Math.min(years * 3, 36) * monthlyPay;
        if (years >= 5) complianceNotes.push('Executive-level severance applies');
        if (years >= 15) complianceNotes.push('Senior executive enhanced benefits');
        break;
    }

    const annualSalary = monthlyPay * 12;
    const finalPay = severancePay;

    setResults({
      noticeMonths,
      severancePay,
      annualSalary,
      finalPay,
      complianceNotes,
      employeeType,
      years,
      monthlyPay
    });
  };

  // Notice-month caps by employee type, matching the accrual formulas above.
  const NOTICE_MONTH_CAPS = {
    'full-time': 24,
    'part-time': 12,
    'contract': 6,
    'executive': 6,
  };

  // Describes the notice-period figure without ever restating a different
  // number than the headline: the accrual formulas produce continuous
  // values, so a fixed-bucket subtitle (e.g. always "6 months") could
  // contradict the exact headline number for almost any non-boundary input.
  const getNoticePeriodLabel = (months, type) => {
    const cap = NOTICE_MONTH_CAPS[type];
    if (cap !== undefined && months >= cap) {
      return `Capped at the ${cap}-month maximum`;
    }
    return 'Based on years of service';
  };

  const getComplianceColor = (note) => {
    const lower = note.toLowerCase();
    if (lower.includes('enhanced') || lower.includes('senior')) return 'text-[var(--success)]';
    if (lower.includes('eligible')) return 'text-[var(--info)]';
    return 'text-[var(--warning)]';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-6 shadow-xl backdrop-blur-2xl">
          <h2 className="text-lg font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment Details
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-[var(--secondary-foreground)] mb-2 uppercase tracking-wider">
                Employment Type
              </label>
              <div className="grid grid-cols-2 gap-3" role="group" aria-label="Employment Type">
                {[
                  { id: 'full-time', label: 'Full Time', icon: Users },
                  { id: 'part-time', label: 'Part Time', icon: Users },
                  { id: 'contract', label: 'Contract', icon: FileText },
                  { id: 'executive', label: 'Executive', icon: Briefcase }
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => setEmployeeType(type.id)}
                      aria-pressed={employeeType === type.id}
                      className={`rounded-xl border p-4 transition-all duration-200 ${employeeType === type.id
                          ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md'
                          : 'bg-[var(--background)] border-[var(--border)] hover:bg-[var(--surface-soft)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-semibold">{type.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="notice-years-worked" className="block text-xs font-semibold text-[var(--secondary-foreground)] mb-2 uppercase tracking-wider">
                  Years Worked
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="notice-years-worked"
                    type="text"
                    value={yearsWorked}
                    onChange={(e) => setYearsWorked(e.target.value)}
                    placeholder="e.g., 3.5"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-10 py-3.5 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted-foreground)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">years</span>
                </div>
              </div>

              <div>
                <label htmlFor="notice-monthly-salary" className="block text-xs font-semibold text-[var(--secondary-foreground)] mb-2 uppercase tracking-wider">
                  Monthly Salary
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    id="notice-monthly-salary"
                    type="text"
                    value={monthlySalary}
                    onChange={(e) => setMonthlySalary(e.target.value)}
                    placeholder="e.g., 5000"
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-10 py-3.5 text-sm font-semibold text-[var(--foreground)] outline-none focus:border-[var(--primary)] focus:ring-4 focus:ring-[var(--primary)]/10 placeholder:text-[var(--muted-foreground)]"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">USD</span>
                </div>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs font-semibold text-[var(--danger)]">
                {error}
              </p>
            )}

            <button
              onClick={calculateNoticePeriod}
              className="w-full rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-6 py-4 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Calculate Notice Period & Severance
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {results ? (
            <div
              role="status"
              aria-live="polite"
              className="rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-6 shadow-xl backdrop-blur-2xl"
            >
              <h2 className="text-lg font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calculation Results
              </h2>

              <div className="space-y-4">
                <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-5">
                  <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Notice Period</div>
                  <div className="text-2xl font-bold text-[var(--primary)]">{results.noticeMonths} months</div>
                  <div className="text-xs text-[var(--secondary-foreground)] mt-1">
                    {getNoticePeriodLabel(results.noticeMonths, results.employeeType)}
                  </div>
                </div>

                <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-5">
                  <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Annual Salary</div>
                  <div className="text-2xl font-bold text-[var(--foreground)]">${results.annualSalary.toLocaleString()}/year</div>
                </div>

                <div className="rounded-xl bg-[var(--background)] border border-[var(--border)] p-5">
                  <div className="text-xs text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Severance Pay</div>
                  <div className="text-2xl font-bold text-[var(--success)]">${results.finalPay.toLocaleString()}</div>
                  <div className="text-xs text-[var(--secondary-foreground)] mt-1">
                    ~{Math.round((results.finalPay / results.annualSalary) * 100)}% of annual salary
                  </div>
                </div>
              </div>

              {results.complianceNotes.length > 0 && (
                <div className="mt-6 rounded-xl bg-[var(--info)]/10 border border-[var(--info)]/20 p-4">
                  <h3 className="text-xs font-semibold text-[var(--info)] mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Compliance Notes
                  </h3>
                  <ul className="space-y-2">
                    {results.complianceNotes.map((note, index) => (
                      <li key={index} className={`text-xs ${getComplianceColor(note)}`}>
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 p-12 shadow-xl backdrop-blur-2xl flex flex-col items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-[var(--muted)]/20 flex items-center justify-center mb-6">
                <Briefcase className="h-10 w-10 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--secondary-foreground)] mb-2">Ready to Calculate</h3>
              <p className="text-sm text-[var(--muted-foreground)] text-center max-w-xs">
                Enter your employment details above to calculate your legal notice period and severance pay entitlements.
              </p>
            </div>
          )}

          <div className="rounded-xl border border-[var(--info)]/20 bg-[var(--info)]/10 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-[var(--info)] mt-0.5" />
              <div>
                <div className="text-xs font-semibold text-[var(--info)] mb-1">Important Notice</div>
                <div className="text-xs text-[var(--secondary-foreground)] leading-relaxed">
                  These calculations are provided for informational purposes only and do not constitute legal advice. Actual notice periods and severance pay may vary based on specific employment contracts, local labor laws, and individual circumstances.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticePeriodCalculator;
