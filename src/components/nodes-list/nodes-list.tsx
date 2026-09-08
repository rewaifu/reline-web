import { type Component, For, Show } from "solid-js"
import { createDragReorder } from "~/hooks/use-drag-reorder"
import { flipReorder } from "~/hooks/use-flip-reorder"
import { newUid } from "~/lib/uid"
import { useNodes, useNodesDispatch } from "~/context/contexts"
import { NodesActionType } from "~/types/actions"
import { NodeType } from "~/types/enums"
import type { StackNode } from "~/types/node"
import { NODE_DEFS, NODE_ORDER } from "~/components/nodes/registry"
import { UiCheckbox } from "~/components/ui"
import { AddNodeMenu } from "~/components/nodes-list/add-node-menu"
import styles from "./nodes-list.module.scss"

export interface NodesListProps {
  selectedId: () => number | null
  onSelect: (id: number) => void
}

export const NodesList: Component<NodesListProps> = (props) => {
  const nodes = useNodes()
  const dispatch = useNodesDispatch()

  let itemsEl: HTMLDivElement | undefined
  const { dragIndex, dropIndex, handlers, containerHandlers } = createDragReorder((from, to) => {
    flipReorder(itemsEl, "[data-flip-key]", () => {
      dispatch({ type: NodesActionType.MOVE, payload: { from, to } })
      // ids reindex to array positions: the moved node keeps its id
      if (props.selectedId() === from) props.onSelect(to)
    }, (el) => el.getAttribute("data-flip-key"))
  })

  const addNode = (label: string) => {
    const def = Object.values(NODE_DEFS).find((d) => d.label === label)
    if (!def) return
    const nextId = Math.max(-1, ...nodes.map((n) => n.id)) + 1
    dispatch({
      type: NodesActionType.ADD,
      payload: { id: nextId, uid: newUid(), type: def.type, options: { ...def.defaults }, collapsed: false },
    })
    props.onSelect(nextId)
  }

  const toggleEnabled = (node: StackNode, enabled: boolean) => {
    // the pipeline needs at least one enabled node
    if (!enabled && nodes.filter((n) => n.enabled !== false && n.id !== node.id).length === 0) return
    dispatch({ type: NodesActionType.CHANGE, payload: { ...node, enabled } })
  }

  const count = () => nodes.length

  return (
    <aside class={styles.panel} {...containerHandlers()}>
      <div class={styles.items} ref={itemsEl}>
        <For each={nodes}>
          {(node, index) => (
            <>
              <div class={{ [styles.dropPlaceholder]: true, [styles.visible]: dropIndex() === index() }} />
              <div
                data-node-id={node.id}
                data-flip-key={node.uid}
                class={{
                  [styles.item]: true,
                  [styles.active]: props.selectedId() === node.id,
                  [styles.dragging]: dragIndex() === index(),
                }}
                onClick={() => props.onSelect(node.id)}
                {...handlers(index())}
              >
                <UiCheckbox
                  checked={node.enabled !== false}
                  onChange={(checked) => toggleEnabled(node, checked)}
                  ariaLabel={`Enable ${node.name ?? NODE_DEFS[node.type].label}`}
                />
                <span class={styles.name}>
                  <span class={styles.nameText}>{node.name ?? NODE_DEFS[node.type].label}</span>
                  <Show when={node.name}>
                    <span class={styles.typeHint}>{NODE_DEFS[node.type].label}</span>
                  </Show>
                </span>
                <button
                  type="button"
                  class={styles.remove}
                  aria-label={`Remove ${node.name ?? NODE_DEFS[node.type].label}`}
                  onClick={(e) => {
                    e.stopPropagation()
                    dispatch({ type: NodesActionType.DELETE, payload: node.id })
                  }}
                >
                  ×
                </button>
              </div>
            </>
          )}
        </For>
        <div class={{ [styles.dropPlaceholder]: true, [styles.visible]: dropIndex() === count() }} />
      </div>
      <AddNodeMenu onAdd={addNode} />
    </aside>
  )
}
