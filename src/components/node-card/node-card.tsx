import { type Component, For, Show, createEffect, createMemo, createSignal } from "solid-js"
import { createDragReorder, type DragHandlers } from "~/hooks/use-drag-reorder"
import { flipReorder } from "~/hooks/use-flip-reorder"
import { useNodes, useNodesDispatch } from "~/context/contexts"
import { NodesActionType } from "~/types/actions"
import type { StackNode } from "~/types/node"
import { NODE_DEFS } from "~/components/nodes/registry"
import { NodeOptionsForm } from "~/components/nodes/node-options-form"
import styles from "./node-card.module.scss"

interface NodeCardProps {
  id: number
  /** Position in the stack — drag state is index-based, ids are not. */
  index: number
  selectedId: number | null
  onSelect: (id: number) => void
  dragIndex: () => number | null
  dropIndex: () => number | null
  handlers: (index: number) => DragHandlers
}

const NodeCard: Component<NodeCardProps> = (props) => {
  const nodes = useNodes()
  const dispatch = useNodesDispatch()
  const [editing, setEditing] = createSignal(false)
  const [draft, setDraft] = createSignal("")

  const node = () => nodes.find((n) => n.id === props.id)
  const expanded = () => node()?.collapsed === false

  const change = (patch: Partial<StackNode>) => {
    const current = node()
    if (!current) return
    dispatch({ type: NodesActionType.CHANGE, payload: { ...current, ...patch } })
  }

  const startRename = () => {
    setDraft(node()?.name ?? "")
    setEditing(true)
  }

  const commitRename = () => {
    const value = draft().trim()
    change({ name: value === "" ? undefined : value })
    setEditing(false)
  }

  return (
    <Show when={node()}>
      {(node) => (
        <>
          <div class={{ [styles.dropPlaceholder]: true, [styles.visible]: props.dropIndex() === props.index }} />
          <section
            data-node-id={props.id}
            data-flip-key={node().uid}
            class={{
              [styles.card]: true,
              [styles.selected]: props.selectedId === props.id,
              [styles.dragging]: props.dragIndex() === props.index,
            }}
            onClick={() => props.onSelect(props.id)}
          >
            <header
              class={styles.header}
              onClick={() => {
                props.onSelect(props.id)
                change({ collapsed: !node().collapsed })
              }}
            >
              <span
                class={styles.dragHandle}
                title="Drag to reorder"
                {...props.handlers(props.index)}
              >
                ⠿
              </span>
              <Show
                when={!editing()}
                fallback={
                  <input
                    class={styles.renameInput}
                    value={draft()}
                    placeholder={node().name ?? NODE_DEFS[node().type].label}
                    aria-label="Node name"
                    onClick={(e) => e.stopPropagation()}
                    onInput={(e) => setDraft(e.currentTarget.value)}
                    onBlur={commitRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitRename()
                      else if (e.key === "Escape") setEditing(false)
                    }}
                  />
                }
              >
                <span class={styles.title} onDblClick={startRename} title="Double click to rename">
                  <span class={styles.titleText}>{node().name ?? NODE_DEFS[node().type].label}</span>
                  <Show when={node().name}>
                    <span class={styles.typeHint}>{NODE_DEFS[node().type].label}</span>
                  </Show>
                </span>
              </Show>
              <button
                type="button"
                class={styles.chevron}
                aria-label="Toggle node"
                aria-expanded={expanded() ? "true" : "false"}
                onClick={(e) => {
                  e.stopPropagation()
                  change({ collapsed: !node().collapsed })
                }}
              >
                {expanded() ? "▾" : "▸"}
              </button>
            </header>
            <Show when={expanded()}>
              <div class={styles.separator} role="separator" />
              <NodeOptionsForm nodeId={props.id} />
            </Show>
          </section>
        </>
      )}
    </Show>
  )
}

export interface NodeCardsProps {
  selectedId: () => number | null
  onSelect: (id: number) => void
}
export const NodeCards: Component<NodeCardsProps> = (props) => {
  const nodes = useNodes()
  const dispatch = useNodesDispatch()
  let stack: HTMLDivElement | undefined
  const { dragIndex, dropIndex, handlers, containerHandlers } = createDragReorder((from, to) => {
    flipReorder(stack, "[data-flip-key]", () => {
      dispatch({ type: NodesActionType.MOVE, payload: { from, to } })
      // ids reindex to array positions: the moved node keeps its id
      if (props.selectedId() === from) props.onSelect(to)
    }, (el) => el.getAttribute("data-flip-key"))
  })

  // Render by node objects, not ids: ids are reindexed to array positions
  // after every MOVE, so an ids-keyed list never sees the order change.

  // selecting a node in the left list scrolls its card into view
  createEffect(
    () => props.selectedId(),
    (id) => {
      if (id === null) return
      stack
        ?.querySelector(`[data-node-id="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    },
  )

  return (
    <div class={styles.stack} ref={stack} {...containerHandlers()}>
      <For each={nodes}>
        {(_node, index) => (
          <NodeCard
            id={nodes[index()].id}
            index={index()}
            selectedId={props.selectedId()}
            onSelect={props.onSelect}
            dragIndex={dragIndex}
            dropIndex={dropIndex}
            handlers={handlers}
          />
        )}
      </For>
      <div class={{ [styles.dropPlaceholder]: true, [styles.visible]: dropIndex() === nodes.length }} />
    </div>
  )
}
