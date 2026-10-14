'use client';

import React from 'react';
import { JobFacets, SearchFilters } from '../../lib/types';
<<<<<<< HEAD
import { Filter, RotateCcw, MapPin, Building2, Briefcase, Award, ArrowDownWideNarrow, IndianRupee } from 'lucide-react';
=======
import { Filter, RotateCcw, MapPin, Building2, Briefcase, Award, DollarSign } from 'lucide-react';
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5

interface FilterSidebarProps {
  facets: JobFacets | null;
  selectedFilters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  facets,
  selectedFilters,
  onFilterChange,
  onReset,
}: FilterSidebarProps) {
  const hasActiveFilters = Boolean(
    selectedFilters.location ||
    selectedFilters.company ||
    selectedFilters.experience_level ||
    selectedFilters.employment_type ||
<<<<<<< HEAD
    selectedFilters.min_salary ||
    selectedFilters.sort_by
  );

  const indianCities = [
    'Bengaluru',
    'Hyderabad',
    'Pune',
    'Mumbai',
    'Delhi',
    'Gurgaon',
    'Noida',
    'Chennai',
    'Remote',
  ];

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white rounded-2xl border border-slate-200/90 p-5 space-y-6 shadow-xs">
=======
    selectedFilters.min_salary
  );

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-xs">
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">Search Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

<<<<<<< HEAD
      {/* Sort By Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <ArrowDownWideNarrow className="h-3.5 w-3.5 text-slate-400" />
          Sort Results
        </label>
        <select
          value={selectedFilters.sort_by || 'relevance'}
          onChange={(e) => onFilterChange({ sort_by: e.target.value as any })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="relevance">Relevance (AI Ranked)</option>
          <option value="newest">Newest First</option>
          <option value="salary">Highest Salary</option>
        </select>
      </div>

=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
      {/* Location Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
<<<<<<< HEAD
          Location (India & Remote)
=======
          Location
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
        </label>
        <select
          value={selectedFilters.location || ''}
          onChange={(e) => onFilterChange({ location: e.target.value || undefined })}
<<<<<<< HEAD
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Locations</option>
          {indianCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
          {facets?.locations
            ?.filter((loc) => !indianCities.some((c) => loc.toLowerCase().includes(c.toLowerCase())))
            .slice(0, 15)
            .map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
        </select>
      </div>

      {/* Minimum Salary in LPA */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
          Min Salary (LPA)
        </label>
        <select
          value={selectedFilters.min_salary || ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onFilterChange({ min_salary: val });
          }}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Any Salary</option>
          <option value="300000">&#8377;3+ LPA</option>
          <option value="600000">&#8377;6+ LPA</option>
          <option value="1000000">&#8377;10+ LPA</option>
          <option value="1500000">&#8377;15+ LPA</option>
          <option value="2500000">&#8377;25+ LPA</option>
          <option value="4000000">&#8377;40+ LPA</option>
        </select>
      </div>

      {/* Experience Level */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Award className="h-3.5 w-3.5 text-slate-400" />
          Experience Level
        </label>
        <select
          value={selectedFilters.experience_level || ''}
          onChange={(e) => onFilterChange({ experience_level: e.target.value || undefined })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Experience Levels</option>
          <option value="intern">Internship / Trainee</option>
          <option value="junior">Junior / Fresher (0-2 yrs)</option>
          <option value="mid">Mid Level (3-5 yrs)</option>
          <option value="senior">Senior (5+ yrs)</option>
        </select>
      </div>

      {/* Employment Type */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
          Employment Type
        </label>
        <select
          value={selectedFilters.employment_type || ''}
          onChange={(e) => onFilterChange({ employment_type: e.target.value || undefined })}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
=======
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Locations</option>
          {facets?.locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
        </select>
      </div>

      {/* Company Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          Company
        </label>
        <select
          value={selectedFilters.company || ''}
          onChange={(e) => onFilterChange({ company: e.target.value || undefined })}
<<<<<<< HEAD
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
=======
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
        >
          <option value="">All Companies</option>
          {facets?.companies.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>
      </div>

<<<<<<< HEAD
      {facets?.total_jobs !== undefined && (
        <div className="pt-2 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-500 font-medium">
            Active verified postings: <strong className="text-slate-900 font-bold">{facets.total_jobs}</strong>
=======
      {/* Experience Level */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Award className="h-3.5 w-3.5 text-slate-400" />
          Experience Level
        </label>
        <select
          value={selectedFilters.experience_level || ''}
          onChange={(e) => onFilterChange({ experience_level: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Experience Levels</option>
          {facets?.experience_levels
            .filter((exp) => !exp.includes('|'))
            .map((exp) => (
              <option key={exp} value={exp}>
                {exp.charAt(0).toUpperCase() + exp.slice(1)}
              </option>
            ))}
        </select>
      </div>

      {/* Employment Type */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Briefcase className="h-3.5 w-3.5 text-slate-400" />
          Employment Type
        </label>
        <select
          value={selectedFilters.employment_type || ''}
          onChange={(e) => onFilterChange({ employment_type: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Types</option>
          {facets?.employment_types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Minimum Salary */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <DollarSign className="h-3.5 w-3.5 text-slate-400" />
          Min Annual Salary
        </label>
        <select
          value={selectedFilters.min_salary || ''}
          onChange={(e) => {
            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
            onFilterChange({ min_salary: val });
          }}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Any Salary</option>
          <option value="50000">$50,000+</option>
          <option value="80000">$80,000+</option>
          <option value="100000">$100,000+</option>
          <option value="120000">$120,000+</option>
          <option value="150000">$150,000+</option>
        </select>
      </div>

      {facets?.total_jobs !== undefined && (
        <div className="pt-2 border-t border-slate-100 text-center">
          <span className="text-xs text-slate-500 font-medium">
            Total indexed opportunities: <strong className="text-slate-900 font-bold">{facets.total_jobs}</strong>
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
          </span>
        </div>
      )}
    </aside>
  );
}
