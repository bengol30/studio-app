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
        // Use as: bg-primary, text-primary, border-primary
        primary: "#0F0F1A",
        card: "#1A1A2E",
        elevated: "#252540",
        accent: "#E94560",
        "accent-2": "#0F3460",
        "border-c": "#2A2A3E",
        // Text colors: text-primary-text, text-muted, text-secondary
        "primary-text": "#EAEAEA",
        "secondary-text": "#888899",
        muted: "#555566",
        success: "#27AE60",
        error: "#E74C3C",
      },
      fontFamily: {
        heebo: ["Heebo", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
