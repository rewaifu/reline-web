import * as v from "valibot"
import { WriterNodeFormat } from "~/types/enums"

export interface PureFolderWriterNodeOptions {
  path: string
  format: WriterNodeFormat
}

export const folderWriterOptionsSchema = v.object({
  path: v.string(),
  format: v.picklist(Object.values(WriterNodeFormat)),
})

export type FolderWriterNodeOptions = v.InferOutput<typeof folderWriterOptionsSchema>
