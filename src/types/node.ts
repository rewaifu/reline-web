import type { NodeActionType, NodeType } from "./enums"

export interface StackNode {
  id: number
  name: NodeType
  options: GenericNodeOptions
}

export interface GenericNodeOptions {
  [key: string]: string | number | boolean | undefined
}

export interface NodesAction {
  type: NodeActionType
  payload: StackNode
}