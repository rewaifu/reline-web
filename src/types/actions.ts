import type { StackNode } from "./node"

export enum NodesActionType {
  ADD = "ADD",
  DELETE = "DELETE",
  CHANGE = "CHANGE",
  MOVE = "MOVE",
}

export interface NodesAction {
  type: NodesActionType
  payload: StackNode
}
