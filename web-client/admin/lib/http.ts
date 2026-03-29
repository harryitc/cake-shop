import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./configs";
import { notification } from "antd";

/**
 * Định dạng phản hồi lỗi chuẩn từ Backend
 */
interface ApiErrorResponse {
  error?: {
    code: string;
    statuscode: number;
    timestamp: string;
    message: string;
    details?: unknown;
  };
}

/**
 * Token Management: Centralized Access
 */
export const authStorage = {
  getToken: () => typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  setToken: (token: string) => localStorage.setItem("access_token", token),
  removeToken: () => localStorage.removeItem("access_token"),
};

/**
 * Custom Axios instance cho Admin (Magic Unwrap .data.data)
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Gắn token
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động bóc tách dữ liệu & Xử lý lỗi tập trung
httpClient.interceptors.response.use(
  (response) => {
    // Nếu là blob (tải file), trả về toàn bộ dữ liệu (response.data)
    if (response.config.responseType === "blob") {
      return response.data;
    }
    // Trả về dữ liệu thực tế từ backend (unwrap .data.data)
    return response.data?.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    const errorBody = error.response?.data?.error;
    const status = error.response?.status || 500;
    const message = errorBody?.message || "Lỗi kết nối máy chủ";

    // 1. Lỗi Hệ Thống (Global Errors): >= 500, 403, Network Error
    if (status >= 500 || status === 403 || error.code === "ECONNABORTED" || !error.response) {
      notification.error({
        message: "Lỗi Hệ Thống",
        description: message,
        placement: "topRight",
      });
    }

    // 2. Lỗi Xác thực (401): Logout & Redirect
    if (status === 401 && typeof window !== "undefined") {
      authStorage.removeToken();
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    // 3. Lỗi Logic (422, 400, 409): Ném lỗi về cho Component xử lý
    // Trả về object lỗi đã được bóc tách kèm status code
    return Promise.reject({
      ...errorBody,
      statuscode: status,
      message: message, // Đảm bảo luôn có message
    });
  }
);
