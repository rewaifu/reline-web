import {
  type Component,
  For,
  Match,
  Show,
  Switch,
  createSignal,
} from "solid-js";
import { MIN_RIGHT_WIDTH, MIN_SIDE_WIDTH } from "~/constants";
import { NodesList } from "~/components/nodes-list/nodes-list";
import { NodeCards } from "~/components/node-card/node-card";
import { ConfigPanel } from "~/components/config-panel/config-panel";
import {
  COLUMN_KEYS,
  createColumnsLayout,
  type ColumnKey,
  type ResizableSide,
} from "~/hooks/use-columns-layout";
import styles from "./workspace.module.scss";

const COLUMN_LABELS: Record<ColumnKey, string> = {
  left: "Узлы",
  middle: "Стек",
  right: "Настройки",
};

const Workspace: Component = () => {
  const [selectedId, setSelectedId] = createSignal<number | null>(null);
  const {
    layout,
    resizing,
    visibleColumns,
    toggleHidden,
    startResize,
    moveResize,
    endResize,
    nudge,
    resetWidth,
  } = createColumnsLayout();

  const columns = visibleColumns;
  const hidden = (key: ColumnKey) => layout().hidden[key];
  const sole = () => columns().length === 1;
  /** Column that eats the remaining space: the stack, or the last one when it is hidden. */
  const flexKey = () =>
    hidden("middle") ? columns()[columns().length - 1]! : "middle";
  /** The divider left of `key` resizes the stack's neighbour — right column, or left when the stack is hidden. */
  const neighbourOf = (key: ColumnKey): ColumnKey =>
    key === "right" && !hidden("middle") ? "middle" : "left";
  const sideOf = (key: ColumnKey): ResizableSide =>
    neighbourOf(key) === "middle" ? "right" : "left";
  /** Columns are kept mounted (only hidden) — unmounting Kobalte tabs halts Solid's reactive graph. */
  const splitterActive = (key: ColumnKey) =>
    !hidden(key) && columns().indexOf(key) > 0;

  return (
    <div class={styles.workspace}>
      <header class={styles.topbar}>
        <span class={styles.logo}>Reline</span>
        <div class={styles.viewToggles} role="group" aria-label="Панели">
          <For each={["left", "middle", "right"] as ColumnKey[]}>
            {(key) => (
              <button
                type="button"
                class={styles.toggle}
                aria-pressed={!layout().hidden[key] ? "true" : "false"}
                disabled={!layout().hidden[key] && sole()}
                onClick={() => toggleHidden(key)}
              >
                {COLUMN_LABELS[key]}
              </button>
            )}
          </For>
        </div>
      </header>

      <div class={[styles.columns, resizing() && styles.resizing]}>
        <For each={COLUMN_KEYS}>
          {(key, index) => (
            <>
              <Show when={index() > 0}>
                <div
                  class={[
                    styles.splitter,
                    !splitterActive(key) && styles.hidden,
                  ]}
                  role="separator"
                  aria-orientation="vertical"
                  aria-label={`Изменить ширину: ${
                    COLUMN_LABELS[neighbourOf(key)]
                  }`}
                  tabindex="0"
                  onPointerDown={(e) => startResize(sideOf(key), e)}
                  onPointerMove={moveResize}
                  onPointerUp={endResize}
                  onLostPointerCapture={endResize}
                  onDblClick={() => resetWidth(sideOf(key))}
                  onKeyDown={(e) => {
                    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                    e.preventDefault();
                    nudge(sideOf(key), e.key === "ArrowRight" ? 1 : -1);
                  }}
                />
              </Show>
              <div
                class={[
                  styles.column,
                  hidden(key) && styles.hidden,
                  key === flexKey() && styles.flex,
                ]}
                style={
                  key === "middle"
                    ? undefined
                    : {
                        "--col-width": `${layout()[key]}px`,
                        "--col-min-width": `${
                          key === "right" ? MIN_RIGHT_WIDTH : MIN_SIDE_WIDTH
                        }px`,
                      }
                }
              >
                <Switch>
                  <Match when={key === "left"}>
                    <NodesList
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  </Match>
                  <Match when={key === "middle"}>
                    <NodeCards
                      selectedId={selectedId}
                      onSelect={setSelectedId}
                    />
                  </Match>
                  <Match when={key === "right"}>
                    <ConfigPanel selectedId={selectedId} />
                  </Match>
                </Switch>
              </div>
            </>
          )}
        </For>
      </div>
    </div>
  );
};

export { Workspace };
