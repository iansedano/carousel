import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { babel } from "@rollup/plugin-babel";

const extensions = [".js", ".ts"];

export default {
  input: "src/index.js",
  output: {
    file: "dist/bundle.js", // Your output file (change as needed)
    format: "iife", // Change this as needed
  },
  watch: {
    include: [
      "src/*",
      "src/scroll-carousel/*",
      "src/transition-carousel/*",
      "./tailwind.config.cjs",
    ],
  },
  plugins: [
    resolve({ extensions }),
    babel({ extensions, babelHelpers: "bundled" }),
    serve("."),
    livereload({ delay: 300 }),
  ],
};
