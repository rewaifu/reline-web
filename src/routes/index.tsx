import { useReducer } from "react"
import { NodesContext, NodesDispatchContext } from "../context/contexts.ts"
import type { StackNode } from "../types/node"
import { CodeSection } from "~/components/code-section.tsx"
import { NodesSection } from "~/components/nodes-section.tsx"
import { nodesReducer } from "~/context/reducer.ts"
import { DEFAULT_NODE_OPTIONS } from "~/constants.ts"
import { NodeType } from "~/types/enums.ts"

const testData: StackNode[] = [{ id: 0, name: NodeType.LEVEL, options: DEFAULT_NODE_OPTIONS.level }, { id: 1, name: NodeType.FOLDER_READER, options: DEFAULT_NODE_OPTIONS.folder_reader }]

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
