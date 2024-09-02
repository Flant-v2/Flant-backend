import { ApiResponse } from './api-response.interface';

export const createResponse = <T>(
  statusCode: number,
  message: string,
  data?: T,
): ApiResponse<T> => {
  const response: any = {
    statusCode,
    message,
  };
  if (data) response.data = data;

  return response;
};
