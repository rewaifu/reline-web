import { omit, type Component } from "solid-js"
import { Select } from "@kobalte/core/select"
import styles from "./select.module.scss"

export interface UiSelectProps {
  value: string | null
  onChange: (value: string) => void
  items: readonly string[]
  placeholder?: string
  /** Accessible name for the trigger — use when the visible label lives outside. */
  ariaLabel?: string
  /** Set to link an external <label for> to this trigger. */
  id?: string
  class?: string
}

export const UiSelect: Component<UiSelectProps> = (props) => {
  const rest = omit(props, "onChange", "value", "items", "placeholder", "ariaLabel", "id", "class")

  return (
    <Select
      value={props.value}
      onChange={(value) => value !== null && props.onChange(value)}
      options={props.items as string[]}
      placeholder={props.placeholder ?? "Select…"}
      itemComponent={(item) => (
        <Select.Item item={item.item} class={styles.item}>
          {item.item.rawValue}
        </Select.Item>
      )}
      gutter={4}
      placement="bottom-start"
      {...rest}
    >
      <Select.Trigger
        id={props.id}
        class={[styles.trigger, props.class]}
        aria-label={props.ariaLabel}
      >
        <Select.Value class={styles.value}>
          {(state) => String(state.selectedOption() ?? props.placeholder ?? "")}
        </Select.Value>
        <Select.Icon class={styles.icon} aria-hidden="true">
          ▾
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content class={styles.content}>
          <Select.Listbox class={styles.listbox} />
        </Select.Content>
      </Select.Portal>
    </Select>
  )
}
