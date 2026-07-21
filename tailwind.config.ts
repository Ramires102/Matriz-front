import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.35), 0 0 24px rgba(139,92,246,0.22)",
        soft: "0 10px 30px rgba(0,0,0,0.35)",
      },
      colors: {
        brand: {
          violet: "#8B5CF6",
          fuchsia: "#D946EF",
        },
      },
    },
  },
  plugins: [],
};

export default config;
