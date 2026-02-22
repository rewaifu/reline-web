import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import unfonts from "unplugin-fonts/vite"

export default defineConfig({
  base: process.env.GITHUB_PAGES ? "/reline-web/" : "/",
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    unfonts({
      fontsource: {
        families: ["Geist Sans", "Geist Mono"],
      },
    }),
  ],
})
