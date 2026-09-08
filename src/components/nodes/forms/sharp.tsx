import { type Component, Show } from "solid-js"
import { CannyType } from "~/types/enums"
import { useNodeForm, NumberRow, SelectRow, CheckRow } from "./shared"
import type { SharpNodeOptions } from "~/types/options"
import styles from "./forms.module.scss"

type FormProps = { nodeId: number }

export const SharpForm: Component<FormProps> = (props) => {
  const form = useNodeForm(() => props.nodeId)
  const options = () => form.options() as SharpNodeOptions
  return (
    <div class={styles.form}>
      <div class={styles.grid2}>
        <NumberRow label="Low input" value={options().low_input} min={0} max={255} onInput={(low_input) => form.set({ low_input })} />
        <NumberRow label="High input" value={options().high_input} min={0} max={255} onInput={(high_input) => form.set({ high_input })} />
      </div>
      <NumberRow label="Gamma" value={options().gamma} min={0} max={10} step={0.1} onInput={(gamma) => form.set({ gamma })} />
      <div class={styles.grid2}>
        <NumberRow
          label="Diapason white"
          value={options().diapason_white}
          min={0}
          max={255}
          onInput={(diapason_white) => form.set({ diapason_white })}
        />
        <NumberRow
          label="Diapason black"
          value={options().diapason_black}
          min={0}
          max={255}
          onInput={(diapason_black) => form.set({ diapason_black })}
        />
      </div>
      <CheckRow label="Canny" checked={options().canny} onChange={(canny) => form.set({ canny })} />
      <Show when={options().canny}>
        <SelectRow
          label="Canny type"
          value={options().canny_type}
          items={[CannyType.NORMAL, CannyType.INVERT, CannyType.UNSHARP]}
          onChange={(canny_type) => form.set({ canny_type: canny_type as CannyType })}
        />
      </Show>
    </div>
  )
}
