import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Phaser is a single large dependency; a 1.5MB vendor bundle is expected
    // for a self-contained game build, so quiet the generic size warning.
    chunkSizeWarningLimit: 1600,
  },
});
