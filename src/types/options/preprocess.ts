import * as v from "valibot"

// Pure-only preprocess options. These nodes never exist in the UI stack:
// they are generated from parent nodes (Upscale / FolderReader) at
// serialization and referenced back through `meta.parents`.

export const downloadOptionsSchema = v.object({
  name: v.string(),
})

export const unarchiveOptionsSchema = v.object({
  path: v.string(),
})
