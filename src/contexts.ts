import { createContext, type Dispatch } from "react"
import type { StackNode } from "./types/node"
import type { NodesAction } from "./types/actions"

export const NodesContext = createContext<StackNode[]>([])
export const NodesDispatchContext = createContext<Dispatch<NodesAction>>(() => {})
