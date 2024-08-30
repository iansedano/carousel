/** @type {import('tailwindcss').Config} */
module.exports = {
  // PostCSS doesn't accept glob ** folders
  content: ["./src/**/*.{html,mjs,js,ts,css}", "./*.html", "./demos/*.html"],
  theme: {
    extend: {},
  },
  plugins: [],
};
