'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
<<<<<<< HEAD
import Link from 'next/link';
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '../components/search/SearchBar';
import FilterSidebar from '../components/filters/FilterSidebar';
import JobCard from '../components/jobs/JobCard';
import JobCardSkeleton from '../components/jobs/JobCardSkeleton';
import { searchJobs, listJobs, getJobFacets } from '../lib/api/jobs';
import { Job, JobFacets, JobSearchResult, SearchFilters } from '../lib/types';
<<<<<<< HEAD
import { Sparkles, SlidersHorizontal, AlertCircle, RefreshCw, Briefcase, ArrowRight, Compass, ShieldCheck } from 'lucide-react';
=======
import { Sparkles, SlidersHorizontal, AlertCircle, RefreshCw, Briefcase, ChevronRight } from 'lucide-react';
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || undefined,
    company: searchParams.get('company') || undefined,
    experience_level: searchParams.get('experience_level') || undefined,
    employment_type: searchParams.get('employment_type') || undefined,
    min_salary: searchParams.get('min_salary') ? parseInt(searchParams.get('min_salary')!, 10) : undefined,
<<<<<<< HEAD
    sort_by: (searchParams.get('sort_by') as any) || 'relevance',
  });

  const [facets, setFacets] = useState<JobFacets | null>(null);
  const [results, setResults] = useState<{ job: Job; relevance_score?: number; match_reasons?: string[] }[]>([]);
