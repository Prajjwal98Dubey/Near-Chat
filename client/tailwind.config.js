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
    },
  },
  plugins: [],
};
