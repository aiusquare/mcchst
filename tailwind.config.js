/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f7f4",
          100: "#dbeee5",
          200: "#b7ddcc",
          300: "#8cc6ad",
          400: "#5fae8d",
          500: "#2f916c",
          600: "#1f7457",
          700: "#165a44",
          800: "#0f4635",
          900: "#0a3326",
        },
        gold: {
          50: "#fff9e6",
          100: "#ffefbf",
          200: "#ffe28c",
          300: "#ffd65a",
          400: "#ffca2c",
          500: "#f2b400",
          600: "#cc9600",
          700: "#a37600",
          800: "#7a5700",
          900: "#563c00",
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.12)",
      },
    },
  },
  plugins: [],
};
