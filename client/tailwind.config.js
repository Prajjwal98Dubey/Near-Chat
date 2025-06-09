/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        savate: ["Savate", "sans-serif"],
        jose: ["Josefin Sans", "sans-serif"],
        aladin: ["aladin", "sans-serif"],
      },
    },
  },
  plugins: [],
};
