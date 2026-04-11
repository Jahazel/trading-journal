export type ErrorResponse = { message: string };

export type ApiResponse<T> = T | ErrorResponse;
