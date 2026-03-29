import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./configs";

/**
 * Custom Axios instance với các interceptors cấu hình sẵn cho Admin
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Gắn token và quản lý auth
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

// Response Interceptor: Thông minh hơn trong việc unwrap dữ liệu
httpClient.interceptors.response.use(
  (response) => {
    // Nếu là blob (tải file), trả về toàn bộ dữ liệu (response.data)
    if (response.config.responseType === 'blob') {
      return response.data;
    }

    // Backend trả về { data: ..., message: ... }
    // Chỉ unwrap nếu có thuộc tính data trong response body
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
      
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    return Promise.reject(new Error(message));
  }
);
