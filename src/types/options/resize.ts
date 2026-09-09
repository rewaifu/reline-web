import * as v from "valibot";
import { FilterType, ResizeType } from "~/types/enums";

export interface PureResizeOptions {
  width?: number;
  height?: number;
  percent?: number;
  filter: FilterType;
  spread: boolean;
  spread_size?: number;
}

export const resizeOptionsSchema = v.object({
  resize_type: v.picklist(Object.values(ResizeType)),
  width: v.optional(v.number()),
  height: v.optional(v.number()),
  percent: v.optional(v.number()),
  filter: v.picklist(Object.values(FilterType)),
  spread: v.boolean(),
  spread_size: v.optional(v.number()),
});

export type ResizeNodeOptions = v.InferOutput<typeof resizeOptionsSchema>;
