/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,'./src/components/markdown-styles.css'}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        jet: "#2a2b2a",
        floral: "#fff8f0",
        maya: "#55c1ff",
        pink: "#f45b69",
        dark: {
          bg: "#1a1a1a",
          surface: "#2a2a2a",
          text: "#e0e0e0",
        },
      },
      backgroundImage: {
        "gradient-main":
          "linear-gradient(135deg, #55c1ff15 0%, #f45b6905 50%, #55c1ff15 100%)",
        "gradient-main-dark":
          "linear-gradient(135deg, #55c1ff20 0%, #f45b6910 50%, #55c1ff20 100%)",
      },
      fontFamily: {
        sans: ["Inter Var", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
