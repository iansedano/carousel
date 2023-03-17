/** @type {import('tailwindcss').Config} */
module.exports = {
  // PostCSS doesn't accept glob ** folders
  content: ["./src/*.{html,mjs,js}", "./index.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};
