import type { ReactNode, FC } from "react"
import type {GenericNodeOptions, StackNode} from "../types/node"
import { LevelNodeBody } from "../components/nodes/level-node.tsx"

function SectionComponent({ children, ...props }: { children: ReactNode }) {
  return (
    <section className="bg-[#202020] rounded p-4" {...props}>
      {children}
    </section>
  )
}

const nodeBodyComponents: { [key: string]: FC<{ initialValue: GenericNodeOptions }> } = {
  level: LevelNodeBody as FC<{ initialValue: GenericNodeOptions }>,
}

function NodeResolver({ data }: { data: StackNode }) {
  const NodeBodyComponent = nodeBodyComponents[data.name]

  return (
    <div>
      <span>{data.name}</span>
      <div>
        <NodeBodyComponent initialValue={data.options}/>
      </div>
    </div>
  )
}

// todo: we're need global state for store nodes
const nodesData: StackNode[] = [{ name: "level", options: { low_input: 10 } }]

export default function HomePage() {
  return (
    <main className="p-5 grid grid-cols-2 gap-x-5">
      <SectionComponent>
        {nodesData.map((data, index) => (
          <NodeResolver key={`${data.name}_${index}`} data={data} />
        ))}
      </SectionComponent>
      <SectionComponent>Code</SectionComponent>
    </main>
  )
}
