/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1', // Indigo
        secondary: '#22D3EE', // Cyan
        accent: '#F97316', // Orange
        success: '#10B981', // Emerald
        warning: '#FBBF24', // Amber
        danger: '#e74c3c', // Keep existing danger color
        dark: '#1E293B', // Slate
        light: '#F8FAFC', // Slate
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
