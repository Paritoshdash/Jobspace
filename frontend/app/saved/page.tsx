'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { getSavedJobs, unsaveJob } from '../../lib/api/savedJobs';
import { SavedJob } from '../../lib/types';
import { 
  Bookmark, 
  Trash2, 
  MapPin, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  Coins,
  LogIn
} from 'lucide-react';

export default function SavedJobsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setIsLoading(false);
      return;
    }

    if (user) {
      setIsLoading(true);
      getSavedJobs(0, 100)
        .then((data) => {
          setSavedJobs(data);
        })
        .catch((err) => {
          console.error('Failed to load saved jobs', err);
          setError(err?.message || 'Could not load your saved jobs.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [user, isAuthLoading]);

  const handleUnsave = async (jobId: number) => {
    if (removingId) return;
    setRemovingId(jobId);

    try {
      await unsaveJob(jobId);
      setSavedJobs((prev) => prev.filter((item) => item.job_id !== jobId));
    } catch (err: any) {
      console.error('Failed to unsave job', err);
    } finally {
      setRemovingId(null);
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

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-12 space-y-4">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="h-4 w-72 bg-slate-100 animate-pulse rounded mb-8" />
        <div className="space-y-4">
          <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-28 bg-white border border-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-5">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LogIn className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Sign in to view saved jobs</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Create an account or sign in to bookmark positions and sync them across all your devices.
          </p>
        </div>
        <Link
          href="/login?redirect=/saved"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
        >
          <span>Sign In</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="h-6 w-6 text-blue-600 fill-blue-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved for later review
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
          >
            <span>Explore more jobs</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {savedJobs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Bookmark className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No saved jobs yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Save jobs while searching to bookmark them and track your opportunities here.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <span>Search Opportunities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {savedJobs.map((item) => {
              const job = item.job;
              const salaryString = formatSalary(job.salary_min, job.salary_max);
              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 transition truncate"
                      >
                        {job.title}
                      </Link>
                      <span className="text-xs font-semibold text-slate-500">at {job.company}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
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
                      {salaryString && (
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <Coins className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span>{salaryString}</span>
                        </div>
                      )}
                      <span className="text-slate-400">
                        Saved {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {job.summary && (
                      <p className="text-xs text-slate-600 line-clamp-1 pt-1">
                        <strong className="text-slate-700 font-semibold">Summary:</strong> {job.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleUnsave(item.job_id)}
                      disabled={removingId === item.job_id}
                      aria-label="Remove saved job"
                      className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                      title="Remove from saved"
                    >
                      {removingId === item.job_id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
