'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import {
  getMyProfile,
  updateMyProfile,
  addCandidateSkill,
  deleteCandidateSkill,
  addCandidateEducation,
  deleteCandidateEducation,
  addCandidateExperience,
  deleteCandidateExperience,
} from '../../lib/api/profile';
import {
  uploadResume,
  getResumes,
  getResumeDownloadUrl,
} from '../../lib/api/resume';
import { CandidateProfile, Resume } from '../../lib/types';
import {
  User as UserIcon,
  FileText,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  GraduationCap,
  Sparkles,
  Download,
  Clock,
  Layers,
  Save,
  Loader2,
  IndianRupee,
  MapPin,
  Target
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resume upload state
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [resumeSuccess, setResumeSuccess] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [preferredEmployment, setPreferredEmployment] = useState('');
  const [expectedSalaryLPA, setExpectedSalaryLPA] = useState<string>('');

  // Skill input
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillProficiency, setNewSkillProficiency] = useState('Intermediate');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Education input modal
  const [showEduModal, setShowEduModal] = useState(false);
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStartYear, setEduStartYear] = useState('');
  const [eduEndYear, setEduEndYear] = useState('');

  // Experience input modal
  const [showExpModal, setShowExpModal] = useState(false);
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileData, resumesData] = await Promise.all([
        getMyProfile(),
        getResumes().catch(() => []),
      ]);
      setProfile(profileData);
      setResumes(resumesData);

      // Populate form
      setFullName(profileData.full_name || '');
      setHeadline(profileData.headline || '');
      setSummary(profileData.summary || '');
      setPhone(profileData.phone || '');
      setLocation(profileData.location || '');
      setExperienceLevel(profileData.experience_level || '');
      setPreferredRole(profileData.preferred_role || '');
      setPreferredLocation(profileData.preferred_location || '');
      setPreferredEmployment(profileData.preferred_employment_type || '');
      if (profileData.expected_salary_min) {
        setExpectedSalaryLPA((profileData.expected_salary_min / 100000).toString());
      }
    } catch (err: any) {
      console.error('Failed to load profile data', err);
      setError(err?.message || 'Failed to load profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      loadData();
    } else if (!isAuthLoading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, isAuthLoading]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const salaryInt = expectedSalaryLPA ? Math.round(parseFloat(expectedSalaryLPA) * 100000) : null;
      const updated = await updateMyProfile({
        full_name: fullName.trim() || null,
        headline: headline.trim() || null,
        summary: summary.trim() || null,
        phone: phone.trim() || null,
        location: location.trim() || null,
        experience_level: experienceLevel || null,
        preferred_role: preferredRole.trim() || null,
        preferred_location: preferredLocation.trim() || null,
        preferred_employment_type: preferredEmployment || null,
        expected_salary_min: salaryInt,
      });
      setProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setIsAddingSkill(true);
    try {
      await addCandidateSkill(newSkillName.trim(), newSkillProficiency);
      setNewSkillName('');
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to add skill.');
    } finally {
      setIsAddingSkill(false);
    }
  };

  const handleDeleteSkill = async (skillId: number) => {
    try {
      await deleteCandidateSkill(skillId);
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete skill.');
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduInstitution.trim() || !eduDegree.trim()) return;
    try {
      await addCandidateEducation({
        institution: eduInstitution.trim(),
        degree: eduDegree.trim(),
        field_of_study: eduField.trim() || undefined,
        start_year: eduStartYear ? parseInt(eduStartYear, 10) : undefined,
        end_year: eduEndYear ? parseInt(eduEndYear, 10) : undefined,
      });
      setShowEduModal(false);
      setEduInstitution('');
      setEduDegree('');
      setEduField('');
      setEduStartYear('');
      setEduEndYear('');
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to add education.');
    }
  };

  const handleDeleteEducation = async (eduId: number) => {
    try {
      await deleteCandidateEducation(eduId);
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete education.');
    }
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany.trim() || !expTitle.trim()) return;
    try {
      await addCandidateExperience({
        company: expCompany.trim(),
        title: expTitle.trim(),
        location: expLocation.trim() || undefined,
        start_date: expStartDate.trim() || undefined,
        end_date: expEndDate.trim() || undefined,
        is_current: expIsCurrent,
        description: expDescription.trim() || undefined,
      });
      setShowExpModal(false);
      setExpCompany('');
      setExpTitle('');
      setExpLocation('');
      setExpStartDate('');
      setExpEndDate('');
      setExpDescription('');
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to add experience.');
    }
  };

  const handleDeleteExperience = async (expId: number) => {
    try {
      await deleteCandidateExperience(expId);
      const updated = await getMyProfile();
      setProfile(updated);
    } catch (err: any) {
      alert(err?.message || 'Failed to delete experience.');
    }
  };

  const handleResumeFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingResume(true);
    setError(null);
    setResumeSuccess(null);

    try {
      const uploaded = await uploadResume(file, true);
      setResumeSuccess(`Successfully parsed ${uploaded.file_name} (v${uploaded.version}) and updated profile!`);
      // Reload profile & resumes
      await loadData();
    } catch (err: any) {
      setError(err?.message || 'Failed to upload and parse resume.');
    } finally {
      setIsUploadingResume(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-lg" />
        <div className="h-40 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        <div className="h-64 bg-white border border-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const currentResume = resumes.find((r) => r.is_current);

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Page Title & Profile Completion */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Candidate Profile</span>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 border border-blue-200/80">
                  {user?.email}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Your profile powers the AI candidate-matching engine to deliver strictly relevant jobs across India.
              </p>
            </div>

            <Link
              href="/recommendations"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 transition shrink-0"
            >
              <Sparkles className="h-4 w-4" />
              <span>View Matched Jobs</span>
            </Link>
          </div>

          {/* Completion Progress Bar */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-700">Profile Strength</span>
              <span className="text-blue-600">{profile?.completion_percentage || 0}% Complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${profile?.completion_percentage || 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Alerts */}
        {saveSuccess && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {resumeSuccess && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs font-semibold text-blue-800 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>{resumeSuccess}</span>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Resume Intelligence Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Resume Intelligence & Versioning</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload your latest resume (PDF or DOCX). Text, education, and skills are extracted locally.
              </p>
            </div>

            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx"
                onChange={handleResumeFileSelect}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className={`inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer ${
                  isUploadingResume ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                {isUploadingResume ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Parsing Resume...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>{currentResume ? 'Upload New Version' : 'Upload Resume'}</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {currentResume ? (
            <div className="space-y-4">
              <div className="rounded-2xl bg-gradient-to-r from-blue-50/60 to-indigo-50/60 border border-blue-200/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{currentResume.file_name}</span>
                    <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      v{currentResume.version} Current
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Uploaded on {new Date(currentResume.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {(currentResume.file_size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <a
                  href={getResumeDownloadUrl(currentResume.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
                >
                  <Download className="h-3.5 w-3.5 text-slate-500" />
                  <span>Download</span>
                </a>
              </div>

              {/* Version History */}
              {resumes.length > 1 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    Resume Version History
                  </span>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                    {resumes.map((r) => (
                      <div key={r.id} className="p-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800">Version {r.version}</span>
                          <span className="text-slate-500">({r.file_name})</span>
                          {r.is_current && (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Active</span>
                          )}
                        </div>
                        <a
                          href={getResumeDownloadUrl(r.id)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-2 bg-slate-50/50">
              <Upload className="mx-auto h-8 w-8 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700">No resume uploaded yet</p>
              <p className="text-[11px] text-slate-500">Upload your PDF or DOCX resume to auto-fill skills and get matched.</p>
            </div>
          )}
        </div>

        {/* 2. Candidate Basic Info & Career Preferences Form */}
        <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              <span>Personal Details & Preferences</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Specify your target roles and salary expectations in Indian standard format.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Paritosh Dash"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. AI / Machine Learning Engineer"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current City</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, India"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Level</option>
                <option value="intern">Internship / Student</option>
                <option value="junior">Junior / Fresher (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Target Role Title</label>
              <input
                type="text"
                value={preferredRole}
                onChange={(e) => setPreferredRole(e.target.value)}
                placeholder="e.g. Python Backend Developer"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Preferred Location</label>
              <input
                type="text"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Hyderabad, or Remote"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Min Expected Salary (&#8377; LPA)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  value={expectedSalaryLPA}
                  onChange={(e) => setExpectedSalaryLPA(e.target.value)}
                  placeholder="e.g. 12 (for ₹12 LPA)"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">LPA</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Professional Summary</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Highlight your core expertise, key achievements, and domain focus..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
            >
              {isSavingProfile ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Profile</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* 3. Skills Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span>Technical Skills</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Skills directly increase candidate compatibility scores for matching jobs.
            </p>
          </div>

          {/* Add skill form */}
          <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. Python, Docker, React, FastAPI)"
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
            />
            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
            <button
              type="submit"
              disabled={isAddingSkill || !newSkillName.trim()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-bold text-white transition disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </form>

          {/* Skills list */}
          <div className="flex flex-wrap gap-2 pt-2">
            {profile?.skills && profile.skills.length > 0 ? (
              profile.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center gap-2 rounded-xl bg-slate-100/90 border border-slate-200/70 pl-3 pr-2 py-1.5 text-xs font-semibold text-slate-800 group"
                >
                  <span>{skill.name}</span>
                  <span className="text-[10px] font-medium text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {skill.proficiency || 'Intermediate'}
                  </span>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                    title="Remove skill"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No skills added yet. Add skills or upload a resume to populate.</p>
            )}
          </div>
        </div>

        {/* 4. Experience Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                <span>Work Experience</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Your employment history and technical contributions.</p>
            </div>
            <button
              onClick={() => setShowExpModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Position</span>
            </button>
          </div>

          <div className="space-y-3">
            {profile?.experiences && profile.experiences.length > 0 ? (
              profile.experiences.map((exp) => (
                <div key={exp.id} className="rounded-2xl border border-slate-200/80 p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{exp.title}</h3>
                    <p className="text-xs font-semibold text-slate-600">{exp.company} {exp.location && `• ${exp.location}`}</p>
                    <p className="text-[11px] text-slate-400">
                      {exp.start_date || 'N/A'} – {exp.is_current ? 'Present' : exp.end_date || 'N/A'}
                    </p>
                    {exp.description && (
                      <p className="text-xs text-slate-600 pt-1 leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No experience entries recorded.</p>
            )}
          </div>
        </div>

        {/* 5. Education Section */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                <span>Education</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Degrees, academic background, and universities.</p>
            </div>
            <button
              onClick={() => setShowEduModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          <div className="space-y-3">
            {profile?.educations && profile.educations.length > 0 ? (
              profile.educations.map((edu) => (
                <div key={edu.id} className="rounded-2xl border border-slate-200/80 p-4 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900">{edu.degree} {edu.field_of_study && `in ${edu.field_of_study}`}</h3>
                    <p className="text-xs font-semibold text-slate-600">{edu.institution}</p>
                    {(edu.start_year || edu.end_year) && (
                      <p className="text-[11px] text-slate-400">{edu.start_year} – {edu.end_year || 'Present'}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">No education entries recorded.</p>
            )}
          </div>
        </div>
      </div>

      {/* Education Modal */}
      {showEduModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Education</h3>
            <form onSubmit={handleAddEducation} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Institution (e.g. IIT Bombay / NIT / BITS)"
                value={eduInstitution}
                onChange={(e) => setEduInstitution(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                required
                placeholder="Degree (e.g. B.Tech / M.Tech / BCA)"
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Field of Study (e.g. Computer Science)"
                value={eduField}
                onChange={(e) => setEduField(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Start Year"
                  value={eduStartYear}
                  onChange={(e) => setEduStartYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
                <input
                  type="number"
                  placeholder="End Year"
                  value={eduEndYear}
                  onChange={(e) => setEduEndYear(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEduModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs"
                >
                  Save Degree
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Experience</h3>
            <form onSubmit={handleAddExperience} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Company Name"
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                required
                placeholder="Title (e.g. Software Engineer)"
                value={expTitle}
                onChange={(e) => setExpTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <input
                type="text"
                placeholder="Location (e.g. Bengaluru / Remote)"
                value={expLocation}
                onChange={(e) => setExpLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Start (e.g. 2022-06)"
                  value={expStartDate}
                  onChange={(e) => setExpStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
                />
                <input
                  type="text"
                  placeholder="End (e.g. 2024-01)"
                  disabled={expIsCurrent}
                  value={expEndDate}
                  onChange={(e) => setExpEndDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500 disabled:bg-slate-100"
                />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={expIsCurrent}
                  onChange={(e) => setExpIsCurrent(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>I currently work here</span>
              </label>
              <textarea
                rows={2}
                placeholder="Brief description of responsibilities..."
                value={expDescription}
                onChange={(e) => setExpDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:outline-none focus:border-blue-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs"
                >
                  Save Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
