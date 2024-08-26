import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { MODEL_POSTFIX, MODEL_PREFIX } from "~/constants"
import { NodeType } from "~/types/enums"
import type { StackNode } from "~/types/node"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function nodesToString(nodes: StackNode[]): string {
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

export function stringToNodes(text: string) {
  const pureNodes = JSON.parse(text) as (Partial<StackNode> | { name: "download"; options: { name: string } })[]
  const res: StackNode[] = []
  let index = 0
  for (let i = 0; i < pureNodes.length; i += 1) {
    const pureNode = pureNodes[i]
    if (pureNode.name === "download") {
      const scaleNode = pureNodes[i + 1]
      const model = pureNode.options.name
      res.push({
        id: index,
        name: NodeType.UPSCALE,
        options: {
          ...(scaleNode as StackNode).options,
          model: model,
          is_own_model: false,
        },
        collapsed: true,
      })
      i += 1
      index += 1
      continue
    }
    if (pureNode.name === NodeType.UPSCALE) {
      res.push({
        id: index,
        name: NodeType.UPSCALE,
        options: {
          ...pureNode.options,
          is_own_model: true,
        },
        collapsed: true,
      })
      index += 1
      continue
    }
    res.push({
      ...(pureNode as StackNode),
      id: index,
      collapsed: true,
    })
    index += 1
  }
  return res
}
