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
  source: string;
  source_url?: string | null;
  posted_at?: string | null;
  created_at: string;
  updated_at: string;
  is_saved?: boolean | null;
  skills: string[];
}

export interface JobSearchResult {
  job: Job;
  relevance_score: number;
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

export interface SearchFilters {
  q?: string;
  location?: string;
  company?: string;
  experience_level?: string;
  employment_type?: string;
  min_salary?: number;
  max_salary?: number;
  skip?: number;
  limit?: number;
}
