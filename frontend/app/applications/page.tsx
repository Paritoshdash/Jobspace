'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth/AuthContext';
import { 
  getApplications, 
  updateApplicationStatus, 
  deleteApplication 
} from '../../lib/api/applications';
import { Application } from '../../lib/types';
import { 
  Briefcase, 
  Trash2, 
  MapPin, 
  ArrowRight, 
  Calendar, 
  LogIn, 
  Loader2,
  Clock,
  Sparkles
} from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { value: 'interviewing', label: 'Interviewing', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'offered', label: 'Offer Received', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'rejected', label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'bg-slate-50 text-slate-600 border-slate-200' },
];

export default function ApplicationsPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      setIsLoading(false);
      return;
    }

    if (user) {
      setIsLoading(true);
      getApplications(0, 100)
        .then((data) => setApplications(data))
        .catch((err) => {
          console.error('Failed to load applications', err);
          setError(err?.message || 'Could not load your job applications.');
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, isAuthLoading]);

  const handleStatusChange = async (appId: number, newStatus: string) => {
    if (updatingId) return;
    setUpdatingId(appId);

    try {
      const updated = await updateApplicationStatus(appId, newStatus);
      setApplications((prev) =>
        prev.map((app) => (app.id === appId ? { ...app, status: updated.status, updated_at: updated.updated_at } : app))
      );
    } catch (err: any) {
      console.error('Failed to update status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (appId: number) => {
    if (deletingId) return;
    setDeletingId(appId);

    try {
      await deleteApplication(appId);
      setApplications((prev) => prev.filter((app) => app.id !== appId));
    } catch (err: any) {
      console.error('Failed to delete application', err);
    } finally {
      setDeletingId(null);
    }
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
          <h2 className="text-xl font-bold text-slate-900">Sign in to track applications</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Log in to manage your active job submissions, interviews, and offers in one organized dashboard.
          </p>
        </div>
        <Link
          href="/login?redirect=/applications"
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Application Tracker</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Tracking {applications.length} {applications.length === 1 ? 'application' : 'applications'} across your job search
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 self-start sm:self-auto"
          >
            <span>Find new roles</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-xs text-red-700">
            {error}
          </div>
        )}

        {applications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">No applications tracked yet</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                When you find roles you want to apply to, mark them as applied on the job details page.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <span>Explore Opportunities</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const job = app.job;
              const currentStatusConfig =
                STATUS_OPTIONS.find((s) => s.value === app.status) || STATUS_OPTIONS[0];

              return (
                <div
                  key={app.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
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
                      {app.applied_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>Updated {new Date(app.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status selector & Actions */}
                  <div className="flex items-center gap-3 shrink-0 self-stretch sm:self-auto justify-between sm:justify-start pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Status:</span>
                      <select
                        value={app.status}
                        disabled={updatingId === app.id}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentStatusConfig.color}`}
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-white text-slate-900 font-normal">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                      >
                        View Job
                      </Link>

                      <button
                        onClick={() => handleDelete(app.id)}
                        disabled={deletingId === app.id}
                        aria-label="Remove application"
                        className="rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Remove tracking"
                      >
                        {deletingId === app.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
