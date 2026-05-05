import { Briefcase, DollarSign, TrendingUp } from 'lucide-react';

const CURRENCY_MAP = {
  in: 'INR',
  us: 'USD',
  gb: 'GBP',
  ca: 'CAD',
  au: 'AUD',
  nl: 'EUR',
  de: 'EUR',
  fr: 'EUR',
  br: 'BRL',
  mx: 'MXN',
  sg: 'SGD',
  nz: 'NZD',
};

const LOCALE_MAP = {
  in: 'en-IN',
  us: 'en-US',
  gb: 'en-GB',
  ca: 'en-CA',
  au: 'en-AU',
  nl: 'nl-NL',
  de: 'de-DE',
  fr: 'fr-FR',
  br: 'pt-BR',
  mx: 'es-MX',
  sg: 'en-SG',
  nz: 'en-NZ',
};

export function JobStatsCard({ jobData, country = 'in' }) {
  const getSalaryFormatter = () => {
    const locale = LOCALE_MAP[country] || 'en-US';
    const currency = CURRENCY_MAP[country] || 'USD';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
  };

  const formatSalary = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) return 'N/A';
    if (Number(value) <= 0) return 'N/A';
    return getSalaryFormatter().format(Number(value));
  };

  const formatNumber = (value) => {
    if (value === undefined || value === null) return '0';
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  // Prefer display-ready fields from backend; fallback to localized formatting
  const avgDisplay = jobData?.avgSalaryDisplay || formatSalary(jobData?.avgSalary);
  const minDisplay = jobData?.minSalaryDisplay || formatSalary(jobData?.minSalary);
  const maxDisplay = jobData?.maxSalaryDisplay || formatSalary(jobData?.maxSalary);
  const salaryConfidence = jobData?.salaryConfidence || jobData?.salary_confidence || 'Limited salary data';
  const trust = jobData?.trust || {};

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Job Count Card */}
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-blue-100 text-xs sm:text-sm font-medium">Total Jobs</span>
          </div>
          <div className="text-2xl sm:text-3xl font-bold truncate">{formatNumber(jobData?.jobCount || 0)}</div>
          <div className="mt-2 text-blue-100 text-xs sm:text-sm truncate">
            Available positions
          </div>
        </div>

        {/* Average Salary Card */}
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-blue-100 text-xs sm:text-sm font-medium">Avg Salary</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold truncate">{avgDisplay}</div>
          <div className="mt-2 text-blue-100 text-xs sm:text-sm truncate">
            Per year
          </div>
        </div>

        {/* Salary Range Card */}
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-blue-100 text-xs sm:text-sm font-medium">Salary Range</span>
          </div>
          <div className="text-lg sm:text-xl font-bold truncate">
            {minDisplay} - {maxDisplay}
          </div>
          <div className="mt-2 text-blue-100 text-xs sm:text-sm truncate">
            Min to Max
          </div>
        </div>
      </div>

      {/* Trust & Confidence */}
      <div className="flex items-center justify-between bg-(--card) rounded-md p-3 text-sm text-(--muted-foreground)">
        <div className="flex items-center gap-4">
          <div>Based on live job listings</div>
          <div>Last updated: {trust.lastUpdated || 'N/A'}</div>
          <div>Jobs analyzed: {trust.jobsAnalyzed ?? jobData?.jobsAnalyzed ?? jobData?.jobCount ?? 0}</div>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/10 text-white font-semibold">
          {salaryConfidence}
        </div>
      </div>
    </div>
  );
}
