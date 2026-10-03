'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getJobById, summarizeJob } from '../../../lib/api/jobs';
import { saveJob, unsaveJob, checkJobSaved } from '../../../lib/api/savedJobs';
import { createApplication, getApplications } from '../../../lib/api/applications';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Job, Application } from '../../../lib/types';
import { 
  ArrowLeft, 
  MapPin, 
  Briefcase, 
  Clock, 
  Coins, 
  Bookmark, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Building2, 
  Calendar,
  AlertCircle,
  Loader2,
  Send
} from 'lucide-react';

interface JobDetailsProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailsPage({ params }: JobDetailsProps) {
  const resolvedParams = use(params);
  const jobId = parseInt(resolvedParams.id, 10);
  const router = useRouter();
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(jobId)) {
      setError('Invalid job identifier.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getJobById(jobId)
      .then((data) => {
        setJob(data);
        setAiSummary(data.summary || null);
        if (data.is_saved !== undefined && data.is_saved !== null) {
          setIsSaved(data.is_saved);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load job details.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [jobId]);

  // Check saved state and existing applications if user is logged in
  useEffect(() => {
    if (user && !isNaN(jobId)) {
      checkJobSaved(jobId)
        .then((res) => setIsSaved(res.is_saved))
        .catch(() => {});

      getApplications(0, 100)
        .then((apps) => {
          const matched = apps.find((a) => a.job_id === jobId);
          if (matched) {
            setExistingApplication(matched);
          }
        })
        .catch(() => {});
    }
  }, [user, jobId]);

  const handleSaveToggle = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      if (isSaved) {
        await unsaveJob(jobId);
        setIsSaved(false);
      } else {
        await saveJob(jobId);
        setIsSaved(true);
      }
    } catch (err: any) {
      console.error('Failed to toggle save state', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTrackApplication = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (isApplying || existingApplication) return;
    setIsApplying(true);

    try {
      const app = await createApplication(jobId, 'applied');
      setExistingApplication(app);
      setApplySuccess(true);
      setTimeout(() => setApplySuccess(false), 5000);
    } catch (err: any) {
      console.error('Failed to track application', err);
    } finally {
      setIsApplying(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (isSummarizing) return;
    setIsSummarizing(true);
    try {
      const res = await summarizeJob(jobId);
      if (res.summary) {
        setAiSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to summarize job', err);
    } finally {
      setIsSummarizing(false);
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

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-6 w-28 bg-slate-200 animate-pulse rounded mb-6" />
        <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs space-y-6 animate-pulse">
          <div className="h-8 w-3/5 bg-slate-200 rounded" />
          <div className="h-4 w-1/4 bg-slate-100 rounded" />
          <div className="flex gap-4">
            <div className="h-6 w-24 bg-slate-100 rounded" />
            <div className="h-6 w-24 bg-slate-100 rounded" />
          </div>
          <div className="h-40 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Job Not Found</h2>
        <p className="text-sm text-slate-600">{error || 'The job you requested does not exist or has been removed.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to search
        </Link>
      </div>
    );
  }

  const salaryString = formatSalary(job.salary_min, job.salary_max);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to search
          </Link>
        </div>

        {/* Header Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  {job.source}
                </span>
                {job.posted_at && (
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Calendar className="h-3 w-3" />
                    Posted {new Date(job.posted_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {job.title}
              </h1>
              <div className="flex items-center gap-2 text-base font-semibold text-slate-700">
                <Building2 className="h-4 w-4 text-slate-400" />
                <span>{job.company}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                  isSaved
                    ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-blue-600' : ''}`} />
                {isSaved ? 'Saved' : 'Save Job'}
              </button>

              {job.source_url && (
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-xs transition"
                >
                  <span>Apply on Company Site</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Meta Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 text-xs font-medium text-slate-600">
            {job.location && (
              <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 border border-slate-200/60">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span>{job.location}</span>
              </div>
            )}
            {job.employment_type && (
              <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 border border-slate-200/60">
                <Briefcase className="h-3.5 w-3.5 text-slate-500" />
                <span>{job.employment_type}</span>
              </div>
            )}
            {job.experience_level && !job.experience_level.includes('|') && (
              <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-3 py-1.5 border border-slate-200/60">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span className="capitalize">{job.experience_level}</span>
              </div>
            )}
            {salaryString && (
              <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-emerald-800 font-semibold">
                <Coins className="h-3.5 w-3.5 text-emerald-600" />
                <span>{salaryString}</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Tracker Banner */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-900">Application Tracking</h3>
            <p className="text-xs text-slate-500">
              Keep track of this job in your JobSpace application pipeline.
            </p>
          </div>

          {existingApplication ? (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Tracked as: <strong className="capitalize">{existingApplication.status}</strong>
              </span>
              <Link
                href="/applications"
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                View in Tracker
              </Link>
            </div>
          ) : (
            <button
              onClick={handleTrackApplication}
              disabled={isApplying}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Mark as Applied</span>
                </>
              )}
            </button>
          )}
        </div>

        {applySuccess && (
          <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-xs font-medium text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Job added to your application tracker! You can manage its interview status under Applications.</span>
          </div>
        )}

        {/* AI Summary Section */}
        <div className="rounded-xl border border-blue-100 bg-linear-to-b from-blue-50/60 to-white p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">AI Intelligence Summary</h2>
            </div>

            {!aiSummary && (
              <button
                onClick={handleGenerateSummary}
                disabled={isSummarizing}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <span>Generate Summary</span>
                )}
              </button>
            )}
          </div>

          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {aiSummary ? (
              <p className="font-normal">{aiSummary}</p>
            ) : (
              <p className="text-slate-500 italic">
                AI summary is pending for this position. Click &ldquo;Generate Summary&rdquo; to analyze it using our local LLM.
              </p>
            )}
          </div>
        </div>

        {/* Skills Section */}
        {job.skills && job.skills.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Required Skills & Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span
                  key={`${skill}-${idx}`}
                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200/60"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Job Description */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Role Description</h2>
          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {job.description}
          </div>
        </div>
      </div>
    </div>
  );
}
