import { useReducer } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { CodeSection } from "~/components/code-section"
import { NodesSection } from "~/components/nodes-section"
import { nodesReducer } from "~/context/reducer"
import { DEFAULT_NODES, STORAGE_KEY } from "~/constants"

export default function HomePage() {
  const getInitialData = () => {
    if (typeof window === "undefined") {
      return DEFAULT_NODES
    }

    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
    return DEFAULT_NODES
  }

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
