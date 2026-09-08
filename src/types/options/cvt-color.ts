import * as v from "valibot"
import { CvtType } from "~/types/enums"

export interface PureCvtColorNodeOptions {
  cvt_type: CvtType
}

export const cvtColorNodeOptionsSchema = v.object({
  cvt_type: v.picklist(Object.values(CvtType)),
})

export type CvtColorNodeOptions = v.InferOutput<typeof cvtColorNodeOptionsSchema>
