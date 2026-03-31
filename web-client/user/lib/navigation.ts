import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

let router: AppRouterInstance | null = null;

/**
 * Gắn router instance vào biến toàn cục.
 * Được gọi từ NavigationObserver component.
 */
export const setGlobalRouter = (instance: AppRouterInstance) => {
  router = instance;
};

/**
 * Thực hiện điều hướng mà không cần reload trang (SPA navigation).
 * Nếu router chưa được khởi tạo, sẽ fallback về window.location.href.
 * 
 * @param path Đường dẫn cần điều hướng tới
 */
export const globalNavigate = (path: string) => {
  if (router) {
    router.push(path);
  } else {
    // Fallback if router is not initialized yet (avoid breaking logic)
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  }
};
