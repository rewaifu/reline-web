import { omit, type Component, createEffect, createSignal } from "solid-js";
import { Select } from "@kobalte/core/select";
import { Icon } from "../icon";
import styles from "./select.module.scss";

export interface UiSelectProps {
  value: string | null;
  onChange: (value: string) => void;
  items: readonly string[];
  placeholder?: string;
  /** Accessible name for the trigger — use when the visible label lives outside. */
  ariaLabel?: string;
  /** Set to link an external <label for> to this trigger. */
  id?: string;
  class?: string;
}

export const UiSelect: Component<UiSelectProps> = (props) => {
  const rest = omit(
    props,
    "onChange",
    "value",
    "items",
    "placeholder",
    "ariaLabel",
    "id",
    "class"
  );
  const [open, setOpen] = createSignal(false);
  let rootEl: HTMLDivElement | undefined;
  let contentEl: HTMLDivElement | undefined;

  // Kobalte's dismissable layer does not close the listbox on outside
  // interaction under solid 2 rc — close it ourselves: any pointer down
  // that lands outside the trigger block and the portaled listbox.
  createEffect(
    () => open(),
    (isOpen) => {
      if (!isOpen) return;

      const onPointerDown = (e: PointerEvent) => {
        const target = e.target;
        if (
          target instanceof Node &&
          (rootEl?.contains(target) || contentEl?.contains(target))
        )
          return;
        setOpen(false);
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setOpen(false);
      };

      document.addEventListener("pointerdown", onPointerDown, true);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        document.removeEventListener("pointerdown", onPointerDown, true);
        document.removeEventListener("keydown", onKeyDown);
      };
    }
  );

  return (
    <Select
      open={open()}
      onOpenChange={setOpen}
      value={props.value}
      onChange={(value) => value !== null && props.onChange(value)}
      options={props.items as string[]}
      placeholder={props.placeholder ?? "Select…"}
      itemComponent={(item) => (
        <Select.Item item={item.item} class={styles.item}>
          {item.item.rawValue}
        </Select.Item>
      )}
      gutter={4}
      placement="bottom-start"
      {...rest}
    >
      <div ref={rootEl} style={{ display: "contents" }}>
        <Select.Trigger
          id={props.id}
          class={[styles.trigger, props.class]}
          aria-label={props.ariaLabel}
        >
          <Select.Value class={styles.value}>
            {(state) =>
              String(state.selectedOption() ?? props.placeholder ?? "")
            }
          </Select.Value>
          <Select.Icon class={styles.icon} aria-hidden="true">
            <Icon name="chevron-down" size={14} />
          </Select.Icon>
        </Select.Trigger>
      </div>
      <Select.Portal>
        <Select.Content ref={contentEl} class={styles.content}>
          <Select.Listbox class={styles.listbox} />
        </Select.Content>
      </Select.Portal>
    </Select>
  );
};
