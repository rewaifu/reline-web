import type { StackNode } from "~/types/node";

/**
 * Stable per-node identity for FLIP reorder animations: `id` is reindexed to
 * array positions on MOVE/DELETE, so it cannot match a DOM element to its
 * pre-move position. `uid` never changes. Missing uids are filled in for
 * nodes loaded from storage or imported from serialized configs.
 */
export const newUid = (): string => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto)
    return crypto.randomUUID();
  return `uid-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

export const ensureUids = (list: StackNode[]): StackNode[] =>
  list.map((node) => (node.uid ? node : { ...node, uid: newUid() }));
