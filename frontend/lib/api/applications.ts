import { apiFetch } from './client';
import { Application } from '../types';

export async function getApplications(skip: number = 0, limit: number = 50): Promise<Application[]> {
  return apiFetch<Application[]>(`/api/v1/applications?skip=${skip}&limit=${limit}`);
}

export async function createApplication(jobId: number, status: string = 'applied'): Promise<Application> {
  return apiFetch<Application>('/api/v1/applications', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, status }),
  });
}

export async function getApplicationById(applicationId: number): Promise<Application> {
  return apiFetch<Application>(`/api/v1/applications/${applicationId}`);
}

export async function updateApplicationStatus(applicationId: number, status: string): Promise<Application> {
  return apiFetch<Application>(`/api/v1/applications/${applicationId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteApplication(applicationId: number): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/v1/applications/${applicationId}`, {
    method: 'DELETE',
  });
}
