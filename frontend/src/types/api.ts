export interface ApiResponse<T = any> {
  status_code: number;
  message: string;
  data?: T;
}

export interface ApiErrorResponse {
  status_code: number;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}