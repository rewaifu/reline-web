import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"
import unfonts from "unplugin-fonts/vite"
import svgr from "vite-plugin-svgr"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    svgr(),
    unfonts({
      fontsource: {
        families: ["Geist Sans", "Geist Mono"],
      },
    }),
  ],
})
