'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Job } from '../../lib/types';
import { useAuth } from '../../lib/auth/AuthContext';
import { saveJob, unsaveJob } from '../../lib/api/savedJobs';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  Bookmark, 
  Sparkles, 
  ArrowUpRight,
  BadgeCheck,
  Coins
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  relevanceScore?: number;
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
}

export default function JobCard({ job, relevanceScore, onSaveToggle }: JobCardProps) {
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

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return null;
    const fmt = (n: number) => {
      if (n >= 100000) return `${(n / 1000).toLocaleString()}k`;
      return n.toLocaleString();
    };
    if (min && max) return `$${fmt(min)} - $${fmt(max)}`;
    if (min) return `From $${fmt(min)}`;
    if (max) return `Up to $${fmt(max)}`;
    return null;
  };

  const salaryString = formatSalary(job.salary_min, job.salary_max);

  // Compute clean match percentage if score is between 0 and 1
  const matchPercentage =
    relevanceScore !== undefined
      ? Math.round(relevanceScore * 100)
      : null;

  return (
    <div className="group relative rounded-xl border border-slate-200 bg-white p-6 transition-all duration-200 hover:border-blue-400 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
              <Link href={`/jobs/${job.id}`} className="hover:underline flex items-center gap-1.5">
                {job.title}
                <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-0.5 group-hover:opacity-100 transition" />
              </Link>
            </h3>
          </div>
          <p className="text-sm font-semibold text-slate-600">{job.company}</p>
        </div>

        <div className="flex items-center gap-2">
          {matchPercentage !== null && (
            <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 border border-blue-200/60">
              <Sparkles className="h-3 w-3 text-blue-600" />
              <span>{matchPercentage}% Match</span>
            </div>
          )}
          <button
            onClick={handleSaveToggle}
            disabled={isSaving}
            aria-label={isSaved ? 'Remove from saved' : 'Save job'}
            className={`rounded-lg p-2 transition ${
              isSaved
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Meta tags */}
      <div className="mt-3.5 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-medium text-slate-600">
        {job.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{job.location}</span>
          </div>
        )}
        {job.employment_type && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>{job.employment_type}</span>
          </div>
        )}
        {job.experience_level && !job.experience_level.includes('|') && (
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="capitalize">{job.experience_level}</span>
          </div>
        )}
        {salaryString && (
          <div className="flex items-center gap-1 text-emerald-700 font-semibold">
            <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>{salaryString}</span>
          </div>
        )}
      </div>

      {/* AI Summary / Description Snippet */}
      <div className="mt-3.5 text-xs text-slate-600 line-clamp-2 leading-relaxed">
        {job.summary ? (
          <span className="text-slate-700 font-normal">
            <strong className="font-semibold text-slate-800 mr-1">AI Summary:</strong>
            {job.summary}
          </span>
        ) : (
          job.description.replace(/<[^>]*>?/gm, ' ')
        )}
      </div>

      {/* Skills Badges */}
      {job.skills && job.skills.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
          {job.skills.slice(0, 6).map((skill, idx) => (
            <span
              key={`${skill}-${idx}`}
              className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 6 && (
            <span className="text-[11px] font-medium text-slate-400">
              +{job.skills.length - 6} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}
