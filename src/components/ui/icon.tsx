import { For, type Component } from "solid-js";

/** Inline copies of Tabler (https://tabler.io/icons) outline paths —
 * 24×24 grid, stroke 2, round caps. Avoids a runtime icon dependency. */
const PATHS = {
  "drag-drop": [
    "M19 11v-2a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2",
    "M13 13l9 3-4 2-2 4-3-9",
    "M3 3l0 .01",
    "M7 3l0 .01",
    "M11 3l0 .01",
    "M15 3l0 .01",
    "M3 7l0 .01",
    "M3 11l0 .01",
    "M3 15l0 .01",
  ],
  "chevron-down": ["M6 9l6 6 6-6"],
  "chevron-up": ["M6 15l6-6 6 6"],
  "chevron-right": ["M9 6l6 6-6 6"],
  "chevron-left": ["M15 6l-6 6 6 6"],
  x: ["M18 6l-12 12", "M6 6l12 12"],
  plus: ["M12 5l0 14", "M5 12l14 0"],
  pencil: ["M4 20h4l10.5 -10.5a2.828 2.828 0 1 0 -4 -4l-10.5 10.5v4"],
  trash: [
    "M4 7h16",
    "M10 11v6",
    "M14 11v6",
    "M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12",
    "M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3",
  ],
  "arrow-down": ["M12 5l0 14", "M18 13l-6 6-6-6"],
  "arrow-back-up": ["M9 14l-4-4 4-4", "M5 10h11a4 4 0 1 1 0 8h-1"],
  copy: [
    "M8 8m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z",
    "M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2",
  ],
  check: ["M5 12l5 5L20 6"],
} as const;

export type IconName = keyof typeof PATHS;

export interface IconProps {
  name: IconName;
  size?: number;
}

export const Icon: Component<IconProps> = (props) => (
  <svg
    viewBox="0 0 24 24"
    width={props.size ?? 16}
    height={props.size ?? 16}
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <For each={PATHS[props.name]}>{(d) => <path d={d} />}</For>
  </svg>
);
