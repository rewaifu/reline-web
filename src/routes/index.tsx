import { useReducer } from "react"
import { NodesContext, NodesDispatchContext } from "../context/contexts.ts"
import { CodeSection } from "~/components/code-section.tsx"
import { NodesSection } from "~/components/nodes-section.tsx"
import { nodesReducer } from "~/context/reducer.ts"
import { DEFAULT_NODES, STORAGE_KEY } from "~/constants.ts"

const getInitialData = () => {
  const data = localStorage.getItem(STORAGE_KEY)
  if (data) {
    return JSON.parse(data)
  }
  return DEFAULT_NODES
}

export default function HomePage() {
  const [nodes, dispatch] = useReducer(nodesReducer, getInitialData())

  return (
    <main className="p-5 grid grid-cols-2 gap-x-5">
      <NodesContext.Provider value={nodes}>
        <NodesDispatchContext.Provider value={dispatch}>
          <NodesSection />
          <CodeSection />
        </NodesDispatchContext.Provider>
      </NodesContext.Provider>
    </main>
  )
}
