import { STORAGE_KEY } from "~/constants"
import { type NodesAction, NodesActionType } from "~/types/actions"
import type { StackNode } from "~/types/node"

const saveData = (nodes: StackNode[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes))
}

const normalizeNodeIds = (nodes: StackNode[]) => {
  const usedIds = new Set<number>()
  let nextId = 0

  return nodes.map((node) => {
    if (!usedIds.has(node.id)) {
      usedIds.add(node.id)
      nextId = Math.max(nextId, node.id + 1)
      return node
    }

    while (usedIds.has(nextId)) {
      nextId += 1
    }

    const normalized = { ...node, id: nextId }
    usedIds.add(nextId)
    nextId += 1
    return normalized
  })
}

export const nodesReducer = (state: StackNode[], action: NodesAction): StackNode[] => {
  const newState = processAction(state, action)
  saveData(newState)
  return newState
}

const processAction = (state: StackNode[], action: NodesAction): StackNode[] => {
  const { type, payload } = action
  switch (type) {
    case NodesActionType.CHANGE:
      return state.map((node) => (node.id === payload.id ? payload : node))
    case NodesActionType.ADD:
      return [...state, payload]
    case NodesActionType.DELETE:
      return state.filter((node) => node.id !== payload)
    case NodesActionType.MOVE: {
      if (
        payload.from < 0 ||
        payload.from >= state.length ||
        payload.to < 0 ||
        payload.to >= state.length ||
        payload.from === payload.to
      ) {
        return state
      }

      const newArray = [...state]
      const [movedNode] = newArray.splice(payload.from, 1)
      newArray.splice(payload.to, 0, movedNode)

      return newArray
    }
    case NodesActionType.IMPORT:
      return normalizeNodeIds(payload)
    default:
      return state
  }
}
