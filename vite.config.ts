import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function getGitHubPagesBase(mode: string) {
  // In development we always want root paths.
  if (mode !== "production") return "/";

  // Use relative asset paths for maximum compatibility with GitHub Pages
  // (works both on / and on /<repo>/ without hardcoding).
  return "./";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: getGitHubPagesBase(mode),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
