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
        primary: "#C5A059", /* Seal Gold */
        "primary-hover": "#D4AF68",
        secondary: "#0B132B", /* Midnight Navy */
        "secondary-hover": "#16264A",
        background: "#F9F9F6", /* Parchment White */
        surface: "#FFFFFF",
        "text-main": "#0B132B",
        "text-muted": "#4A5568",
        "text-inverse": "#F9F9F6",
        "text-inverse-muted": "#A0AEC0",
        border: "#CBD5E1",
        "border-inverse": "#1E293B",
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      }
    },
  },
  plugins: [],
};
export default config;
