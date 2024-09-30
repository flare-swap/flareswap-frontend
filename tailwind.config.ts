import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-poppins)", "sans-serif"],
      },
      colors: {
        "grey-300": "#7F7F7F",
        "secondary-bg": "#0E090F",
        "black-100": "#111111",
        "black-200": "#0d0d0d",
        transparent: "rgba(0,0,0,0)",
      },
      backgroundImage: {
        "gradient-btn": "linear-gradient(90deg, #D259FF 0%, #6535FF 100%)",
        "gradient-line": "linear-gradient(90deg, rgba(70, 70, 70, 0) 0%, rgba(70, 70, 70, 0.997525) 50.5%, rgba(70, 70, 70, 0) 100%)",
        "gradient-line-vertical": "linear-gradient(0deg, rgba(70, 70, 70, 0) 0%, rgba(70, 70, 70, 0.997525) 50.5%, rgba(70, 70, 70, 0) 100%)",
        "gradient-blur-left": "linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);",
        "gradient-blur-right": "linear-gradient(-90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%);",
      },
      backdropBlur: {
        none: "none",
        blur: "blur(20px)",
      },
    },
  },
  plugins: [],
};
export default config;
