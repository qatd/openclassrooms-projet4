import axios from 'axios';
import { ApiError } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

// Returns the backend error message if there is one, otherwise the fallback
export const getApiErrorMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
    return err.response.data.message;
  }
  return fallback;
};
