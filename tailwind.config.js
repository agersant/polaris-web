/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['InterVariable', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        "accent": { // TODO theming (current: ramp generated from polaris brand blue)
          50: "#f6f9fe",
          100: "#ecf5fe",
          200: "#d4ebfc",
          300: "#b3e0f9",
          400: "#88d5f6",
          500: "#46c8f1",
          600: "#25b2ee",
          700: "#1196e4",
          800: "#0f75c2",
          900: "#0a4a89",
          950: "#041934"
        },
        "ls": { // light-mode surface (TODO: point at CSS variables for theming. Currently tailwind gray ramp with 0 added)
          0: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712',
        },
        "ds": { // dark-mode surface (TODO: point at CSS variables for theming. Currently tailwind slate ramp with 0 added)
          0: '#ffffff',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

