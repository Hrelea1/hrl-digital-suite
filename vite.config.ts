import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

function getGitHubPagesBase(mode: string) {
  // In development we always want root paths.
  if (mode !== "production") return "/";

  // GitHub Actions provides GITHUB_REPOSITORY="owner/repo".
  // For project pages, the base must be "/repo/".
  const repo = process.env.GITHUB_REPOSITORY?.split("/")?.[1];
  return repo ? `/${repo}/` : "/";
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
