export interface Student {
  id: string;
  admission_number: string;
  name: string;
  course: string;
  year: number;
  date_of_birth: string;
  email: string;
  mobile_number: string;
  gender: 'Male' | 'Female' | 'Non-Binary' | 'Other' | 'Prefer Not to Say' | string;
  address: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentListResponse {
  data: Student[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StudentDetailResponse {
  data: Student;
}

export interface StudentMutationResponse {
  message: string;
  data: Student;
}

export interface StudentDeleteResponse {
  message: string;
  data: {
    id: string;
    admission_number?: string;
  };
}

export interface ApiErrorResponse {
  error: {
    message: string;
    errors?: Record<string, string>;
    field?: string;
    code?: string;
  };
  errors?: Record<string, string>;
}

export interface StudentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  course?: string;
  year?: number | string;
}
