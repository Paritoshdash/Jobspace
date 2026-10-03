import { apiFetch } from './client';
import { SavedJob } from '../types';

export async function getSavedJobs(skip: number = 0, limit: number = 50): Promise<SavedJob[]> {
  return apiFetch<SavedJob[]>(`/api/v1/saved-jobs?skip=${skip}&limit=${limit}`);
}

export async function saveJob(jobId: number): Promise<SavedJob> {
  return apiFetch<SavedJob>(`/api/v1/saved-jobs/${jobId}`, {
    method: 'POST',
  });
}

export async function unsaveJob(jobId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/v1/saved-jobs/${jobId}`, {
    method: 'DELETE',
  });
}

export async function checkJobSaved(jobId: number): Promise<{ job_id: number; is_saved: boolean }> {
  return apiFetch<{ job_id: number; is_saved: boolean }>(`/api/v1/saved-jobs/${jobId}/status`);
}
