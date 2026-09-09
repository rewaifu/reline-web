import { type Component, Show } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { useNodes } from "~/context/contexts";
import { NodeType } from "~/types/enums";
import { FolderReaderForm } from "./forms/folder-reader";
import { FolderWriterForm } from "./forms/folder-writer";
import { UpscaleForm } from "./forms/upscale";
import { SharpForm } from "./forms/sharp";
import { ResizeForm } from "./forms/resize";
import { ScreentoneForm } from "./forms/screentone";
import { LevelForm } from "./forms/level";
import { CvtColorForm } from "./forms/cvt-color";

export interface NodeFormProps {
  nodeId: number;
}

const FORMS: Record<NodeType, Component<NodeFormProps>> = {
  [NodeType.FOLDER_READER]: FolderReaderForm,
  [NodeType.FOLDER_WRITER]: FolderWriterForm,
  [NodeType.UPSCALE]: UpscaleForm,
  [NodeType.SHARP]: SharpForm,
  [NodeType.RESIZE]: ResizeForm,
  [NodeType.SCREENTONE]: ScreentoneForm,
  [NodeType.LEVEL]: LevelForm,
  [NodeType.CVT_COLOR]: CvtColorForm,
};

/** Routes the expanded node body to its hand-crafted per-type form. */
export const NodeOptionsForm: Component<NodeFormProps> = (props) => {
  const nodes = useNodes();
  const node = () => nodes.find((n) => n.id === props.nodeId);

  return (
    <Show when={node()}>
      {(node) => (
        <Dynamic component={FORMS[node().type]} nodeId={props.nodeId} />
      )}
    </Show>
  );
};
