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
        primary: "#0052CC",
        "primary-hover": "#0043A6",
        secondary: "#00875A",
        "secondary-hover": "#006B47",
        background: "#F4F5F7",
        surface: "#FFFFFF",
        "text-main": "#172B4D",
        "text-muted": "#6B778C",
        border: "#DFE1E6",
      },
    },
  },
  plugins: [],
};
export default config;
