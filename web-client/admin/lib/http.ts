import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./configs";
import { notification, message as antdMessage } from "antd";

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
 * Performance & Notification Management
 */
const SLOW_REQUEST_THRESHOLD = 4000; // 4s
const NOTIFICATION_COOLDOWN = 5000; // 5s
const activeErrorMessages = new Set<string>();
const slowRequestTimers = new Map<string, any>();

/**
 * Custom Axios instance cho Admin (Magic Unwrap .data.data)
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Gắn token & Theo dõi request chậm
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = authStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ISSUE B: Theo dõi request chậm (> 4s)
    if (typeof window !== "undefined") {
      const requestId = `${config.method}:${config.url}:${Date.now()}`;
      (config as any).metadata = { requestId };
      
      const timer = setTimeout(() => {
        antdMessage.loading({
          content: "Hệ thống đang xử lý, vui lòng đợi...",
          key: "slow-request-warning",
          duration: 0,
        });
      }, SLOW_REQUEST_THRESHOLD);
      
      slowRequestTimers.set(requestId, timer);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động bóc tách dữ liệu & Xử lý lỗi tập trung
httpClient.interceptors.response.use(
  (response) => {
    // ISSUE B: Xóa timer và đóng message khi hoàn thành
    const requestId = (response.config as any).metadata?.requestId;
    if (requestId) {
      clearTimeout(slowRequestTimers.get(requestId));
      slowRequestTimers.delete(requestId);
      if (slowRequestTimers.size === 0) {
        antdMessage.destroy("slow-request-warning");
      }
    }

    // Nếu là blob (tải file), trả về toàn bộ dữ liệu (response.data)
    if (response.config.responseType === "blob") {
      return response.data;
    }
    // Trả về dữ liệu thực tế từ backend (unwrap .data.data)
    return response.data?.data;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    // ISSUE B: Xóa timer và đóng message khi lỗi
    const requestId = (error.config as any)?.metadata?.requestId;
    if (requestId) {
      clearTimeout(slowRequestTimers.get(requestId));
      slowRequestTimers.delete(requestId);
      if (slowRequestTimers.size === 0) {
        antdMessage.destroy("slow-request-warning");
      }
    }

    const errorBody = error.response?.data?.error;
    const status = error.response?.status || 500;
    const messageText = errorBody?.message || "Lỗi kết nối máy chủ";

    // ISSUE C: Chống lặp thông báo (5s cooldown)
    const isGlobalError = status >= 500 || status === 403 || error.code === "ECONNABORTED" || !error.response;
    
    if (isGlobalError && typeof window !== "undefined") {
      if (!activeErrorMessages.has(messageText)) {
        activeErrorMessages.add(messageText);
        
        notification.error({
          message: "Lỗi Hệ Thống",
          description: messageText,
          placement: "topRight",
        });

        // Mở khóa sau 5 giây
        setTimeout(() => {
          activeErrorMessages.delete(messageText);
        }, NOTIFICATION_COOLDOWN);
      }
    }

    // 2. Lỗi Xác thực (401): Logout & Redirect
    if (status === 401 && typeof window !== "undefined") {
      authStorage.removeToken();
      if (!window.location.pathname.includes("/admin/login")) {
        window.location.href = "/admin/login";
      }
    }

    // 3. Lỗi Logic (422, 400, 409): Ném lỗi về cho Component xử lý
    return Promise.reject({
      ...errorBody,
      statuscode: status,
      message: messageText,
    });
  }
);
