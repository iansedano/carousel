import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

export default {
  input: "src/index.js",
  output: {
    file: "dist/bundle.js", // Your output file (change as needed)
    format: "iife", // Change this as needed
  },
  watch: { include: ["src/*", "./tailwind.config.cjs"] },

  plugins: [resolve(), serve("."), livereload({ delay: 300 })],
};
