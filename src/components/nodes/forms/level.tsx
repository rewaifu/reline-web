import { type Component } from "solid-js"
import { useNodeForm, NumberRow } from "./shared"
import type { LevelNodeOptions } from "~/types/options"
import styles from "./forms.module.scss"

type FormProps = { nodeId: number }

export const LevelForm: Component<FormProps> = (props) => {
  const form = useNodeForm(() => props.nodeId)
  const options = () => form.options() as LevelNodeOptions
  return (
    <div class={styles.form}>
      <div class={styles.grid2}>
        <NumberRow label="Low input" value={options().low_input} min={0} max={255} onInput={(low_input) => form.set({ low_input })} />
        <NumberRow label="High input" value={options().high_input} min={0} max={255} onInput={(high_input) => form.set({ high_input })} />
      </div>
      <div class={styles.grid2}>
        <NumberRow label="Low output" value={options().low_output} min={0} max={255} onInput={(low_output) => form.set({ low_output })} />
        <NumberRow label="High output" value={options().high_output} min={0} max={255} onInput={(high_output) => form.set({ high_output })} />
      </div>
      <NumberRow label="Gamma" value={options().gamma} min={0} max={10} step={0.1} onInput={(gamma) => form.set({ gamma })} />
    </div>
  )
}
