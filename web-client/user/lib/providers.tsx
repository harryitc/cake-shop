"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { useState } from "react";
// Đăng ký theme antd ở đây để đồng bộ với website-design-system-token
import { antdTheme } from "./antd-theme";

export function Providers({ children }: { children: React.ReactNode }) {
  // Đảm bảo chỉ khởi tạo QueryClient 1 lần mỗi session ở client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 phút
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AntdRegistry>
        <ConfigProvider theme={antdTheme}>
          {children}
        </ConfigProvider>
      </AntdRegistry>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
