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
        "accent": {
          50: "#F6F9FE",
          100: "#ECF5FE",
          200: "#D4EBFC",
          300: "#B3E0F9",
          400: "#88D5F6",
          500: "#46C8F1",
          600: "#25B2EE",
          700: "#1196E4",
          800: "#0F75C2",
          900: "#0A4A89",
          950: "#041934"
        }
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

