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
        bg: "#F7F8FA",
        fg: "#1D1D1F",
        fg2: "#86868B",
        card: "#FFFFFF",
        pressed: "#E4E5E9",
        sep: "#E8E8ED",
        blue: "#007AFF",
        green: "#34C759",
        red: "#FF3B30",
        orange: "#FF9500",
      },
      fontFamily: {
        sans: ["-apple-system","BlinkMacSystemFont","Segoe UI","Roboto","Helvetica","Arial","sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
