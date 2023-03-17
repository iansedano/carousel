import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import postCssImport from "postcss-import";

export default {
  input: "script.js",
  output: {
    file: "bundle.js", // Your output file (change as needed)
    format: "iife", // Change this as needed
  },
  plugins: [
    postcss({
      plugins: [postCssImport(), tailwindcss(), autoprefixer()],
      inject: false,
      extract: true,
      extensions: [".css"],
    }),
  ],
};
