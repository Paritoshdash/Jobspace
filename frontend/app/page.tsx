'use client';

import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '../components/search/SearchBar';
import FilterSidebar from '../components/filters/FilterSidebar';
import JobCard from '../components/jobs/JobCard';
import JobCardSkeleton from '../components/jobs/JobCardSkeleton';
import { searchJobs, listJobs, getJobFacets } from '../lib/api/jobs';
import { Job, JobFacets, JobSearchResult, SearchFilters } from '../lib/types';
import { Sparkles, SlidersHorizontal, AlertCircle, RefreshCw, Briefcase, ChevronRight } from 'lucide-react';

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
  });

  const [facets, setFacets] = useState<JobFacets | null>(null);
  const [results, setResults] = useState<{ job: Job; relevance_score?: number }[]>([]);
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
        setResults(searchRes.map((r) => ({ job: r.job, relevance_score: r.relevance_score })));
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
    router.push(`/?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
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
            <SearchBar
              initialQuery={query}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
          </div>
        </div>
      </section>

      {/* Main Results Section */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-3 border-b border-slate-200">
          <div>
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
            </p>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>{showMobileFilters ? 'Hide Filters' : 'Filters'}</span>
            </button>
          </div>
        </div>

        {/* Content Layout */}
        <div className="mt-6 flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block">
            <FilterSidebar
              facets={facets}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>

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
                  </ul>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {results.map(({ job, relevance_score }) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    relevanceScore={relevance_score}
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
