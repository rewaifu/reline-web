import { useContext } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts.ts"
import { WriterNodeFormat } from "~/types/enums.ts"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import type { FolderWriterNodeOptions } from "~/types/options"
import { NodesActionType } from "~/types/actions.ts"
import {useTranslation} from "react-i18next"

export function FolderWriterNodeBody({ id }: { id: number }) {
  const {t} = useTranslation()
  const nodes = useContext(NodesContext)
  const node = nodes.find((item) => item.id === id)
  if (!node) {
    return null
  }
  const options = node.options as FolderWriterNodeOptions
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<FolderWriterNodeOptions>) => {
    dispatch({
      type: NodesActionType.CHANGE,
      payload: {
        ...node,
        options: {
          ...options,
          ...newOptions,
        },
      },
    })
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col space-y-2">
        <Label>{t('nodes.folder-writer.path')}</Label>
        <Input
          placeholder={t('nodes.folder-writer.placeholder')}
          value={options.path}
          onChange={(e) => {
            changeValue({ path: e.target.value })
          }}
        />
      </div>
      <div className="flex flex-col space-y-2">
        <Label>t('nodes.folder-writer.format'</Label>
        <Select
          onValueChange={(value) => {
            changeValue({
              format: value as WriterNodeFormat,
            })
          }}
          value={options.format}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.values(WriterNodeFormat).map((type) => {
                return (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                )
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
