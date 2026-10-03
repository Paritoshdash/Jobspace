import { apiFetch } from './client';
import { Job, JobFacets, JobSearchResult, SearchFilters } from '../types';

export async function searchJobs(filters: SearchFilters): Promise<JobSearchResult[]> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.skip !== undefined) params.set('skip', filters.skip.toString());
  if (filters.limit !== undefined) params.set('limit', filters.limit.toString());
  if (filters.company) params.set('company', filters.company);
  if (filters.location) params.set('location', filters.location);
  if (filters.experience_level) params.set('experience_level', filters.experience_level);
  if (filters.employment_type) params.set('employment_type', filters.employment_type);
  if (filters.min_salary !== undefined && filters.min_salary !== null) {
    params.set('min_salary', filters.min_salary.toString());
  }
  if (filters.max_salary !== undefined && filters.max_salary !== null) {
    params.set('max_salary', filters.max_salary.toString());
  }

  return apiFetch<JobSearchResult[]>(`/api/v1/jobs/search?${params.toString()}`);
}

export async function listJobs(filters: Omit<SearchFilters, 'q' | 'min_salary' | 'max_salary'>): Promise<Job[]> {
  const params = new URLSearchParams();
  if (filters.skip !== undefined) params.set('skip', filters.skip.toString());
  if (filters.limit !== undefined) params.set('limit', filters.limit.toString());
  if (filters.company) params.set('company', filters.company);
  if (filters.location) params.set('location', filters.location);
  if (filters.experience_level) params.set('experience_level', filters.experience_level);
  if (filters.employment_type) params.set('employment_type', filters.employment_type);

  const queryString = params.toString();
  return apiFetch<Job[]>(`/api/v1/jobs${queryString ? `?${queryString}` : ''}`);
}

export async function getJobById(id: number): Promise<Job> {
  return apiFetch<Job>(`/api/v1/jobs/${id}`);
}

export async function getJobFacets(): Promise<JobFacets> {
  return apiFetch<JobFacets>('/api/v1/jobs/facets');
}

export async function summarizeJob(id: number): Promise<{ summary: string }> {
  return apiFetch<{ summary: string }>(`/api/v1/jobs/${id}/summarize`, {
    method: 'POST',
  });
}
