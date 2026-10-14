'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { getPersonalizedRecommendations } from '../../lib/api/recommendations';
import { RecommendationItem } from '../../lib/types';
import JobCard from '../../components/jobs/JobCard';
import JobCardSkeleton from '../../components/jobs/JobCardSkeleton';
import { 
  Sparkles, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  FileText, 
  User as UserIcon,
  RefreshCw,
  Zap,
  TrendingUp
} from 'lucide-react';

export default function RecommendationsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getPersonalizedRecommendations(30);
      setRecommendations(res.recommendations);
    } catch (err: any) {
      console.error('Failed to fetch recommendations', err);
      setError(err?.message || 'Could not load your personalized recommendations.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      fetchRecommendations();
    } else if (!isAuthLoading && !user) {
      setIsLoading(false);
    }
  }, [user, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>
    );
  }

  // Not logged in view
  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Personalized Job Intelligence
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            JobSpace analyzes your resume, tech skills, and career preferences to match you with compatible opportunities across India.
          </p>
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login?redirect=/recommendations"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <span>Sign In to See Matches</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Header Banner */}
        <div className="rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-8 text-white shadow-xl shadow-blue-500/10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-xs">
                <Target className="h-3.5 w-3.5" />
                <span>Candidate-Aware Matching Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                Jobs Matched For You
              </h1>
              <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
                Ranked using your parsed resume, verified skills, and career preferences. No generic spam — only compatible openings.
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Link
                href="/profile"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-50 transition"
              >
                <FileText className="h-4 w-4" />
                <span>Update Resume & Skills</span>
              </Link>
              <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 px-4 py-2 text-xs font-semibold text-white border border-white/20 transition cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Matches</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center space-y-3">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
            <h3 className="text-sm font-bold text-red-900">Failed to load matches</h3>
            <p className="text-xs text-red-700">{error}</p>
            <button
              onClick={fetchRecommendations}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 transition"
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
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Zap className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No profile matches yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                We couldn&apos;t match your profile against current jobs. Complete your profile details and upload your resume to unlock personalized discovery.
              </p>
            </div>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              <FileText className="h-4 w-4" />
              <span>Complete Profile & Upload Resume</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Top Matches ({recommendations.length} openings)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Sorted by AI Candidate Compatibility
              </span>
            </div>

            <div className="space-y-4">
              {recommendations.map((item) => (
                <div key={item.job.id} className="space-y-2">
                  <JobCard
                    job={item.job}
                    relevanceScore={item.compatibility_score}
                    matchReasons={item.match_reasons}
                  />

                  {/* Additional candidate match breakdown card */}
                  {(item.matched_skills.length > 0 || item.missing_skills.length > 0) && (
                    <div className="mx-2 rounded-xl bg-slate-100/70 border border-slate-200/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
                      {item.matched_skills.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-emerald-800">Your Matching Skills:</span>
                          {item.matched_skills.map((s) => (
                            <span key={s} className="bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded text-[11px] font-medium">
                              ✓ {s}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.missing_skills.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap ml-auto">
                          <span className="font-semibold text-slate-500">Skills to pick up:</span>
                          {item.missing_skills.slice(0, 3).map((s) => (
                            <span key={s} className="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                              + {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
