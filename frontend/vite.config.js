import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

new Set(["a"]).union(new Set(["b"]));

export default defineConfig({
  plugins: [react()]
});
