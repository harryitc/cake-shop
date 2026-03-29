import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { notification } from "antd";
import { API_BASE_URL } from "./configs";

/**
 * Token Management: Centralized Access
 */
export const authStorage = {
  getToken: () => typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  setToken: (token: string) => localStorage.setItem("access_token", token),
  removeToken: () => localStorage.removeItem("access_token"),
};

/**
 * Custom Axios instance cho User (Magic Unwrap .data.data)
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
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động "unwrap" dữ liệu và Xử lý lỗi thống nhất
httpClient.interceptors.response.use(
  (response) => {
    // Nếu là blob (tải file), trả về toàn bộ dữ liệu (response.data)
    if (response.config.responseType === 'blob') {
      return response.data;
    }
    // Trả về dữ liệu thực tế từ backend (unwrap .data.data)
    return response.data?.data;
  },
  (error: AxiosError<any>) => {
    const errorBody = error.response?.data?.error;
    const status = error.response?.status || 0; // 0 if network error
    const message = errorBody?.message || error.message || "Lỗi kết nối máy chủ";

    // 1. Phân loại lỗi Hệ thống (>= 500, 403, Network) -> notification.error
    if (status >= 500 || status === 403 || status === 0 || error.code === 'ECONNABORTED') {
      if (typeof window !== "undefined") {
        notification.error({
          message: 'Lỗi Hệ Thống',
          description: message,
        });
      }
    }

    // 2. Lỗi Xác thực (401) -> Logout
    if (status === 401 && typeof window !== "undefined") {
      authStorage.removeToken();
      // Tránh lặp vô tận nếu đang ở trang login
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // 3. Phân loại lỗi Logic (422, 400, 409) -> Promise.reject dữ liệu bóc tách
    // Trả về object chứa đầy đủ thông tin lỗi để Component xử lý
    return Promise.reject({
      ...errorBody,
      statuscode: status,
      message: message
    });
  }
);
