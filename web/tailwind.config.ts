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
        // Landing Page Specific Colors
        'bb-dark': '#0f172a',
        'bb-darker': '#020617',
        'bb-gold-light': '#fef08a',
        'bb-gold': '#facc15',
        'bb-gold-dark': '#eab308',
        'bb-card-bg': 'rgba(15, 23, 42, 0.6)',
        'bb-card-inner': 'rgba(30, 41, 59, 0.8)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #fde047, #d97706)',
        'btn-gradient': 'linear-gradient(90deg, #fce7f3 0%, #fef3c7 50%, #fde047 100%)',
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
