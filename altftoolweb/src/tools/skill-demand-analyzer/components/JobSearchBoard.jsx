import React, { useCallback, useEffect, useState } from 'react';
import { Search, MapPin, Briefcase, DollarSign, Calendar, ExternalLink, Globe, Filter, X } from 'lucide-react';
import { useJSearch } from '../hooks/useJSearch';
import ManagedImage from "@/components/ui/ManagedImage";

const JobCard = ({ job, source = 'jsearch' }) => {
  // Normalize data between JSearch and Adzuna
  const isAdzuna = source === 'adzuna';
  
  const title = isAdzuna ? job.title : job.job_title;
  const company = isAdzuna ? job.company?.display_name : job.employer_name;
  const location = isAdzuna 
    ? (job.location?.display_name || 'India') 
    : [job.job_city, job.job_state, job.job_country].filter(Boolean).join(', ');
  
  const date = isAdzuna 
    ? (job.created ? new Date(job.created).toLocaleDateString() : 'Recently')
    : (job.job_posted_at_datetime ? new Date(job.job_posted_at_datetime).toLocaleDateString() : 'Recently');
  
  const applyLink = isAdzuna ? job.redirect_url : job.job_apply_link;
  const logo = isAdzuna ? null : job.employer_logo;
  
  const minSalary = isAdzuna ? job.salary_min : job.job_min_salary;
  const maxSalary = isAdzuna ? job.salary_max : job.job_max_salary;
  
  const currencySymbol = isAdzuna ? '₹' : (job.job_salary_currency === 'INR' || job.job_country === 'IN' ? '₹' : '$');
  
  const salaryText = minSalary && maxSalary 
    ? `${currencySymbol}${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()}`
    : 'Salary not disclosed';

  return (
    <div className="group bg-(--card) border border-(--border) rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-500/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 transition-all duration-500 group-hover:scale-150 group-hover:bg-blue-500/10" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm border border-(--border) overflow-hidden">
              {logo ? (
                <ManagedImage src={logo} alt={company} className="w-full h-full object-contain" />
              ) : (
                <Briefcase className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="font-bold text-lg text-(--foreground) line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {title}
                </h3>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${isAdzuna ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                  {source}
                </span>
              </div>
              <p className="text-(--muted-foreground) text-sm font-medium">{company}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-2 mb-6">
          <div className="flex items-center gap-2 text-sm text-(--secondary)">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-(--secondary)">
            <Briefcase className="w-4 h-4 text-purple-500" />
            <span className="capitalize">{isAdzuna ? (job.contract_time?.replace('_', ' ') || 'Full Time') : (job.job_employment_type?.toLowerCase().replace('_', ' ') || 'Full Time')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-(--secondary)">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <span className="truncate">{salaryText}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-(--secondary)">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span>{date}</span>
          </div>
        </div>

        <a
          href={applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
        >
          Apply Now <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

const SkeletonCard = () => (
  <div className="bg-(--card) border border-(--border) rounded-2xl p-6 animate-pulse">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-12 h-12 rounded-xl bg-(--muted)" />
      <div className="flex-1">
        <div className="h-5 bg-(--muted) rounded w-3/4 mb-2" />
        <div className="h-4 bg-(--muted) rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="h-4 bg-(--muted) rounded w-full" />
      <div className="h-4 bg-(--muted) rounded w-2/3" />
    </div>
    <div className="h-10 bg-(--muted) rounded-xl w-full" />
  </div>
);

export const JobSearchBoard = ({ query, filters, adzunaJobs = [] }) => {
  const { jobs: jsearchJobs, loading: jsearchLoading, error: jsearchError, searchJobs } = useJSearch();
  const [salaries, setSalaries] = useState([]);
  const [salaryLoading, setSalaryLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);

  const fetchCompanySalaries = useCallback(async (skill) => {
    if (!skill) return;
    setSalaryLoading(true);
    const companies = ['Amazon', 'Google', 'Microsoft', 'Meta'];
    try {
      const results = await Promise.all(
        companies.map(async (company) => {
          const res = await fetch(`/api/tools/skill-demand/jsearch?type=salary&company=${company}&job_title=${skill} Developer&country=${filters.country}`);
          if (res.ok) {
            const data = await res.json();
            return { company, data: data.data };
          }
          return { company, data: null };
        })
      );
      setSalaries(results.filter(r => r.data));
    } catch (err) {
      console.error('Salary fetch error:', err);
    } finally {
      setSalaryLoading(false);
    }
  }, [filters.country]);

  useEffect(() => {
    if (query?.trim()) {
      fetchCompanySalaries(query);
      setVisibleCount(15);
      
      // ONLY call JSearch if we don't have Adzuna jobs
      // This respects the user's request: "adzuna ke aip ka response main jobs se related data ho toh show kre aur naa ho toh jSearch api"
      if (adzunaJobs.length === 0) {
        searchJobs(query, filters);
      }
    }
  }, [adzunaJobs.length, fetchCompanySalaries, filters, query, searchJobs]);

  if (!query) return null;

  // Combine and prioritize jobs
  // If Adzuna jobs are provided, use them as the primary source as requested
  const allJobs = adzunaJobs.length > 0 
    ? adzunaJobs.map(j => ({ ...j, _source: 'adzuna' }))
    : jsearchJobs.map(j => ({ ...j, _source: 'jsearch' }));

  const visibleJobs = allJobs.slice(0, visibleCount);
  const hasMore = visibleCount < allJobs.length;

  return (
    <section className="mt-16 pt-16 border-t border-(--border)">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h2 className="text-3xl font-bold text-(--foreground) mb-4 flex items-center justify-center gap-3">
          <Briefcase className="w-8 h-8 text-blue-600" />
          Live Job Opportunities
        </h2>
        <p className="text-(--muted-foreground) text-lg">
          Explore real-time openings for <span className="text-blue-600 font-bold capitalize">{query}</span>
        </p>
      </div>

      {/* Salary Estimates Section */}
      {query && (salaries.length > 0 || salaryLoading) && (
        <div className="max-w-7xl mx-auto mb-12">
          <div className="bg-(--card) border border-(--border) rounded-3xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-500" />
              Estimated Salaries at Top Companies for &quot;{query}&quot;
            </h3>
            
            {salaryLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-(--muted) animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {salaries.map((item, idx) => {
                  const medianSalary = item.data?.[0]?.median_salary;
                  const currency = filters.country === 'in' ? '₹' : (item.data?.[0]?.salary_currency || '$');
                  return (
                    <div key={idx} className="p-4 bg-(--background) border border-(--border) rounded-2xl hover:border-emerald-500/50 transition-all">
                      <p className="text-sm font-bold text-(--secondary) mb-1">{item.company}</p>
                      <p className="text-xl font-black text-emerald-600">
                        {medianSalary ? `${currency}${Math.round(medianSalary).toLocaleString()}` : 'No Data'}
                      </p>
                      <p className="text-[10px] text-(--muted-foreground) uppercase tracking-wider font-bold">Median Yearly</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="max-w-7xl mx-auto">
        {(jsearchLoading && allJobs.length === 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {allJobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
              {visibleJobs.map((job, idx) => (
                <JobCard key={job.id || job.job_id || idx} job={job} source={job._source} />
              ))}
            </div>
            
            {hasMore && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => setVisibleCount(prev => prev + 15)}
                  className="px-8 py-3 bg-(--card) border border-(--border) text-(--foreground) font-bold rounded-2xl hover:border-blue-500 transition-all shadow-sm"
                >
                  Load More Jobs
                </button>
              </div>
            )}
          </>
        ) : !jsearchLoading && query && (
          <div className="text-center py-20 bg-(--card) rounded-3xl border border-dashed border-(--border) px-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-blue-900/20">
              <Search className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
            <h3 className="text-2xl font-bold text-(--foreground) mb-3">No jobs found in {filters.country === 'in' ? 'India' : filters.country.toUpperCase()}</h3>
            <p className="text-(--muted-foreground) max-w-md mx-auto leading-relaxed">
              We couldn&apos;t find any active <span className="font-semibold text-blue-600">&quot;{query}&quot;</span> openings in this region right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
