import { apiClient } from './client';
import { CandidateRecommendationsResponse } from '../types';

export async function getPersonalizedRecommendations(limit: number = 20): Promise<CandidateRecommendationsResponse> {
  return apiClient.get<CandidateRecommendationsResponse>(`/api/v1/recommendations?limit=${limit}`);
}
