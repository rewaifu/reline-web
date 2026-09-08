import { type StoreSetter } from "solid-js"
import { type NodesAction, NodesActionType } from "~/types/actions"
import { ensureUids } from "~/lib/uid"
import type { StackNode } from "~/types/node"

export type NodesSetter = StoreSetter<StackNode[]>

/** Pure store transitions — persistence is observed in `App`, not here. */
export const createNodesDispatch = (setNodes: NodesSetter) => {
  return (action: NodesAction) => processAction(setNodes, action)
}

const processAction = (setNodes: NodesSetter, action: NodesAction): void => {
  const { type, payload } = action

  switch (type) {
    case NodesActionType.CHANGE:
      setNodes((state) => {
        const index = state.findIndex((node) => node.id === payload.id)
        if (index !== -1) state[index] = payload
      })
      break

    case NodesActionType.MOVE:
      setNodes((state) => {
        const next = Array.from(state)
        const [moved] = next.splice(payload.from, 1)
        if (!moved) return state
        next.splice(payload.to, 0, moved)
        // reindex, but keep object identity for nodes whose id did not change
        // so keyed rendering (and FLIP animations) can reuse DOM nodes
        return next.map((node, index) => (node.id === index ? node : { ...node, id: index }))
      })
      break

    case NodesActionType.ADD:
      setNodes((state) => {
        state.push(payload)
      })
      break

    case NodesActionType.DELETE:
      // ids are array positions: drop the node and reindex the rest
      setNodes((state) =>
        state.filter((node) => node.id !== payload).map((node, index) => ({ ...node, id: index })),
      )
      break

    case NodesActionType.IMPORT:
      setNodes(() => ensureUids(payload))
      break

    default:
      break
  }
}
