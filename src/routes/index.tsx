import { useReducer } from "react"
import { NodesContext, NodesDispatchContext } from "../context/contexts.ts"
import type { StackNode } from "../types/node"
import { CodeSection } from "~/components/code-section.tsx"
import { NodesSection } from "~/components/nodes-section.tsx"
import { nodesReducer } from "~/context/reducer.ts"

const testData: StackNode[] = [{ id: 0, name: "level", options: { low_input: 10 } }]

export default function HomePage() {
  const [nodes, dispatch] = useReducer(nodesReducer, testData)

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
