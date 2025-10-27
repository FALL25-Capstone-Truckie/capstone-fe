import type { Issue, IssueApiResponse, IssueCreateDto, IssueUpdateDto } from '@/models/Issue';
import type { ApiResponse, PaginatedResponse } from '../api/types';

export type { IssueApiResponse, IssueCreateDto, IssueUpdateDto };

export type IssueResponse = ApiResponse<IssueApiResponse>;
export type IssuesResponse = ApiResponse<Issue[]>;
export type PaginatedIssuesResponse = ApiResponse<PaginatedResponse<Issue>>;