import { NodeActionType } from "~/types/enums"
import type { NodesAction, StackNode } from "~/types/node"

export const nodesReducer = (state: StackNode[], action: NodesAction) => {
  const { type, payload } = action
  switch (type) {
    case NodeActionType.CHANGE:
      return state.map((node) => (node.id === payload.id ? payload : node))
    case NodeActionType.ADD:
      return [...state, payload]
    case NodeActionType.DELETE:
      return state.filter((node) => node.id !== payload.id).map((node, index) => ({ ...node, id: index }))
    case NodeActionType.MOVEDOWN:
      return state.map((node, index) => {
        if (index === payload.id + 1) {
          return {
            ...payload,
            id: index,
          }
        }
        if (index === payload.id) {
          return {
            ...state[index + 1],
            id: payload.id,
          }
        }
        return node
      })
    case NodeActionType.MOVEUP:
      return state.map((node, index) => {
        if (index === payload.id - 1) {
          return {
            ...payload,
            id: index,
          }
        }
        if (index === payload.id) {
          return {
            ...state[index - 1],
            id: payload.id,
          }
        }
        return node
      })
    default:
      return state
  }
}
