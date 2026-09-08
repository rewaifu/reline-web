import { type Component, For, Show, createEffect, createMemo, createSignal } from "solid-js"
import { NODE_DEFS, NODE_ORDER } from "~/components/nodes/registry"
import styles from "./nodes-list.module.scss"

export interface AddNodeMenuProps {
  onAdd: (label: string) => void
}

/**
 * Anchored popover for adding nodes: positioned with CSS relative to the
 * trigger (opens upward, inside the panel) so it never escapes the viewport.
 */
export const AddNodeMenu: Component<AddNodeMenuProps> = (props) => {
  const [open, setOpen] = createSignal(false)
  const items = createMemo(() => NODE_ORDER.map((type) => NODE_DEFS[type].label))

  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen) return

      const onPointerDown = (e: PointerEvent) => {
        if (e.target instanceof Element && e.target.closest(`.${styles.addNode}`)) return
        setOpen(false)
      }
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false)
      }

      document.addEventListener("pointerdown", onPointerDown)
      document.addEventListener("keydown", onKeyDown)
      return () => {
        document.removeEventListener("pointerdown", onPointerDown)
        document.removeEventListener("keydown", onKeyDown)
      }
    },
  )

  const add = (label: string) => {
    setOpen(false)
    props.onAdd(label)
  }

  return (
    <div class={styles.addNode}>
      <button
        type="button"
        class={styles.addButton}
        aria-haspopup="listbox"
        aria-expanded={open() ? "true" : "false"}
        onClick={() => setOpen((v) => !v)}
      >
        + Add node
      </button>
      <Show when={open()}>
        <div class={styles.addMenu}>
          <ul class={styles.addMenuList} role="listbox" aria-label="Add node">
            <For each={items()}>
              {(label) => (
                <li
                  role="option"
                  aria-selected="false"
                  tabindex="-1"
                  class={styles.addMenuItem}
                  onClick={() => add(label)}
                >
                  {label}
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  )
}
