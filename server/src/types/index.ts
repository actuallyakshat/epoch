export interface HealthResponse {
  status: string;
  timestamp: string;
  redis: string;
}

export interface ExportRequest {
  data: Record<string, any>;
}

export interface ExportResponse {
  code: string;
  expiresAt: string;
}

export interface ImportRequest {
  code: string;
}

export interface ImportResponse {
  data: Record<string, any>;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}
