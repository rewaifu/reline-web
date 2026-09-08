import { type Component, Show, createUniqueId } from "solid-js"
import { useNodes, useNodesDispatch } from "~/context/contexts"
import { NodesActionType } from "~/types/actions"
import type { NodeOptions } from "~/types/node"
import { Input, Label, UiSelect, UiCheckbox } from "~/components/ui"
import styles from "./forms.module.scss"

export interface NodeForm {
  options: () => NodeOptions
  set: (patch: Partial<NodeOptions>) => void
}

/** Shared per-node form state: typed read + immutable CHANGE dispatch. */
export const useNodeForm = (nodeId: () => number): NodeForm => {
  const nodes = useNodes()
  const dispatch = useNodesDispatch()
  const node = () => nodes.find((n) => n.id === nodeId())

  return {
    // Node presence is guaranteed by the <Show> guard in NodeOptionsForm.
    options: () => node()?.options as NodeOptions,
    set: (patch) => {
      const current = node()
      if (!current) return
      dispatch({
        type: NodesActionType.CHANGE,
        payload: { ...current, options: { ...current.options, ...patch } },
      })
    },
  }
}

export interface TextRowProps {
  label: string
  value: string
  onInput: (value: string) => void
  placeholder?: string
}

export const TextRow: Component<TextRowProps> = (props) => {
  const id = createUniqueId()
  return (
    <div class={styles.row}>
      <Label for={id}>{props.label}</Label>
      <Input
        id={id}
        type="text"
        placeholder={props.placeholder}
        value={props.value}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
    </div>
  )
}

export interface NumberRowProps {
  label: string
  value: number | undefined
  onInput: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export const NumberRow: Component<NumberRowProps> = (props) => {
  const id = createUniqueId()
  const clamp = (value: number) => {
    let v = value
    if (props.min !== undefined) v = Math.max(props.min, v)
    if (props.max !== undefined) v = Math.min(props.max, v)
    return v
  }
  const step = (dir: 1 | -1) => {
    const size = props.step ?? 1
    props.onInput(clamp((props.value ?? props.min ?? 0) + dir * size))
  }
  return (
    <div class={styles.row}>
      <Label for={id}>{props.label}</Label>
      <div class={styles.stepper}>
        <Input
          id={id}
          type="number"
          class={styles.stepInput}
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value === undefined ? "" : String(props.value)}
          onInput={(e) => {
            const parsed = Number(e.currentTarget.value)
            if (e.currentTarget.value !== "" && Number.isFinite(parsed)) props.onInput(parsed)
          }}
        />
        <div class={styles.spinners}>
          <button
            type="button"
            class={styles.stepBtn}
            tabindex="-1"
            aria-label={`Increase ${props.label}`}
            onClick={() => step(1)}
          >
            ▴
          </button>
          <button
            type="button"
            class={styles.stepBtn}
            tabindex="-1"
            aria-label={`Decrease ${props.label}`}
            onClick={() => step(-1)}
          >
            ▾
          </button>
        </div>
      </div>
    </div>
  )
}

export interface SelectRowProps {
  label: string
  value: string
  items: readonly string[]
  onChange: (value: string) => void
}

export const SelectRow: Component<SelectRowProps> = (props) => {
  const id = createUniqueId()
  return (
    <div class={styles.row}>
      <Label for={id}>{props.label}</Label>
      <UiSelect id={id} value={props.value} items={props.items} onChange={props.onChange} />
    </div>
  )
}

export interface CheckRowProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export const CheckRow: Component<CheckRowProps> = (props) => {
  const id = createUniqueId()
  return (
    <div class={styles.row}>
      <Label for={id}>{props.label}</Label>
      <UiCheckbox id={id} checked={props.checked} onChange={props.onChange} />
    </div>
  )
}

export interface NumberOrListRowProps {
  label: string
  value: number | number[]
  onInput: (value: number | number[]) => void
}

/** Edits a `number | number[]` option: scalar via number input, arrays via comma-separated text. */
export const NumberOrListRow: Component<NumberOrListRowProps> = (props) => {
  const id = createUniqueId()
  const isList = () => Array.isArray(props.value)
  const text = () => (isList() ? (props.value as number[]).join(", ") : String(props.value))

  const toggleMode = () =>
    props.onInput(isList() ? Number((props.value as number[])[0] ?? 0) : [Number(props.value) || 0])

  const parseNumbers = (raw: string): number[] =>
    raw
      .split(",")
      .map((part) => Number(part.trim()))
      .filter((n) => Number.isFinite(n) && raw.trim() !== "")

  return (
    <div class={styles.row}>
      <Label for={id}>
        {props.label}
        <button type="button" class={styles.modeToggle} onClick={toggleMode}>
          {isList() ? "list" : "single"}
        </button>
      </Label>
      <Show
        when={isList()}
        fallback={
          <Input
            id={id}
            type="number"
            value={text()}
            onInput={(e) => {
              const parsed = Number(e.currentTarget.value)
              if (e.currentTarget.value !== "" && Number.isFinite(parsed)) props.onInput(parsed)
            }}
          />
        }
      >
        <Input
          id={id}
          type="text"
          placeholder="1, 2, 3"
          value={text()}
          onInput={(e) => {
            const parsed = parseNumbers(e.currentTarget.value)
            if (parsed.length > 0) props.onInput(parsed)
          }}
        />
      </Show>
    </div>
  )
}

