import { Card, CardHeader, CardContent } from "./ui/card"
import { useContext } from "react"
import { NodesContext } from "~/context/contexts"
import { NodeResolver } from "./node-resolver"
import { AddNodeButton } from "./add-node-button"

export function NodesSection() {
  const nodes = useContext(NodesContext)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div>Nodes</div>
        <AddNodeButton />
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {nodes.map((data, index) => (
          <NodeResolver key={`${data.name}_${index}`} id={data.id} />
        ))}
      </CardContent>
    </Card>
  )
}
