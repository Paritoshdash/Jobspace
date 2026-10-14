'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth/AuthContext';
import { updateMyProfile, addCandidateSkill } from '../../lib/api/profile';
import { uploadResume } from '../../lib/api/resume';
import { Sparkles, ArrowRight, Check, Upload, Loader2, Target, Briefcase } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [headline, setHeadline] = useState('');
  const [preferredRole, setPreferredRole] = useState('');
  const [preferredLocation, setPreferredLocation] = useState('Bengaluru');
  const [experienceLevel, setExperienceLevel] = useState('junior');
  const [expectedSalaryLPA, setExpectedSalaryLPA] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleAddSkill = () => {
    if (skillInput.trim() && !skillsList.includes(skillInput.trim())) {
      setSkillsList([...skillsList, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const salaryInt = expectedSalaryLPA ? Math.round(parseFloat(expectedSalaryLPA) * 100000) : null;
      await updateMyProfile({
        full_name: fullName.trim() || undefined,
        headline: headline.trim() || undefined,
        preferred_role: preferredRole.trim() || undefined,
        preferred_location: preferredLocation.trim() || undefined,
        experience_level: experienceLevel || undefined,
        expected_salary_min: salaryInt || undefined,
      });

      for (const skill of skillsList) {
        await addCandidateSkill(skill).catch(() => {});
      }

      if (resumeFile) {
        await uploadResume(resumeFile, true).catch(() => {});
      }

      router.push('/recommendations');
    } catch (err) {
      console.error(err);
      router.push('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-200/90 p-8 shadow-xl space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
              {step}/3
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {step === 1 && 'Basic Information & Target Role'}
                {step === 2 && 'Technical Skills'}
                {step === 3 && 'Upload Resume & Finalize'}
              </h2>
              <p className="text-[11px] text-slate-400">Step {step} of 3</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
          >
            Skip for now
          </button>
        </div>

        {/* Step 1: Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rahul Verma"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Software Engineer / Python Developer"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Target Role</label>
                <input
                  type="text"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                  placeholder="e.g. Backend Developer"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Preferred City</label>
                <select
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Pune">Pune</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi-NCR">Delhi-NCR</option>
                  <option value="Chennai">Chennai</option>
                  <option value="Remote">Remote - India</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Experience</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
                >
                  <option value="junior">Junior / Fresher (0-2 yrs)</option>
                  <option value="mid">Mid Level (3-5 yrs)</option>
                  <option value="senior">Senior (5+ yrs)</option>
                  <option value="intern">Internship</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Expected Salary (&#8377; LPA)</label>
                <input
                  type="number"
                  step="0.5"
                  value={expectedSalaryLPA}
                  onChange={(e) => setExpectedSalaryLPA(e.target.value)}
                  placeholder="e.g. 10 (10 LPA)"
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition"
            >
              <span>Next: Add Skills</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Step 2: Skills */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Add your core programming languages, frameworks, and technical competencies.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Type skill & press Enter (e.g. Python, SQL, Docker)"
                className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2.5 text-xs font-bold text-white"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-16 p-3 rounded-2xl bg-slate-50 border border-slate-100">
              {skillsList.length > 0 ? (
                skillsList.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 border border-slate-200"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => setSkillsList(skillsList.filter((s) => s !== skill))}
                      className="text-slate-400 hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 m-auto">No skills added yet</span>
              )}
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-600">Quick add:</span>
              <div className="flex flex-wrap gap-1.5">
                {['Python', 'FastAPI', 'React', 'TypeScript', 'SQL', 'Docker', 'Machine Learning', 'AWS'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => !skillsList.includes(s) && setSkillsList([...skillsList, s])}
                    className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-3 text-xs font-bold text-white shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <span>Next: Upload Resume</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Resume */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center space-y-3 bg-slate-50/50">
              <Upload className="mx-auto h-10 w-10 text-blue-600" />
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {resumeFile ? resumeFile.name : 'Upload your Resume (PDF or DOCX)'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JobSpace will extract experience, education, and keywords to rank job compatibility.
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,.docx"
                id="onboarding-resume"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="onboarding-resume"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
              >
                <span>{resumeFile ? 'Change File' : 'Browse File'}</span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinish}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-xs font-bold text-white shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Finalizing Profile & Matches...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Complete & See Matching Jobs</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
