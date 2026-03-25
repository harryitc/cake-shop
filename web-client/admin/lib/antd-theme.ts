import type { ThemeConfig } from "antd";

export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: "#533afd",
    colorInfo: "#533afd",
    colorSuccess: "#00b261",
    colorWarning: "#ffaf2d",
    colorError: "#d8351e",
    fontFamily: "var(--font-geist-sans), sans-serif",
    borderRadius: 6,
  },
  components: {
    Button: {
      colorPrimary: "#533afd",
      algorithm: true,
    },
  },
};
