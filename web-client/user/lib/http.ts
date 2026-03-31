import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { notification, message as antdMessage } from "antd";
import { API_BASE_URL } from "./configs";
import { globalNavigate } from "./navigation";

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
 * Định dạng phản hồi lỗi chuẩn từ Backend
 */
interface ApiErrorResponse {
  error?: {
    code: string;
    statuscode: number;
    timestamp: string;
    message: string;
    details?: any[];
  };
}

/**
 * Custom Axios instance cho User (Magic Unwrap .data.data)
 */
export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Tăng nhẹ timeout để khớp với ngưỡng cảnh báo
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Tự động gắn token & Theo dõi request chậm
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
          duration: 0, // Không tự động tắt
        });
      }, SLOW_REQUEST_THRESHOLD);
      
      slowRequestTimers.set(requestId, timer);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động "unwrap" dữ liệu và Xử lý lỗi thống nhất
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
    if (response.config.responseType === 'blob') {
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
    const status = error.response?.status || 0; // 0 if network error
    const messageText = errorBody?.message || error.message || "Lỗi kết nối máy chủ";

    // ISSUE C: Chống lặp thông báo (5s cooldown)
    const isGlobalError = status >= 500 || status === 403 || status === 0 || error.code === 'ECONNABORTED';
    
    if (isGlobalError && typeof window !== "undefined") {
      if (!activeErrorMessages.has(messageText)) {
        activeErrorMessages.add(messageText);
        
        notification.error({
          message: 'Lỗi Hệ Thống',
          description: messageText,
          placement: "topRight",
        });

        // Mở khóa sau 5 giây
        setTimeout(() => {
          activeErrorMessages.delete(messageText);
        }, NOTIFICATION_COOLDOWN);
      }
    }

    // 2. Lỗi Xác thực (401) -> Logout
    if (status === 401 && typeof window !== "undefined") {
      authStorage.removeToken();
      // Tránh lặp vô tận nếu đang ở trang login
      if (!window.location.pathname.includes("/login")) {
        globalNavigate("/login");
      }
    }

    // 3. Phân loại lỗi Logic (422, 400, 409) -> Promise.reject dữ liệu bóc tách
    return Promise.reject({
      ...errorBody,
      statuscode: status,
      message: messageText
    });
  }
);
