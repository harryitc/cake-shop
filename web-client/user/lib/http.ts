import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./configs";

/**
 * Custom Axios instance với các interceptors cấu hình sẵn cho User
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Tự động gắn token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động "unwrap" dữ liệu
httpClient.interceptors.response.use(
  (response) => {
    // Nếu là blob (tải file), trả về toàn bộ dữ liệu (response.data)
    if (response.config.responseType === 'blob') {
      return response.data;
    }

    // Backend trả về { data: ..., message: ... }
    if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'data')) {
      return response.data.data;
    }

    return response.data;
  },
  (error: AxiosError<{ error?: { message: string } }>) => {
    const status = error.response?.status;
    const message = error.response?.data?.error?.message || "Đã xảy ra lỗi hệ thống";

    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }

    return Promise.reject(new Error(message));
  }
);
