import { omit, type Component } from "solid-js"
import type { ComponentProps } from "@solidjs/web"
import styles from "./input.module.scss"

export type InputProps = ComponentProps<"input">

export const Input: Component<InputProps> = (props) => {
  const rest = omit(props, "class")
  return <input class={[styles.input, props.class]} {...rest} />
}
