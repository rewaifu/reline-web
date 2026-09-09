import { omit, type Component } from "solid-js";
import type { ComponentProps } from "@solidjs/web";
import styles from "./label.module.scss";

export type LabelProps = ComponentProps<"label">;

export const Label: Component<LabelProps> = (props) => {
  const rest = omit(props, "class");
  return <label class={[styles.label, props.class]} {...rest} />;
};
