'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { getSavedJobs } from '../../lib/api/savedJobs';
import { getApplications } from '../../lib/api/applications';
<<<<<<< HEAD
import { getMyProfile } from '../../lib/api/profile';
import { getActiveResume } from '../../lib/api/resume';
import { getPersonalizedRecommendations } from '../../lib/api/recommendations';
import { SavedJob, Application, CandidateProfile, Resume, RecommendationItem } from '../../lib/types';
import JobCard from '../../components/jobs/JobCard';
=======
import { SavedJob, Application } from '../../lib/types';
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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
<<<<<<< HEAD
  Clock,
  FileText,
  Upload,
  Target,
  Zap,
  ShieldCheck
=======
  Clock
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

<<<<<<< HEAD
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [activeResume, setActiveResume] = useState<Resume | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
=======
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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
<<<<<<< HEAD
        getMyProfile().catch(() => null),
        getActiveResume().catch(() => null),
        getPersonalizedRecommendations(4).then((res) => res.recommendations).catch(() => []),
        getSavedJobs(0, 10).catch(() => []),
        getApplications(0, 20).catch(() => []),
      ])
        .then(([prof, resu, recs, saved, apps]) => {
          setProfile(prof);
          setActiveResume(resu);
          setRecommendations(recs);
=======
        getSavedJobs(0, 10).catch(() => []),
        getApplications(0, 10).catch(() => []),
      ])
        .then(([saved, apps]) => {
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
          setSavedJobs(saved);
          setApplications(apps);
        })
        .finally(() => setIsLoading(false));
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading || (user && isLoading)) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 space-y-6">
<<<<<<< HEAD
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
=======
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
          <div className="h-24 bg-white border border-slate-200 rounded-xl animate-pulse" />
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center space-y-5">
<<<<<<< HEAD
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
          <LogIn className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to your Dashboard</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Track your candidate profile, resume versions, personalized matches, and application pipeline.
=======
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LogIn className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">Sign in to view your dashboard</h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Track your saved opportunities, active applications, and account activity in your private dashboard.
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
          </p>
        </div>
        <Link
          href="/login?redirect=/dashboard"
<<<<<<< HEAD
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition"
=======
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition"
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
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
<<<<<<< HEAD
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Dashboard</h1>
            </div>
            <p className="text-xs text-slate-500">
              Welcome back, <span className="font-semibold text-slate-700">{profile?.full_name || user.email}</span> • India Job Intelligence
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Jobs For Me</span>
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            >
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Search All</span>
            </Link>
          </div>
        </div>

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Profile Completion */}
          <Link
            href="/profile"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Strength</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:scale-110 transition">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{profile?.completion_percentage || 0}%</span>
              <span className="text-[11px] font-semibold text-blue-600 group-hover:underline">Update &rarr;</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">
              {profile?.skills?.length || 0} skills verified
            </p>
          </Link>

          {/* 2. Resume Status */}
          <Link
            href="/profile"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Resume</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-110 transition">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-black text-slate-900 truncate">
                {activeResume ? `v${activeResume.version} Active` : 'None Uploaded'}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400 truncate">
              {activeResume ? activeResume.file_name : 'Upload PDF/DOCX to match'}
            </p>
          </Link>

          {/* 3. Saved Jobs */}
          <Link
            href="/saved"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saved Positions</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition">
                <Bookmark className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{savedJobs.length}</span>
              <span className="text-[11px] font-semibold text-emerald-700 group-hover:underline">View saved &rarr;</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Bookmarked for later</p>
          </Link>

          {/* 4. Active Applications */}
          <Link
            href="/applications"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-blue-400 transition"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Applications</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 text-violet-600 group-hover:scale-110 transition">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{activeApplicationsCount}</span>
              <span className="text-[11px] font-semibold text-violet-700 group-hover:underline">Pipeline &rarr;</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{applications.length} total logged</p>
          </Link>
        </div>

        {/* Recommended Jobs Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Top Candidate Matches For You</span>
              </h2>
              <p className="text-xs text-slate-500">Based on your skills and target role preferences</p>
            </div>
            <Link
              href="/recommendations"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>View All Matches</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((item) => (
                <JobCard
                  key={item.job.id}
                  job={item.job}
                  relevanceScore={item.compatibility_score}
                  matchReasons={item.match_reasons}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center space-y-3">
              <Zap className="mx-auto h-8 w-8 text-blue-500" />
              <p className="text-xs font-semibold text-slate-700">Add your skills or upload a resume to see top matches</p>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Go to Profile</span>
              </Link>
            </div>
          )}
        </div>

        {/* Real-time ATS Freshness Badge */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-slate-900">Multi-Source ATS Freshness Guaranteed</h3>
              <p className="text-[11px] text-slate-500">
                Jobs are continuously acquired and verified directly from company Greenhouse, Lever, and Ashby boards.
              </p>
            </div>
          </div>
          <span className="rounded-lg bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/80 shrink-0">
            NEAR REAL-TIME
          </span>
=======
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
>>>>>>> e51ad40449a03608e11afea6df7a10ca56c252f5
        </div>
      </div>
    </div>
  );
}
