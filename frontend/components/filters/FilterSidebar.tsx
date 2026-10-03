'use client';

import React from 'react';
import { JobFacets, SearchFilters } from '../../lib/types';
import { Filter, RotateCcw, MapPin, Building2, Briefcase, Award, DollarSign } from 'lucide-react';

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
    selectedFilters.min_salary
  );

  return (
    <aside className="w-full lg:w-72 shrink-0 bg-white rounded-xl border border-slate-200 p-5 space-y-6 shadow-xs">
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

      {/* Location Filter */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          Location
        </label>
        <select
          value={selectedFilters.location || ''}
          onChange={(e) => onFilterChange({ location: e.target.value || undefined })}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Locations</option>
          {facets?.locations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
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
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">All Companies</option>
          {facets?.companies.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
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
          </span>
        </div>
      )}
    </aside>
  );
}
