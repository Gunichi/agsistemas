export interface ApiResponse<T> {
  success?: boolean
  data: T
  message?: string
  meta?: {
    timestamp: string
  }
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

