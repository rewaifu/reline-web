import type { StackNode } from "~/types/node"
import { Card, CardHeader, CardContent } from "./shared/card"
import { useContext } from "react"
import { NodesContext } from "~/context/contexts"
import { NodeType } from "~/types/enums"
import { MODEL_POSTFIX, MODEL_PREFIX } from "~/constants"

function nodesToString(nodes: StackNode[]): string {
  const pureNodes = nodes.map(({ id, collapsed, ...keepAttrs }) => keepAttrs)
  const result = []
  for (let i = 0; i < pureNodes.length; i += 1) {
    const pureNode = pureNodes[i]
    if (pureNode.name === NodeType.UPSCALE) {
      const { is_own_model, ...options } = pureNode.options
      if (!pureNode.options.is_own_model) {
        result.push(
          {
            name: "download",
            options: {
              name: pureNode.options.model,
            },
          },
          {
            ...pureNode,
            options: {
              ...options,
              model: MODEL_PREFIX + pureNode.options.model + MODEL_POSTFIX,
            },
          },
        )
      } else {
        result.push({
          ...pureNode,
          options: {
            ...options,
          },
        })
      }
    } else {
      result.push(pureNode)
    }
  }
  return JSON.stringify(result)
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
