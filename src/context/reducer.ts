import { NodeActionType } from "~/types/enums"
import type { NodesAction, StackNode } from "~/types/node"

export const nodesReducer = (state: StackNode[], action: NodesAction): StackNode[] => {
  const { type, payload } = action
  switch (type) {
    case NodeActionType.CHANGE:
      return state.map((node) => (node.id === (payload as StackNode).id ? (payload as StackNode) : node))
    case NodeActionType.ADD:
      return [...state, payload as StackNode]
    case NodeActionType.DELETE:
      return state.filter((node) => node.id !== (payload as StackNode).id).map((node, index) => ({ ...node, id: index }))
    case NodeActionType.MOVEDOWN:
      return state.map((node, index) => {
        if (index === (payload as StackNode).id + 1) {
          return {
            ...(payload as StackNode),
            id: index,
          }
        }
        if (index === (payload as StackNode).id) {
          return {
            ...state[index + 1],
            id: (payload as StackNode).id,
          }
        }
        return node
      })
    case NodeActionType.MOVEUP:
      return state.map((node, index) => {
        if (index === (payload as StackNode).id - 1) {
          return {
            ...(payload as StackNode),
            id: index,
          }
        }
        if (index === (payload as StackNode).id) {
          return {
            ...state[index - 1],
            id: (payload as StackNode).id,
          }
        }
        return node
      })
    case NodeActionType.IMPORT:
      return payload as StackNode[]
    default:
      return state
  }
}
