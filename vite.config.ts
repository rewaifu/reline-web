import { defineConfig } from "vite"
import { vitePlugin as remix } from "@remix-run/dev"
import tsconfigPaths from "vite-tsconfig-paths"
import unfonts from "unplugin-fonts/vite"

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    unfonts({
      fontsource: {
        families: ["Geist Sans", "Geist Mono"],
      },
    }),
  ],
})