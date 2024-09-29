import type { ConvertToStackFunction } from "~/lib/convert/index.ts"
import type { PureFolderReaderNodeOptions } from "~/types/options"
import { NodeType } from "~/types/enums.ts"
import { DEFAULT_COLLAPSED } from "~/constants.ts"

export const convertUnarchiveToStack: ConvertToStackFunction = (nodes, index) => {
  const readerNode = nodes[index + 1]
  const readerOptions = readerNode.options as PureFolderReaderNodeOptions
  return [
    [
      {
        id: index,
        type: NodeType.FOLDER_READER,
        options: {
          ...readerOptions,
          unarchive: true,
        },
        collapsed: DEFAULT_COLLAPSED,
      },
    ],
    index + 2,
  ]
}
