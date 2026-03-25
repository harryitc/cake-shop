import type { ThemeConfig } from "antd";

// Cấu hình Ant Design Theme dựa trên website-design-system-token.json
// Tham khảo hex color chủ đạo của Token
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#533afd", // Từ semantic.primary
    colorInfo: "#533afd",
    colorSuccess: "#00b261", // Từ hds-color-icon-success
    colorWarning: "#ffaf2d",
    colorError: "#d8351e",
    fontFamily: "var(--font-geist-sans), sans-serif",
    borderRadius: 6,
  },
  components: {
    Button: {
      colorPrimary: "#533afd",
      algorithm: true, // Cho phép antd tự sinh hiệu ứng hover từ primary
    },
  },
};
