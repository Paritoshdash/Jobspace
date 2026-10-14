import { Resume } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function uploadResume(file: File, syncToProfile: boolean = true): Promise<Resume> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jobspace_token') : null;
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/v1/resumes/upload?sync_to_profile=${syncToProfile}`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to upload resume.');
  }

  return res.json();
}

export async function getResumes(): Promise<Resume[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jobspace_token') : null;
  const res = await fetch(`${API_BASE_URL}/api/v1/resumes`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to load resumes.');
  }

  return res.json();
}

export async function getActiveResume(): Promise<Resume | null> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('jobspace_token') : null;
  const res = await fetch(`${API_BASE_URL}/api/v1/resumes/current`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error('Failed to fetch active resume.');
  }

  return res.json();
}

export function getResumeDownloadUrl(resumeId: number): string {
  return `${API_BASE_URL}/api/v1/resumes/${resumeId}/download`;
}
