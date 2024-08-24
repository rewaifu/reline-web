import type { StackNode } from "~/types/node"
import { Card, CardHeader, CardContent } from "./shared/card"
import { useContext } from "react"
import { NodesContext } from "~/context/contexts"

function nodesToString(nodes: StackNode[]): string {
  //const nodesWithoutId = nodes.map(({ id, ...keepAttrs }) => keepAttrs)
  return JSON.stringify(nodes)
}

export function CodeSection() {
  const nodes = useContext(NodesContext)
  return (
    <Card>
      <CardHeader>Code</CardHeader>
      <CardContent>
        <p className="w-full"> {nodesToString(nodes)} </p>
      </CardContent>
    </Card>
  )
}
