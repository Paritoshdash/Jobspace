'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job } from '../../lib/types';
import { useAuth } from '../../lib/auth/AuthContext';
import { saveJob, unsaveJob } from '../../lib/api/savedJobs';
import { formatSalaryINR } from '../../lib/utils/salary';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Bookmark, 
  Sparkles, 
  ArrowUpRight,
  CheckCircle2,
  Building2,
  TrendingUp
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  relevanceScore?: number;
  matchReasons?: string[];
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
}

export default function JobCard({ job, relevanceScore, matchReasons, onSaveToggle }: JobCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState<boolean>(job.is_saved ?? false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved) {
        await unsaveJob(job.id);
        setIsSaved(false);
        onSaveToggle?.(job.id, false);
      } else {
        await saveJob(job.id);
        setIsSaved(true);
        onSaveToggle?.(job.id, true);
      }
    } catch (err) {
      console.error('Failed to toggle save state', err);
    } finally {
      setIsSaving(false);
    }
  };

  const salaryString = formatSalaryINR(job.salary_min, job.salary_max, job.salary_currency);

  const matchPercentage =
    relevanceScore !== undefined
      ? Math.round(relevanceScore * 100)
      : null;

  // Format date freshness
  const getFreshness = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const diff = (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24);
    if (diff < 1) return 'Posted today';
    if (diff < 2) return 'Posted yesterday';
    if (diff < 7) return `Posted ${Math.floor(diff)}d ago`;
    if (diff < 30) return `Posted ${Math.floor(diff / 7)}w ago`;
    return null;
  };

  const freshnessLabel = getFreshness(job.posted_at || job.created_at);

  return (
    <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-6 transition-all duration-200 hover:border-blue-400/80 hover:shadow-lg hover:shadow-blue-500/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
              <Link href={`/jobs/${job.id}`} className="hover:underline flex items-center gap-1.5">
                <span>{job.title}</span>
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition shrink-0" />
              </Link>
            </h3>
            {job.status === 'ACTIVE' && (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/70">
                ACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span>{job.company}</span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-medium text-slate-500 capitalize">{job.source}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {matchPercentage !== null && (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200/80 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>{matchPercentage}% Match</span>
            </div>
          )}

          <button
            onClick={handleSaveToggle}
            disabled={isSaving}
            aria-label={isSaved ? 'Unsave job' : 'Save job'}
            className={`p-2 rounded-xl border transition ${
              isSaved
                ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Match Reasons Explanation Badges */}
      {matchReasons && matchReasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
          {matchReasons.slice(0, 3).map((reason, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200/70"
            >
              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
              <span>{reason}</span>
            </span>
          ))}
        </div>
      )}

      {/* Summary / Description snippet */}
      <p className="mt-3 text-xs leading-relaxed text-slate-600 line-clamp-2">
        {job.summary || job.description.replace(/<[^>]*>?/gm, '').slice(0, 220)}...
      </p>

      {/* Meta chips */}
      <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600 border-t border-slate-100 pt-3">
        {job.location && (
          <div className="flex items-center gap-1 text-slate-700">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
        )}

        {salaryString && (
          <div className="flex items-center gap-1 font-bold text-slate-900 bg-amber-50/80 px-2 py-0.5 rounded-md border border-amber-200/60">
            <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
            <span>{salaryString}</span>
          </div>
        )}

        {job.employment_type && (
          <div className="flex items-center gap-1 text-slate-600">
            <Briefcase className="h-3.5 w-3.5 text-slate-400" />
            <span>{job.employment_type}</span>
          </div>
        )}

        {freshnessLabel && (
          <div className="flex items-center gap-1 text-slate-500 ml-auto">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            <span>{freshnessLabel}</span>
          </div>
        )}
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="rounded-md bg-slate-100/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 5 && (
            <span className="rounded-md bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-400">
              +{job.skills.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
