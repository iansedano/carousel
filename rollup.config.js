import postcss from "rollup-plugin-postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import postCssImport from "postcss-import";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";

export default {
  input: "src/index.js",
  external: ["lodashEs"],
  output: {
    file: "dist/bundle.js", // Your output file (change as needed)
    format: "iife", // Change this as needed
    globals: {
      lodashEs: "_",
    },
  },
  watch: { include: "src/**" },

  plugins: [
    resolve(),
    postcss({
      plugins: [postCssImport(), tailwindcss(), autoprefixer()],
      inject: false,
      extract: true,
      extensions: [".css"],
    }),
    serve("."),
  ],
};
