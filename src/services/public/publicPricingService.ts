import axios from 'axios';
import { API_BASE_URL } from '../../config';
import type { SizeRule, SizeRuleCategory, SizeRuleType } from '../../models';

// Create axios instance for public endpoints (no auth required)
const publicHttpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface InsuranceInfo {
  maxCoverage: number;
  insuranceRate: number;
  processingTime: string;
  coveredCases: string[];
  excludedCases: string[];
}

export interface PolicyItem {
  title: string;
  description: string;
  type: string;
}

export interface TransportationPolicies {
  cancellationPolicies: PolicyItem[];
  refundPolicies: PolicyItem[];
  categoryPolicies: PolicyItem[];
}

// Get public size rules (no auth required)
const getPublicSizeRules = async (): Promise<SizeRule[]> => {
  const response = await publicHttpClient.get('/api/v1/public/pricing/size-rules');
  return response.data.data;
};

// Get public categories (no auth required)
const getPublicCategories = async (): Promise<SizeRuleCategory[]> => {
  const response = await publicHttpClient.get('/api/v1/public/pricing/categories');
  return response.data.data;
};

// Get public vehicle types (no auth required)
const getPublicVehicleTypes = async (): Promise<SizeRuleType[]> => {
  const response = await publicHttpClient.get('/api/v1/public/pricing/vehicle-types');
  return response.data.data;
};

// Get insurance info (no auth required)
const getInsuranceInfo = async (): Promise<InsuranceInfo> => {
  const response = await publicHttpClient.get('/api/v1/public/pricing/insurance-info');
  return response.data.data;
};

// Get transportation policies (no auth required)
const getTransportationPolicies = async (): Promise<TransportationPolicies> => {
  const response = await publicHttpClient.get('/api/v1/public/pricing/policies');
  return response.data.data;
};

const publicPricingService = {
  getPublicSizeRules,
  getPublicCategories,
  getPublicVehicleTypes,
  getInsuranceInfo,
  getTransportationPolicies,
};

export default publicPricingService;
