import { type Component, Show } from "solid-js"
import { DotType, HalftoneMode } from "~/types/enums"
import { useNodeForm, SelectRow, CheckRow, NumberRow, NumberOrListRow } from "./shared"
import type { ScreentoneNodeOptions } from "~/types/options"
import styles from "./forms.module.scss"

type FormProps = { nodeId: number }

const DOT_TYPES = [DotType.CIRCLE, DotType.LINE, DotType.ELLIPSE, DotType.INVERT, DotType.INVLINE] as const

export const ScreentoneForm: Component<FormProps> = (props) => {
  const form = useNodeForm(() => props.nodeId)
  const options = () => form.options() as ScreentoneNodeOptions
  return (
    <div class={styles.form}>
      <SelectRow
        label="Halftone mode"
        value={options().halftone_mode}
        items={[HalftoneMode.GRAY, HalftoneMode.RGB, HalftoneMode.HSV, HalftoneMode.CMYK]}
        onChange={(halftone_mode) => form.set({ halftone_mode: halftone_mode as HalftoneMode })}
      />
      <NumberOrListRow
        label="Dot size"
        value={options().dot_size}
        onInput={(dot_size) => form.set({ dot_size } as Partial<ScreentoneNodeOptions>)}
      />
      <NumberOrListRow
        label="Angle"
        value={options().angle}
        onInput={(angle) => form.set({ angle } as Partial<ScreentoneNodeOptions>)}
      />
      <Show
        when={Array.isArray(options().dot_type)}
        fallback={
          <SelectRow
            label="Dot type"
            value={options().dot_type as string}
            items={DOT_TYPES as unknown as readonly string[]}
            onChange={(dot_type) => form.set({ dot_type: dot_type as DotType })}
          />
        }
      >
        <p class={styles.hint}>Dot type list editing: [{(options().dot_type as string[]).join(", ")}]</p>
      </Show>
      <CheckRow
        label="Disable auto dot"
        checked={options().disable_auto_dot ?? false}
        onChange={(disable_auto_dot) => form.set({ disable_auto_dot })}
      />
      <NumberRow label="SSAA scale" value={options().ssaa_scale} min={0} step={1} onInput={(ssaa_scale) => form.set({ ssaa_scale })} />
    </div>
  )
}
