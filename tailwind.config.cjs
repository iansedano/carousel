/** @type {import('tailwindcss').Config} */
module.exports = {
  // PostCSS doesn't accept glob ** folders
  content: ["./src/*.{html,mjs,js,css}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};