=======
  });

  const [facets, setFacets] = useState<JobFacets | null>(null);
  const [results, setResults] = useState<{ job: Job; relevance_score?: number }[]>([]);
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load facets once on mount
  useEffect(() => {
    getJobFacets()
      .then(setFacets)
      .catch((err) => console.error('Failed to load facets', err));
  }, []);

  // Fetch jobs whenever query or filters change
  const fetchJobs = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (query.trim()) {
        const searchRes: JobSearchResult[] = await searchJobs({
          q: query.trim(),
          ...filters,
          limit: 30,
        });
<<<<<<< HEAD
        setResults(searchRes.map((r) => ({
          job: r.job,
          relevance_score: r.relevance_score,
          match_reasons: r.match_reasons,
        })));
=======
        setResults(searchRes.map((r) => ({ job: r.job, relevance_score: r.relevance_score })));
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
      } else {
        const listRes: Job[] = await listJobs({
          ...filters,
          limit: 30,
        });
        setResults(listRes.map((job) => ({ job })));
      }
    } catch (err: any) {
      console.error('Failed to fetch jobs', err);
      setError(err?.message || 'Could not connect to the job search service. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    const params = new URLSearchParams();
    if (newQuery) params.set('q', newQuery);
    if (filters.location) params.set('location', filters.location);
    if (filters.company) params.set('company', filters.company);
    if (filters.experience_level) params.set('experience_level', filters.experience_level);
    if (filters.employment_type) params.set('employment_type', filters.employment_type);
    if (filters.min_salary) params.set('min_salary', filters.min_salary.toString());
<<<<<<< HEAD
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
    router.push(`/?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
<<<<<<< HEAD
    setFilters({ sort_by: 'relevance' });
  };

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Hero Section */}
      <section className="border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50/40 to-slate-100/50 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700 border border-blue-200/80 shadow-2xs">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Continuously Refreshed from Greenhouse, Lever & Ashby</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Find your next opportunity with <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Job Intelligence</span>.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Search active engineering, AI, and tech opportunities across Bengaluru, Hyderabad, Pune, Mumbai, Delhi-NCR, and Remote India with strictly relevant matching.
          </p>

          <div className="pt-2">
=======
    setFilters({});
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-linear-to-b from-white via-white to-slate-50/50 pt-12 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>AI Semantic Vector Search Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Find your next opportunity.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Search thousands of roles using natural language. Query by exact technologies, domains, experience, or desired responsibilities.
          </p>

          <div className="pt-4">
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
            <SearchBar
              initialQuery={query}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </div>
<<<<<<< HEAD

          {/* Quick link to personalized recommendations */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition group"
            >
              <Sparkles className="h-4 w-4" />
              <span>Find Jobs For Me (Candidate Match)</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              <span>Upload Resume</span>
            </Link>
          </div>
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
        </div>
      </section>

      {/* Main Results Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-3 border-b border-slate-200">
          <div>
<<<<<<< HEAD
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {query.trim() ? (
                <>
                  Search Results for <span className="text-blue-600">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                'All Verified Opportunities'
              )}
            </h2>
            <p className="text-xs font-medium text-slate-500 mt-1">
              {!isLoading && (
                results.length > 0 ? (
                  <span>Showing <strong className="text-slate-800">{results.length}</strong> relevant {results.length === 1 ? 'position' : 'positions'}</span>
                ) : (
                  <span>0 results found</span>
                )
              )}
=======
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {query.trim() ? (
                <>
                  Search Results for <span className="text-blue-600 font-semibold">&ldquo;{query}&rdquo;</span>
                </>
              ) : (
                'All Opportunities'
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {!isLoading && `${results.length} ${results.length === 1 ? 'position' : 'positions'} available`}
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
<<<<<<< HEAD
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
            >
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <span>Filters</span>
=======
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
            </button>
          </div>
        </div>

<<<<<<< HEAD
        {/* Layout Grid */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8">
=======
        {/* Content Layout */}
        <div className="mt-6 flex flex-col lg:flex-row gap-8 items-start">
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              facets={facets}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

<<<<<<< HEAD
          {/* Mobile Filter Modal */}
          {showMobileFilters && (
            <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
              <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900">Filters</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    Close
                  </button>
                </div>
                <FilterSidebar
                  facets={facets}
                  selectedFilters={filters}
                  onFilterChange={(f) => {
                    handleFilterChange(f);
                    setShowMobileFilters(false);
                  }}
                  onReset={() => {
                    handleResetFilters();
                    setShowMobileFilters(false);
                  }}
                />
              </div>
            </div>
          )}

          {/* Job Results Feed */}
          <div className="flex-1 min-w-0">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center space-y-3">
                <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                <h3 className="text-sm font-bold text-red-900">Search Error</h3>
                <p className="text-xs text-red-700 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => fetchJobs()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition cursor-pointer"
=======
          {/* Mobile Filters Drawer */}
          {showMobileFilters && (
            <div className="w-full lg:hidden mb-4">
              <FilterSidebar
                facets={facets}
                selectedFilters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
            </div>
          )}

          {/* Jobs List Area */}
          <div className="flex-1 w-full space-y-4">
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center space-y-3">
                <AlertCircle className="mx-auto h-8 w-8 text-red-600" />
                <h3 className="text-base font-bold text-red-900">Failed to load jobs</h3>
                <p className="text-xs text-red-700 max-w-md mx-auto">{error}</p>
                <button
                  onClick={() => fetchJobs()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition cursor-pointer"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again
                </button>
              </div>
            ) : isLoading ? (
              <div className="space-y-4">
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            ) : results.length === 0 ? (
<<<<<<< HEAD
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-5">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <Briefcase className="h-7 w-7 text-slate-400" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900">No relevant jobs found.</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    We only recommend genuine matches and avoid padding results with irrelevant roles.
                  </p>
                </div>
                <div className="text-xs text-slate-700 bg-slate-50 border border-slate-200/80 rounded-xl p-5 max-w-md mx-auto text-left space-y-2">
                  <span className="font-bold text-slate-900 block">Try:</span>
                  <ul className="space-y-1.5 text-slate-600 list-disc pl-4">
                    <li>a broader job title (e.g. &ldquo;Python developer&rdquo;, &ldquo;Data Scientist&rdquo;)</li>
                    <li>another location (e.g. &ldquo;Bengaluru&rdquo;, &ldquo;Remote&rdquo;)</li>
                    <li>removing or adjusting a salary / experience filter</li>
=======
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No jobs found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    We couldn&apos;t find any roles matching your current search and filters.
                  </p>
                </div>
                <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-4 max-w-md mx-auto text-left space-y-1.5">
                  <span className="font-semibold text-slate-800">Recommendations:</span>
                  <ul className="list-disc pl-4 space-y-1 text-slate-500">
                    <li>Try relaxing or clearing location or company filters.</li>
                    <li>Use broader query terms (e.g. &ldquo;Backend&rdquo; or &ldquo;Python&rdquo;).</li>
                    <li>Search by required tech stack or seniority level.</li>
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                  </ul>
                </div>
                <button
                  onClick={handleResetFilters}
<<<<<<< HEAD
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-sm"
=======
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
<<<<<<< HEAD
                {results.map(({ job, relevance_score, match_reasons }) => (
=======
                {results.map(({ job, relevance_score }) => (
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                  <JobCard
                    key={job.id}
                    job={job}
                    relevanceScore={relevance_score}
<<<<<<< HEAD
                    matchReasons={match_reasons}
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 p-8 flex justify-center">
          <div className="w-full max-w-7xl space-y-4">
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
