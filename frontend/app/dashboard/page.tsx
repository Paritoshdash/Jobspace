'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { getSavedJobs } from '../../lib/api/savedJobs';
import { getApplications } from '../../lib/api/applications';
import { SavedJob, Application } from '../../lib/types';
import { 
  LayoutDashboard, 
  Bookmark, 
  Briefcase, 
  Sparkles, 
  Search, 
  ArrowRight, 
  MapPin, 
  LogIn,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setIsLoading(false);
      return;
    }

    if (user) {
      setIsLoading(true);
      Promise.all([
        getSavedJobs(0, 10).catch(() => []),
        getApplications(0, 10).catch(() => []),
      ])
        .then(([saved, apps]) => {
          setSavedJobs(saved);
          setApplications(apps);
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
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
          <h2 className="text-xl font-bold text-slate-900">Sign in to view your dashboard</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Track your saved opportunities, active applications, and account activity in your private dashboard.
          </p>
        </div>
        <Link
          href="/login?redirect=/dashboard"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
        >
          <span>Sign In</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const activeApplicationsCount = applications.filter((app) =>
    ['applied', 'interviewing', 'offered'].includes(app.status.toLowerCase())
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Overview Dashboard</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Welcome back, <strong className="text-slate-800">{user.email}</strong>
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search Jobs</span>
          </Link>
        </div>

        {/* Real Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Positions</span>
              <Bookmark className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{savedJobs.length}</div>
            <p className="text-xs text-slate-500">
              <Link href="/saved" className="text-blue-600 font-semibold hover:underline">
                View all saved jobs →
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</span>
              <Briefcase className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{applications.length}</div>
            <p className="text-xs text-slate-500">
              <Link href="/applications" className="text-blue-600 font-semibold hover:underline">
                Manage applications →
              </Link>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Pipeline</span>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-700">{activeApplicationsCount}</div>
            <p className="text-xs text-slate-500">In review, interviewing, or offered</p>
          </div>
        </div>

        {/* Dual columns for Recently Saved and Recent Applications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recently Saved Jobs */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Recently Saved Jobs</h2>
              </div>
              <Link href="/saved" className="text-xs font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            {savedJobs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <p>No saved jobs found.</p>
                <Link href="/" className="text-blue-600 font-semibold hover:underline inline-block">
                  Search opportunities →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {savedJobs.slice(0, 5).map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/jobs/${item.job.id}`}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 truncate block"
                      >
                        {item.job.title}
                      </Link>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{item.job.company}</span>
                        {item.job.location && (
                          <>
                            <span>•</span>
                            <span className="truncate">{item.job.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/jobs/${item.job.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 shrink-0"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Applications */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Applications</h2>
              </div>
              <Link href="/applications" className="text-xs font-semibold text-blue-600 hover:underline">
                View all
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                <p>No applications tracked yet.</p>
                <Link href="/" className="text-blue-600 font-semibold hover:underline inline-block">
                  Find jobs to apply for →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 5).map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/jobs/${app.job.id}`}
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 truncate block"
                      >
                        {app.job.title}
                      </Link>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{app.job.company}</span>
                        <span>•</span>
                        <span className="capitalize font-medium text-slate-700">{app.status}</span>
                      </div>
                    </div>
                    <Link
                      href="/applications"
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 shrink-0"
                    >
                      Update →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
