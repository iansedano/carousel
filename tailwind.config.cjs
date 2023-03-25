/** @type {import('tailwindcss').Config} */
module.exports = {
  // PostCSS doesn't accept glob ** folders
  content: [
    "./src/*.{html,mjs,js,css}",
    "./src/scroll-carousel/*.{html,mjs,js,css}",
    "./*.html",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
