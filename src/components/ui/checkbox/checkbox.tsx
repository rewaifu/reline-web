import { omit, type Component } from "solid-js"
import { Checkbox } from "@kobalte/core/checkbox"
import styles from "./checkbox.module.scss"

export interface UiCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  /** Visible text rendered next to the control by Kobalte (<Checkbox.Label>). */
  label?: string
  /** Accessible name for the hidden input — use when the label is rendered outside. */
  ariaLabel?: string
  /** Set to link an external <label for> to this control. */
  id?: string
  class?: string
}

export const UiCheckbox: Component<UiCheckboxProps> = (props) => {
  const rest = omit(props, "checked", "onChange", "label", "ariaLabel", "id", "class")

  return (
    <Checkbox
      class={[styles.checkbox, props.class]}
      checked={props.checked}
      onChange={props.onChange}
      {...rest}
    >
      <Checkbox.Input id={props.id} aria-label={props.ariaLabel} />
      <Checkbox.Control class={styles.control}>
        <Checkbox.Indicator>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M4 12l5 5L20 6" />
          </svg>
        </Checkbox.Indicator>
      </Checkbox.Control>
      {props.label && <Checkbox.Label class={styles.label}>{props.label}</Checkbox.Label>}
    </Checkbox>
  )
}
