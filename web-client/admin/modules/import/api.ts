import { httpClient } from "@/lib/http";

export const importApi = {
  getHistory: (page: number = 1, limit: number = 10, entityType?: string) => {
    return httpClient.get<{ items: any[]; total: number; totalPages: number }>("/import/history", {
      params: { page, limit, entityType }
    });
  },

  downloadErrorReport: async (historyId: string) => {
    // Với file download, chúng ta dùng axios instance nhưng cấu hình responseType là blob
    const response = await httpClient.get(`/import/errors/${historyId}`, {
      responseType: 'blob'
    });
    
    // Lưu ý: httpClient của chúng ta đang return response.data.data trong interceptor. 
    // Nếu responseType là blob, Axios sẽ để file ở response.data.
    // Chúng ta cần kiểm tra lại Interceptor xem nó có làm hỏng Blob không.
    return response;
  }
};
