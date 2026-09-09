import { createContext, useContext } from "solid-js";
import type { Store } from "solid-js";
import type { StackNode } from "~/types/node";
import type { NodesAction } from "~/types/actions";

export type NodesStore = Store<StackNode[]>;
export type NodesDispatch = (action: NodesAction) => void;

// Default-less contexts: reading them without a Provider is a bug, not a
// maybe — see `useNodes`/`useNodesDispatch` below.
export const NodesContext = createContext<NodesStore>();
export const NodesDispatchContext = createContext<NodesDispatch>();

export const useNodes = (): NodesStore => {
  const nodes = useContext(NodesContext);
  if (!nodes) throw new Error("useNodes: missing <NodesContext> provider");
  return nodes;
};

export const useNodesDispatch = (): NodesDispatch => {
  const dispatch = useContext(NodesDispatchContext);
  if (!dispatch)
    throw new Error(
      "useNodesDispatch: missing <NodesDispatchContext> provider"
    );
  return dispatch;
};
