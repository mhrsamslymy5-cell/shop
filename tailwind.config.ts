import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          400: "#7aa2ff",
          500: "#4f7dff",
          600: "#3a5fe0",
          900: "#0b0f2a",
        },
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #0b0f2a 0%, #191d4a 45%, #2b1e5c 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
