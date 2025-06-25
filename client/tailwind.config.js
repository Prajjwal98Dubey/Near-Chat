/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        ubuntu: ["Ubuntu", "sans-serif"],
        inter: ["Inter", "ui-sans-serif", "system-ui"],
      },
      fontWeight: {
        dark: "500",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        slideUp: "slideUp 0.25s ease-out forwards",
      },
    },
  },
  plugins: [],
};
