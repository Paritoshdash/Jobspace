import { apiClient } from './client';
import { CandidateProfile, CandidateSkill, Education, Experience } from '../types';

export async function getMyProfile(): Promise<CandidateProfile> {
  return apiClient.get<CandidateProfile>('/api/v1/profile/me');
}

export async function updateMyProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
  return apiClient.put<CandidateProfile>('/api/v1/profile/me', data);
}

export async function addCandidateSkill(
  name: string,
  proficiency: string = 'Intermediate',
  years_experience?: number
): Promise<CandidateSkill> {
  return apiClient.post<CandidateSkill>('/api/v1/profile/skills', {
    name,
    proficiency,
    years_experience,
  });
}

export async function deleteCandidateSkill(skillId: number): Promise<void> {
  return apiClient.delete<void>(`/api/v1/profile/skills/${skillId}`);
}

export async function addCandidateEducation(data: {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_year?: number;
  end_year?: number;
  grade?: string;
}): Promise<Education> {
  return apiClient.post<Education>('/api/v1/profile/education', data);
}

export async function deleteCandidateEducation(educationId: number): Promise<void> {
  return apiClient.delete<void>(`/api/v1/profile/education/${educationId}`);
}

export async function addCandidateExperience(data: {
  company: string;
  title: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
  description?: string;
}): Promise<Experience> {
  return apiClient.post<Experience>('/api/v1/profile/experience', data);
}

export async function deleteCandidateExperience(experienceId: number): Promise<void> {
  return apiClient.delete<void>(`/api/v1/profile/experience/${experienceId}`);
}
