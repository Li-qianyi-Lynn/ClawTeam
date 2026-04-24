import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: __dirname,
  base: "./",
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, "../docs"),
    emptyOutDir: false,
    assetsDir: "site-assets",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        "team-intro": resolve(__dirname, "team-intro.html"),
      },
    },
  },
});
