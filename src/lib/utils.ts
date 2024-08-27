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
    if (pureNode.type === NodeType.UPSCALE) {
      const { is_own_model, ...options } = pureNode.options
      if (!pureNode.options.is_own_model) {
        result.push(
          {
            type: "download",
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
    } else if (pureNode.type === NodeType.RESIZE) {
      const { resize_type, ...options } = pureNode.options
      result.push({
        ...pureNode,
        options: options,
      })
    } else if (pureNode.type === NodeType.SCREENTONE) {
      result.push({
        type: 'halftone',
        options: {
          ...pureNode.options
        }
      })
    }
    else {
      result.push(pureNode)
    }
  }
  return JSON.stringify(result, null, 2)
}

export function stringToNodes(text: string) {
  const pureNodes = JSON.parse(text) as (Partial<StackNode> | { type: "download"; options: { name: string } })[]
  const res: StackNode[] = []
  let index = 0
  for (let i = 0; i < pureNodes.length; i += 1) {
    const pureNode = pureNodes[i]
    if (pureNode.type === "download") {
      const scaleNode = pureNodes[i + 1]
      const model = pureNode.options.name
      res.push({
        id: index,
        type: NodeType.UPSCALE,
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
    if (pureNode.type === NodeType.UPSCALE) {
      res.push({
        id: index,
        type: NodeType.UPSCALE,
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
