import { createContext, type Dispatch } from "react"
import type { NodesAction, StackNode } from "~/types/node"

export const NodesContext = createContext<StackNode[]>([])
export const NodesDispatchContext = createContext<Dispatch<NodesAction>>(() => {})
