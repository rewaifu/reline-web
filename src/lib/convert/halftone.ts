import type {ConvertToPureFunction, ConvertToStackFunction} from "~/lib/convert/index.ts"
import type { ScreentoneNodeOptions } from "~/types/options"
import {NodeType, PureNodeType} from "~/types/enums.ts"
import {DEFAULT_COLLAPSED} from "~/constants.ts";

export const convertScreentoneToPure: ConvertToPureFunction = (nodes, index) => {
  const node = nodes[index]
  const options = node.options as ScreentoneNodeOptions
  return [
    [
      {
        type: PureNodeType.HALFTONE,
        options: {
          dot_size: options.dot_size,
        },
      },
    ],
    index + 1,
  ]
}
// todo halftone
export const convertHalftoneToStack: ConvertToStackFunction = (nodes, index) => {
  const node = nodes[index]
  const options = node.options as ScreentoneNodeOptions
  return [
    [
      {
        id: index,
        type: NodeType.SCREENTONE,
        options: {
          dot_size: options.dot_size,
        },
        collapsed: DEFAULT_COLLAPSED
      },
    ],
    index + 1,
  ]
}
