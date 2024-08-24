import { type ReactNode, type FC, useReducer } from "react"
import { LevelNodeBody } from "../components/nodes/level-node.tsx"
import { NodesContext, NodesDispatchContext } from "../contexts.ts"
import type { GenericNodeOptions, StackNode } from "../types/node"
import { type NodesAction, NodesActionType } from "../types/actions"

function SectionComponent({ children, ...props }: { children: ReactNode }) {
  return (
    <section className="bg-[#202020] rounded p-4" {...props}>
      {children}
    </section>
  )
}

const nodeBodyComponents: { [key: string]: FC<{ options: GenericNodeOptions; id: number; name: string }> } = {
  level: LevelNodeBody as FC<{ options: GenericNodeOptions; id: number; name: string }>,
}

function NodeResolver({ data }: { data: StackNode }) {
  const NodeBodyComponent = nodeBodyComponents[data.name]

  return (
    <div>
      <span>{data.name}</span>
      <div>
        <NodeBodyComponent options={data.options} id={data.id} name={data.name} />
      </div>
    </div>
  )
}

// todo: we're need global state for store nodes
const nodesData: StackNode[] = [{ id: 0, name: "level", options: { low_input: 10 } }]

const nodesReducer = (state: StackNode[], action: NodesAction) => {
  const { type, payload } = action
  switch (type) {
    case NodesActionType.CHANGE:
      return state.map((node) => (node.id === payload.id ? payload : node))
    default:
      return state
  }
}

export default function HomePage() {
  const [nodes, dispatch] = useReducer(nodesReducer, nodesData)

  return (
    <main className="p-5 grid grid-cols-2 gap-x-5">
      <NodesContext.Provider value={nodes}>
        <NodesDispatchContext.Provider value={dispatch}>
          <SectionComponent>
            {nodes.map((data, index) => (
              <NodeResolver key={`${data.name}_${index}`} data={data} />
            ))}
          </SectionComponent>
          <SectionComponent>
            <p>Code</p>
            <textarea className="w-full" value={JSON.stringify(nodes)} />
          </SectionComponent>
        </NodesDispatchContext.Provider>
      </NodesContext.Provider>
    </main>
  )
}
