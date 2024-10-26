/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'jet': '#2a2b2a',
        'floral': '#fff8f0',
        'maya': '#55c1ff',
        'pink': '#f45b69',
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #55c1ff10 0%, #f45b6910 50%, #55c1ff10 100%)',
      },
      fontFamily: {
        'sans': ['Inter Var', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}