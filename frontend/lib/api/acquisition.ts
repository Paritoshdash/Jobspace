import { apiClient } from './client';
import { AcquisitionStatus } from '../types';

export async function getAcquisitionStatus(): Promise<AcquisitionStatus> {
  return apiClient.get<AcquisitionStatus>('/api/v1/acquisition/status');
}

export async function triggerAcquisition(sourceType: string = 'all', limit?: number): Promise<any> {
  const params = new URLSearchParams({ source_type: sourceType });
  if (limit) params.set('limit_per_source', limit.toString());
  return apiClient.post<any>(`/api/v1/acquisition/trigger?${params.toString()}`);
}
