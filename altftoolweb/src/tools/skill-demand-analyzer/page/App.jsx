"use client";

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useDebounce } from '../hooks/useDebounce.js';
import { useSkillAnalysis } from '../hooks/useSkillAnalysis.js';
import { getRecentSearches, clearRecentSearches } from '../services/cache.js';
import {
  SearchBar,
  CountrySelector,
  DemandScoreCard,
  JobStatsCard,
  TrendChart,
  SmartSuggestions,
  LoadingSkeleton,
  ErrorState,
  EmptyState,
  RecentSearches,
  Features,
  JobSearchBoard
} from '../components/index.js';
import { TrendingUp, BarChart3, Sparkles, RefreshCw } from 'lucide-react';

const loadRecentSearches = () => (
  typeof window === 'undefined' ? [] : getRecentSearches()
);

function App() {
  const { theme } = useTheme();
  const { data, loading, error, analyzeSkill, clearData, refreshData } = useSkillAnalysis();
  const [searchInput, setSearchInput] = useState('');
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);
  const [selectedCountry, setSelectedCountry] = useState('in');
  const [jobFilters, setJobFilters] = useState({
    remote: false,
    fullTime: true,
    country: 'in'
  });
  // smart suggestions are fetched by the SmartSuggestions component from /api/analyze

  // Handle search
  const handleSearch = (skill) => {
    if (skill) {
      setSearchInput(skill);
      analyzeSkill(skill, selectedCountry);
    } else {
      setSearchInput('');
      clearData();
    }
  };

  const toggleJobFilter = (key) => {
    setJobFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleJobCountryChange = (country) => {
    setJobFilters(prev => ({ ...prev, country }));
  };

  // Puter removed. SmartSuggestions component will fetch AI summary itself.

  // Handle country change
  const handleCountryChange = (country) => {
    setSelectedCountry(country);
    setJobFilters(prev => ({ ...prev, country })); // Sync job filters country
    // If there's already a search, re-analyze with new country
    if (searchInput) {
      analyzeSkill(searchInput, country);
    }
  };

  // Handle recent search selection
  const handleRecentSearchSelect = (skill) => {
    handleSearch(skill);
  };


  // Handle clear recent searches
  const handleClearRecentSearches = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) transition-colors duration-300">
      {/* Header */}
      <header className="backdrop-blur-md top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="items-center justify-between mx-auto mb-5 text-center ">
            <div>
              {/* <div className="w-10 h-10 bg-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <BarChart3 className="w-6 h-6 text-white" />
              </div> */}
              <div className='bg-(--background) text-(--primary) text-center mb-5 mx-auto'>
                <h1 className="heading  flex justify-center gap-2  animate-fade-up ">
                  Skill Demand Analyzer
                </h1>
                <p className=" description opacity-90 mt-1 text-(--secondary)  animate-fade-up">Real-time demand insights</p>
              </div>
            </div>

            {/* <div className="flex items-center gap-2 text-sm text-(--muted-foreground)">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Powered by Adzuna & Google Trends</span>
            </div> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Country Selector Section */}
        <section className="mb-6">
          <div className="max-w-2xl mx-auto">
            <label className="block text-sm font-medium text-(--foreground) mb-2">
              Select Country/Region
            </label>
            <CountrySelector
              selectedCountry={selectedCountry}
              onCountryChange={handleCountryChange}
            />
          </div>
        </section>

        <section className="mb-8">
          <SearchBar
            onSearch={(v) => { handleSearch(v); }}
            loading={loading}
            disabled={false}
          />
        </section>

        {/* Recent Searches */}
        {!data && !loading && recentSearches.length > 0 && (
          <section className="mb-8">
            <RecentSearches
              searches={recentSearches}
              onSelect={handleRecentSearchSelect}
              onClear={handleClearRecentSearches}
            />
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section>
            <LoadingSkeleton />
          </section>
        )}

        {/* Error State */}
        {error && !loading && (
          <section>
            <ErrorState
              message={error}
              onRetry={() => searchInput && analyzeSkill(searchInput, selectedCountry)}
            />
          </section>
        )}

        {/* Empty State */}
        {!data && !loading && !error && recentSearches.length === 0 && (
          <section>
            <EmptyState />
          </section>
        )}

        {/* Results Dashboard */}
        {data && !loading && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-(--foreground) capitalize">
                  {data.input}
                </h2>
                <p className="text-(--muted-foreground)">
                  Market demand analysis in {data.country?.toUpperCase()}
                </p>
                {data.relatedSkills && data.relatedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 items-center">
                    <span className="text-sm text-(--muted-foreground)">Related:</span>
                    {data.relatedSkills.map(skill => (
                      <button
                        key={skill}
                        onClick={() => handleSearch(skill)}
                        className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-800/50 rounded-md transition-colors capitalize font-medium"
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={refreshData}
                  disabled={loading}
                  className="p-2 rounded-full bg-(--card) hover:bg-(--muted) text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh data"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </button>
                {!data.isComparison && data.trendStatus && (
                  <div className={`
                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold
                    bg-blue-700 text-white shadow-md transition-colors duration-300
                  `}>
                    <TrendingUp className="w-4 h-4" />
                    {data.trendStatus.status}
                  </div>
                )}
              </div>
            </div>

            {/* Compare vs Single View */}
            <div className={`grid grid-cols-1 ${data.isComparison ? 'lg:grid-cols-2' : ''} gap-6`}>
              {(data.isComparison ? data.skills : [data]).map((skillData, idx) => (
                <div key={idx} className="space-y-6">
                  {data.isComparison && (
                    <h3 className="text-xl font-bold text-(--foreground) capitalize">{skillData.skill}</h3>
                  )}
                  {/* Demand Score */}
                  <section>
                    <DemandScoreCard
                      demandScore={skillData.demandScore}
                      trendStatus={skillData.trendStatus}
                    />
                  </section>

                  {/* Job Statistics */}
                  <section>
                    <JobStatsCard jobData={skillData.jobData} country={selectedCountry} />
                  </section>
                </div>
              ))}
            </div>

            {/* Chart (now includes locations inside the TrendChart component) */}
            <section className="grid grid-cols-1 gap-6">
              <div className="min-w-0 min-h-[240px]">
                <TrendChart
                  trendData={data.isComparison ? data.combinedTrendsData : data.trendsData.trendData}
                  trendStatus={data.isComparison ? null : data.trendStatus}
                  averageInterest={data.isComparison ? null : data.trendsData.averageInterest}
                  trendDirection={data.isComparison ? null : data.trendsData.trendDirection}
                  percentageChange={data.isComparison ? null : data.trendsData.percentageChange}
                  lastUpdated={data.isComparison ? null : data.trendsData.lastUpdated}
                  source={data.isComparison ? 'Google Trends' : data.trendsData.source}
                  isComparison={data.isComparison}
                  skills={data.skills}
                  topLocations={data.isComparison ? data.skills[0].jobData.topLocations : data.jobData.topLocations}
                />
              </div>
            </section>
            {/* Smart Suggestions (Puter.js) */}
            {/* <section id="smart-suggestions-container" className="mt-6">
              <SmartSuggestions skill={data.input} />
            </section> */}
          </div>
        )}
      </main>

      {/* Jobs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <JobSearchBoard 
          query={searchInput} 
          filters={jobFilters} 
          adzunaJobs={data?.isComparison ? [] : (data?.jobData?.raw?.results || [])}
        />
      </div>

      {/* Global styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
      <Features />
    </div>
  );
}

export default App;
