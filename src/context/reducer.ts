import { type NodesAction, NodesActionType } from "~/types/actions"
import type { StackNode } from "~/types/node"

export const nodesReducer = (state: StackNode[], action: NodesAction) => {
  const { type, payload } = action
  switch (type) {
    case NodesActionType.CHANGE:
      return state.map((node) => (node.id === payload.id ? payload : node))
    default:
      return state
  }
}
