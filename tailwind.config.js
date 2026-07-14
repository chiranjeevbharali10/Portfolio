/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        podium: ['"FSP DEMO - PODIUM Sharp 4.11"', "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        background: "#080808",
        primary: "#F5F3E8",
        lime: "#DFFF00",
        purple: "#8B35FF",
        pink: "#FF2D9A",
        orange: "#FF6B1A",
        blue: "#2563FF",
        cyan: "#00E5FF",
      },
    },
  },
  plugins: [],
}
