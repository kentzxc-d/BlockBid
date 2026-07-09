import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB", // Primary Blue
        "primary-hover": "#1D4ED8",
        secondary: "#10B981", // Success Green
        "secondary-hover": "#059669",
        warning: "#F59E0B", // Warning Amber
        danger: "#EF4444", // Danger Red
        background: "#F5F7FA", // Soft blue-gray
        surface: "#FFFFFF",
        "text-main": "#1E293B", // Dark navy text
        "text-muted": "#64748B",
        border: "#EAECF0", // Subtle border
      },
    },
  },
  plugins: [],
};
export default config;
