import httpClient from './api/httpClient';
import type { DamageDetailResponse, DamageResolutionRequest } from '../models/DamageResolution';

// All authenticated API calls must go through httpClient so that
// JWT, refresh token logic, and global error handling are applied
// consistently across the app.

// NOTE: httpClient baseURL is API_URL (e.g. http://localhost:8080/api)
// so we only need to specify the path under `/api` here.
const DAMAGE_RESOLUTION_BASE_PATH = '/damage-resolution';

/**
 * Get full damage detail for assessment and resolution
 */
export const getDamageDetail = async (
  issueId: string,
): Promise<DamageDetailResponse> => {
  const response = await httpClient.get<DamageDetailResponse>(
    `${DAMAGE_RESOLUTION_BASE_PATH}/${issueId}/damage-detail`,
  );
  return response.data;
};

/**
 * Resolve damage issue by creating/updating assessment and optionally refund
 */
export const resolveDamage = async (
  issueId: string,
  request: DamageResolutionRequest,
): Promise<DamageDetailResponse> => {
  const response = await httpClient.post<DamageDetailResponse>(
    `${DAMAGE_RESOLUTION_BASE_PATH}/${issueId}/damage-resolution`,
    request,
  );
  return response.data;
};
