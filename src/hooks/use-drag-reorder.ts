import { createSignal, type Accessor } from "solid-js";

export interface DragHandlers {
  draggable: "true";
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
}

export interface ContainerDragHandlers {
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
}

export interface DragReorder {
  dragIndex: Accessor<number | null>;
  /** insertion position (0..n) — placeholder is rendered before item at this index */
  dropIndex: Accessor<number | null>;
  handlers: (index: number) => DragHandlers;
  /** spread on the scroll/list container so drops between items still land */
  containerHandlers: () => ContainerDragHandlers;
}

const isFormTarget = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  target.closest("input, textarea, select, button, [contenteditable]");

/**
 * HTML5 drag reorder. onMove receives (from, to) where `to` is the final
 * index after removal — matches MOVE reducer splice semantics.
 * Dragging is cancelled when started on form controls (native text drag
 * hijacks the gesture); insertion point is computed on the container so
 * gaps between items are valid drop zones.
 */
export const createDragReorder = (
  onMove: (from: number, to: number) => void
): DragReorder => {
  const [dragIndex, setDragIndex] = createSignal<number | null>(null);
  const [dropIndex, setDropIndex] = createSignal<number | null>(null);

  const reset = () => {
    setDragIndex(null);
    setDropIndex(null);
  };

  /** insertion index from a Y coordinate over the draggable items of `container` */
  const insertionIndex = (container: HTMLElement, clientY: number): number => {
    const items = Array.from(
      container.querySelectorAll<HTMLElement>("[draggable='true']")
    );
    for (let i = 0; i < items.length; i++) {
      const rect = items[i]!.getBoundingClientRect();
      if (clientY < rect.top + rect.height / 2) return i;
    }
    return items.length;
  };

  const handlers = (index: number): DragHandlers => ({
    draggable: "true" as const,
    onDragStart: (e: DragEvent) => {
      if (isFormTarget(e.target)) {
        e.preventDefault();
        return;
      }
      setDragIndex(index);
      setDropIndex(null);
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = "move";
      }
    },
    onDragEnd: reset,
  });
  const applyDrop = (drop: number | null) => {
    const from = dragIndex();
    reset();
    if (from === null || drop === null) return;
    const to = drop > from ? drop - 1 : drop;
    if (to !== from) onMove(from, to);
  };

  const containerHandlers = (): ContainerDragHandlers => ({
    onDragOver: (e: DragEvent) => {
      if (dragIndex() === null) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
      const next = insertionIndex(e.currentTarget as HTMLElement, e.clientY);
      if (next !== dragIndex() && next !== dragIndex()! + 1) setDropIndex(next);
      else setDropIndex(null);
    },
    onDrop: (e: DragEvent) => {
      if (dragIndex() === null) return;
      e.preventDefault();
      e.stopPropagation();
      const drop = insertionIndex(e.currentTarget as HTMLElement, e.clientY);
      applyDrop(drop);
    },
  });

  return { dragIndex, dropIndex, handlers, containerHandlers };
};
