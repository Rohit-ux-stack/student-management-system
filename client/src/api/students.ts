import type {
  StudentListResponse,
  StudentDetailResponse,
  StudentMutationResponse,
  StudentDeleteResponse,
  StudentQueryParams,
  ApiErrorResponse,
} from '../types/student';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;
  raw?: ApiErrorResponse;

  constructor(message: string, status: number, fieldErrors?: Record<string, string>, raw?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.raw = raw;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json() : null;

  if (!res.ok) {
    const errorBody: ApiErrorResponse = data || { error: { message: res.statusText || 'Request failed' } };
    const message = errorBody.error?.message || 'An unexpected error occurred';
    
    // Extract field-level errors if present
    const fieldErrors: Record<string, string> = {
      ...(errorBody.errors || {}),
      ...(errorBody.error?.errors || {}),
    };

    // If single field conflict error (e.g. 409 email conflict)
    if (errorBody.error?.field && !fieldErrors[errorBody.error.field]) {
      fieldErrors[errorBody.error.field] = message;
    }

    throw new ApiError(message, res.status, Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined, errorBody);
  }

  return data as T;
}

/**
 * Fetch paginated, searchable, filterable list of students
 */
export async function getStudents(params: StudentQueryParams = {}): Promise<StudentListResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.page !== undefined) searchParams.append('page', String(params.page));
  if (params.limit !== undefined) searchParams.append('limit', String(params.limit));
  if (params.search && params.search.trim()) searchParams.append('search', params.search.trim());
  if (params.course && params.course.trim()) searchParams.append('course', params.course.trim());
  if (params.year !== undefined && params.year !== '') searchParams.append('year', String(params.year));

  const queryString = searchParams.toString();
  const url = `${API_BASE_URL}/api/students${queryString ? `?${queryString}` : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  return handleResponse<StudentListResponse>(res);
}

/**
 * Fetch a single student record by UUID
 */
export async function getStudentById(id: string): Promise<StudentDetailResponse> {
  const url = `${API_BASE_URL}/api/students/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  return handleResponse<StudentDetailResponse>(res);
}

/**
 * Create a new student (multipart/form-data)
 */
export async function createStudent(formData: FormData): Promise<StudentMutationResponse> {
  const url = `${API_BASE_URL}/api/students`;

  const res = await fetch(url, {
    method: 'POST',
    body: formData, // Browser automatically sets Content-Type to multipart/form-data with boundary
  });

  return handleResponse<StudentMutationResponse>(res);
}

/**
 * Update an existing student (multipart/form-data)
 */
export async function updateStudent(id: string, formData: FormData): Promise<StudentMutationResponse> {
  const url = `${API_BASE_URL}/api/students/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: 'PUT',
    body: formData,
  });

  return handleResponse<StudentMutationResponse>(res);
}

/**
 * Delete a student record by UUID
 */
export async function deleteStudent(id: string): Promise<StudentDeleteResponse> {
  const url = `${API_BASE_URL}/api/students/${encodeURIComponent(id)}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json',
    },
  });

  return handleResponse<StudentDeleteResponse>(res);
}

/**
 * Check API and database connection health
 */
export interface SystemHealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  service: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    latency_ms?: number;
    database?: string;
    version?: string;
    tables_ready?: boolean;
    error?: string;
  };
  storage: {
    status: 'configured' | 'not_configured';
    bucket?: string | null;
  };
}

export async function getSystemHealth(): Promise<SystemHealthResponse> {
  const url = `${API_BASE_URL}/api/health`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  return handleResponse<SystemHealthResponse>(res);
}

/**
 * Bulk delete multiple students by IDs
 */
export interface BulkDeleteResponse {
  message: string;
  deleted_count: number;
  data: {
    deleted_count: number;
    deleted_ids: string[];
  };
}

export async function bulkDeleteStudents(ids: string[]): Promise<BulkDeleteResponse> {
  const url = `${API_BASE_URL}/api/students/bulk-delete`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ ids }),
  });
  return handleResponse<BulkDeleteResponse>(res);
}

/**
 * Fetch student analytics data
 */
export interface AnalyticsResponse {
  success: boolean;
  total_students: number;
  totalStudents: number;
  by_course: Array<{ course: string; count: number }>;
  by_year: Array<{ year: number; count: number }>;
}

export async function getAnalytics(): Promise<AnalyticsResponse> {
  const url = `${API_BASE_URL}/api/analytics`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  return handleResponse<AnalyticsResponse>(res);
}

/**
 * Fetch recent activity logs
 */
export interface ActivityLog {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
}

export interface ActivityResponse {
  success: boolean;
  count: number;
  data: ActivityLog[];
}

export async function getActivityLogs(): Promise<ActivityResponse> {
  const url = `${API_BASE_URL}/api/activity`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  return handleResponse<ActivityResponse>(res);
}

export default {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  bulkDeleteStudents,
  getAnalytics,
  getActivityLogs,
  getSystemHealth,
};
