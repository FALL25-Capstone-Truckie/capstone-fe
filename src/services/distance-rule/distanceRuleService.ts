import httpClient from '../api/httpClient';
import type { DistanceRule } from '../../models';

interface CreateDistanceRuleRequest {
  fromKm: number;
  toKm: number;
}

interface UpdateDistanceRuleRequest {
  fromKm: number;
  toKm: number;
}

const distanceRuleService = {
  getAllDistanceRules: async (): Promise<DistanceRule[]> => {
    const response = await httpClient.get('/distance-rules');
    return response.data.data || response.data;
  },

  getDistanceRuleById: async (id: string): Promise<DistanceRule> => {
    const response = await httpClient.get(`/distance-rules/${id}`);
    return response.data.data || response.data;
  },

  createDistanceRule: async (data: CreateDistanceRuleRequest): Promise<DistanceRule> => {
    const response = await httpClient.post('/distance-rules', data);
    return response.data.data || response.data;
  },

  updateDistanceRule: async (id: string, data: UpdateDistanceRuleRequest): Promise<DistanceRule> => {
    const response = await httpClient.put(`/distance-rules/${id}`, data);
    return response.data.data || response.data;
  },

  deleteDistanceRule: async (id: string): Promise<void> => {
    await httpClient.delete(`/distance-rules/${id}`);
  }
};

export default distanceRuleService;
