/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff8f1',
          100: '#feeedb',
          200: '#fcd9b4',
          300: '#fabb82',
          400: '#f7944d',
          500: '#f37526',
          600: '#e45719',
          700: '#bd4016',
          800: '#96341a',
          900: '#792d18',
          950: '#41140a',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0B',
          600: '#d97706',
        },
        dark: {
          base: '#0f172a',
          surface: '#1e293b',
          card: '#1e293b',
          border: '#334155',
          hover: '#334155',
        }
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
