import { type Component, createMemo } from "solid-js";
import { NODE_DEFS, NODE_ORDER } from "~/components/nodes/registry";
import { UiCombobox } from "~/components/ui";
import styles from "./nodes-list.module.scss";

export interface AddNodeMenuProps {
  onAdd: (label: string) => void;
}

/** Searchable add-node field: type to filter the node registry, Enter or
 * click adds the highlighted node. */
export const AddNodeMenu: Component<AddNodeMenuProps> = (props) => {
  const items = createMemo(() =>
    NODE_ORDER.map((type) => NODE_DEFS[type].label)
  );

  return (
    <div class={styles.addNode}>
      <UiCombobox
        class={styles.addCombo}
        value=""
        placeholder="Add node"
        ariaLabel="Add node"
        items={items()}
        placement="top-start"
        onChange={(label) => items().includes(label) && props.onAdd(label)}
        onEnterMatch={(label) => props.onAdd(label)}
      />
    </div>
  );
};
