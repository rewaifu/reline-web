import * as v from "valibot";
import { ReaderNodeMode } from "~/types/enums";

export interface PureFolderReaderNodeOptions {
  path: string;
  mode: ReaderNodeMode;
  recursive: boolean;
}

export const folderReaderOptionsSchema = v.object({
  path: v.string(),
  mode: v.picklist(Object.values(ReaderNodeMode)),
  recursive: v.boolean(),
  /** When set, the reader spawns an Unarchive preprocessor for `${path}.zip`. */
  unarchive: v.boolean(),
});

export type FolderReaderNodeOptions = v.InferOutput<
  typeof folderReaderOptionsSchema
>;
