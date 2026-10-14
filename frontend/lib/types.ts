export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  summary?: string | null;
  analysis_status: string;
  location?: string | null;
  employment_type?: string | null;
  experience_level?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  status?: string;
  is_active?: boolean;
  source: string;
  source_url?: string | null;
  posted_at?: string | null;
  first_seen_at?: string | null;
  last_seen_at?: string | null;
  created_at: string;
  updated_at: string;
  is_saved?: boolean | null;
  skills: string[];
}

export interface JobSearchResult {
  job: Job;
  relevance_score: number;
  match_reasons?: string[];
}

export interface JobFacets {
  locations: string[];
  companies: string[];
  experience_levels: string[];
  employment_types: string[];
  sources: string[];
  total_jobs: number;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
}

export interface SavedJob {
  id: number;
  user_id: number;
  job_id: number;
  created_at: string;
  job: Job;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected' | 'withdrawn' | string;
  applied_at?: string | null;
  updated_at: string;
  job: Job;
}

export interface Education {
  id: number;
  candidate_id: number;
  institution: string;
  degree: string;
  field_of_study?: string | null;
  start_year?: number | null;
  end_year?: number | null;
  grade?: string | null;
}

export interface Experience {
  id: number;
  candidate_id: number;
  company: string;
  title: string;
  location?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
}

export interface CandidateSkill {
  id: number;
  skill_id: number;
  name: string;
  normalized_name: string;
  proficiency?: string | null;
  years_experience?: number | null;
}

export interface CandidateProfile {
  id: number;
  user_id: number;
  full_name?: string | null;
  headline?: string | null;
  summary?: string | null;
  phone?: string | null;
  location?: string | null;
  experience_level?: string | null;
  preferred_location?: string | null;
  preferred_role?: string | null;
  preferred_employment_type?: string | null;
  expected_salary_min?: number | null;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
  skills: CandidateSkill[];
  educations: Education[];
  experiences: Experience[];
}

export interface Resume {
  id: number;
  user_id: number;
  version: number;
  is_current: boolean;
  file_name: string;
  file_size: number;
  content_type: string;
  has_parsed_text: boolean;
  extracted_summary?: string | null;
  extracted_skills: string[];
  created_at: string;
  updated_at: string;
}

export interface RecommendationItem {
  job: Job;
  compatibility_score: number;
  match_percentage: number;
  match_reasons: string[];
  skill_match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
}

export interface CandidateRecommendationsResponse {
  total_matches: number;
  recommendations: RecommendationItem[];
}

export interface AcquisitionStatus {
  status: string;
  last_run_at?: string | null;
  source_type?: string;
  sources_count?: number;
  total_created?: number;
  total_skipped?: number;
  duration_seconds?: number;
  error_message?: string | null;
}

export interface SearchFilters {
  q?: string;
  location?: string;
  company?: string;
  experience_level?: string;
  employment_type?: string;
  min_salary?: number;
  max_salary?: number;
  sort_by?: 'relevance' | 'newest' | 'salary';
  skip?: number;
  limit?: number;
}
