import React, { useReducer } from "react"
import { ThemeProvider } from "next-themes"
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { Toaster } from "~/components/ui/toaster"
import { NodesContext, NodesDispatchContext, ModelsContext } from "~/context/contexts"
import { nodesReducer } from "~/context/reducer"
import { DEFAULT_NODES, MODELS, STORAGE_KEY } from "~/constants"
import { modelsQueryOptions } from "~/lib/queries"
import { ModeToggle } from "~/components/mode-toggle"
import { CodeSection } from "~/components/code-section"
import { NodesSection } from "~/components/nodes-section"
import { migrateNodes } from "~/lib/config-migration"

const queryClient = new QueryClient()

function HomePage() {
  const { data: models = MODELS } = useQuery(modelsQueryOptions)

  const getInitialData = () => {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      try {
        const parsedNodes = JSON.parse(data)
        return migrateNodes(parsedNodes)
      } catch (error) {
        console.error("Err parsing from storage:", error)
        return DEFAULT_NODES
      }
    }
    return DEFAULT_NODES
  }

  const [nodes, dispatch] = useReducer(nodesReducer, undefined, getInitialData)

  return (
    <main className="p-5">
      <div className="flex justify-between">
        <h1 className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4">Reline Configurator</h1>
        <ModeToggle />
      </div>
      <div className="grid grid-cols-2 gap-x-5">
        <NodesContext.Provider value={nodes}>
          <NodesDispatchContext.Provider value={dispatch}>
            <ModelsContext.Provider value={models}>
              <NodesSection />
              <CodeSection />
            </ModelsContext.Provider>
          </NodesDispatchContext.Provider>
        </NodesContext.Provider>
      </div>
    </main>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <HomePage />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  )
}
