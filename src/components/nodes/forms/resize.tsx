import { type Component, Show, createMemo } from "solid-js"
import { FilterType, ResizeType } from "~/types/enums"
import { useNodeForm, NumberRow, SelectRow, CheckRow } from "./shared"
import type { ResizeNodeOptions } from "~/types/options"
import styles from "./forms.module.scss"

type FormProps = { nodeId: number }

const FILTERS = [
  FilterType.NEAREST, FilterType.BOX, FilterType.LINEAR, FilterType.HAMMING,
  FilterType.CATMULLROM, FilterType.MITCHELL, FilterType.LANCZOS, FilterType.GAUSS,
] as const

export const ResizeForm: Component<FormProps> = (props) => {
  const form = useNodeForm(() => props.nodeId)
  const options = () => form.options() as ResizeNodeOptions
  const type = createMemo(() => options().resize_type)
  return (
    <div class={styles.form}>
      <SelectRow
        label="Resize type"
        value={type()}
        items={[ResizeType.BY_WIDTH, ResizeType.BY_HEIGHT, ResizeType.ABSOLUTE, ResizeType.PERCENT]}
        onChange={(resize_type) => form.set({ resize_type: resize_type as ResizeType })}
      />
      <Show when={type() === ResizeType.BY_WIDTH}>
        <NumberRow label="Width (px)" value={options().width} min={0} step={1} onInput={(width) => form.set({ width })} />
      </Show>
      <Show when={type() === ResizeType.BY_HEIGHT}>
        <NumberRow label="Height (px)" value={options().height} min={0} step={1} onInput={(height) => form.set({ height })} />
      </Show>
      <Show when={type() === ResizeType.ABSOLUTE}>
        <div class={styles.grid2}>
          <NumberRow label="Width (px)" value={options().width} min={0} step={1} onInput={(width) => form.set({ width })} />
          <NumberRow label="Height (px)" value={options().height} min={0} step={1} onInput={(height) => form.set({ height })} />
        </div>
      </Show>
      <Show when={type() === ResizeType.PERCENT}>
        <NumberRow label="Percent" value={options().percent} min={0} step={1} onInput={(percent) => form.set({ percent })} />
      </Show>
      <SelectRow
        label="Filter"
        value={options().filter}
        items={FILTERS}
        onChange={(filter) => form.set({ filter: filter as FilterType })}
      />
      <CheckRow label="Spread" checked={options().spread} onChange={(spread) => form.set({ spread })} />
      <Show when={options().spread}>
        <NumberRow label="Spread size" value={options().spread_size} min={0} step={1} onInput={(spread_size) => form.set({ spread_size })} />
      </Show>
    </div>
  )
}
