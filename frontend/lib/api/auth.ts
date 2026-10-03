import { apiFetch } from './client';
import { AuthTokenResponse, User } from '../types';

export async function registerUser(email: string, password: string): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginUser(email: string, password: string): Promise<AuthTokenResponse> {
  return apiFetch<AuthTokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/api/v1/users/me');
}
