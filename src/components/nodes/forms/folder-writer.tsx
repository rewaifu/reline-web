import { type Component } from "solid-js"
import { WriterNodeFormat } from "~/types/enums"
import { useNodeForm, TextRow, SelectRow } from "./shared"
import type { FolderWriterNodeOptions } from "~/types/options"
import styles from "./forms.module.scss"

type FormProps = { nodeId: number }

export const FolderWriterForm: Component<FormProps> = (props) => {
  const form = useNodeForm(() => props.nodeId)
  const options = () => form.options() as FolderWriterNodeOptions
  return (
    <div class={styles.form}>
      <TextRow
        label="Path to folder"
        placeholder="/content/drive/MyDrive/output"
        value={options().path}
        onInput={(path) => form.set({ path })}
      />
      <SelectRow
        label="Format"
        value={options().format}
        items={[WriterNodeFormat.PNG, WriterNodeFormat.JPEG]}
        onChange={(format) => form.set({ format: format as WriterNodeFormat })}
      />
    </div>
  )
}
