import { type Component, createEffect, createStore, snapshot } from "solid-js"
import { NodeType } from "~/types/enums"
import { ensureUids } from "~/lib/uid"
import { STORAGE_KEY, DEFAULT_NODES } from "~/constants"
import type { StackNode } from "~/types/node"
import { createNodesDispatch } from "~/context/reducer"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { Workspace } from "~/routes/workspace/workspace"
import "~/styles/global.scss"

const loadNodes = (): StackNode[] => {
  const known = new Set<string>(Object.values(NodeType))
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      // drop node types this build no longer knows (e.g. removed experiments)
      const parsed = (JSON.parse(raw) as StackNode[]).filter((n) => known.has(n.type))
      return ensureUids(parsed)
    }
  } catch {
    // corrupted storage — fall through to defaults
  }
  return ensureUids(structuredClone(DEFAULT_NODES))
}

const App: Component = () => {
  const [nodes, setNodes] = createStore<StackNode[]>(loadNodes())
  const dispatch = createNodesDispatch(setNodes)

  // Single write path for persistence: any store change lands in localStorage.
  // The compute must read through the store proxy: `snapshot()` is untracked,
  // so wrapping it here would only persist the initial state.
  createEffect(
    () => JSON.stringify(nodes),
    (json) => {
      try {
        localStorage.setItem(STORAGE_KEY, json)
      } catch {
        // storage full or unavailable — keep the app usable
      }
    },
  )

  return (
    <NodesContext value={nodes}>
      <NodesDispatchContext value={dispatch}>
        <main>
          <Workspace />
        </main>
      </NodesDispatchContext>
    </NodesContext>
  )
}

export default App
