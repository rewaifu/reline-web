import type { GenericNodeOptions, StackNode } from "~/types/node"
import { Card, CardHeader, CardContent } from "./shared/card"
import { type FC, useContext } from "react"
import { NodesContext } from "~/context/contexts"
import { LevelNodeBody } from "./nodes/level-node"

const nodeBodyComponents: { [key: string]: FC<{ options: GenericNodeOptions; id: number; name: string }> } = {
  level: LevelNodeBody as FC<{ options: GenericNodeOptions; id: number; name: string }>,
}

function NodeResolver({ data }: { data: StackNode }) {
  const NodeBodyComponent = nodeBodyComponents[data.name]

  return (
    <Card>
      <CardHeader>{data.name}</CardHeader>
      <CardContent>
        <NodeBodyComponent options={data.options} id={data.id} name={data.name} />
      </CardContent>
    </Card>
  )
}

export function NodesSection() {
  const nodes = useContext(NodesContext)
  return (
    <Card>
      <CardHeader>Nodes</CardHeader>
      <CardContent>
        {nodes.map((data, index) => (
          <NodeResolver key={`${data.name}_${index}`} data={data} />
        ))}
      </CardContent>
    </Card>
  )
}
