import { ArrowUp, ArrowDown, X, ChevronDown, ChevronRight, ChevronsUpDown, Check } from "lucide-react"
import { type FC, useContext, useState } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { NodeActionType, NodeType } from "~/types/enums"
import { Button } from "./ui/button"
import { Card, CardHeader, CardContent } from "./ui/card"
import { DEFAULT_NODE_OPTIONS } from "~/constants"
import { CvtColorNodeBody, FolderReaderNodeBody, FolderWriterNodeBody, LevelNodeBody, SharpNodeBody } from "./nodes"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"
import { UpscaleNodeBody } from "./nodes/upscale-node"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./ui/command"
import { cn } from "~/lib/utils"
import { ResizeNodeBody } from "./nodes/resize-node"

const nodeBodyComponents: { [key in NodeType]: FC<{ id: number }> } = {
  level: LevelNodeBody as FC<{ id: number }>,
  folder_reader: FolderReaderNodeBody as FC<{ id: number }>,
  folder_writer: FolderWriterNodeBody as FC<{ id: number }>,
  cvt_color: CvtColorNodeBody as FC<{ id: number }>,
  sharp: SharpNodeBody as FC<{ id: number }>,
  upscale: UpscaleNodeBody as FC<{ id: number }>,
  resize: ResizeNodeBody as FC<{ id: number }>,
}

function Combobox({ allValues, initialValue, onChange }: { allValues: string[]; initialValue: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialValue)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>Nothing was found.</CommandEmpty>
            <CommandGroup>
              {allValues.map((_value) => (
                <CommandItem
                  key={_value}
                  value={_value}
                  onSelect={(currentValue) => {
                    setValue(currentValue)
                    onChange(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === _value ? "opacity-100" : "opacity-0")} />
                  {_value}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function NodeResolver({ id }: { id: number }) {
  const nodes = useContext(NodesContext)
  const data = nodes[id]
  const [isCollapsed, setIsCollapsed] = useState(data.collapsed)
  const NodeBodyComponent = nodeBodyComponents[data.name]
  const dispatch = useContext(NodesDispatchContext)
  const onTypeChange = (value: string) => {
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        id: data.id,
        name: value as NodeType,
        collapsed: data.collapsed,
        options: DEFAULT_NODE_OPTIONS[value as NodeType],
      },
    })
  }
  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={(isOpen) => {
        setIsCollapsed(!isOpen)
        dispatch({
          type: NodeActionType.CHANGE,
          payload: {
            ...data,
            collapsed: !isOpen,
          },
        })
      }}
    >
      <Card>
        <CardHeader className="flex flex-row">
          <Combobox initialValue={data.name} allValues={Object.values(NodeType)} onChange={onTypeChange} />
          <CollapsibleTrigger asChild>
            <Button className="ml-3" variant="ghost" size="icon">
              {isCollapsed ? <ChevronRight /> : <ChevronDown />}
            </Button>
          </CollapsibleTrigger>
          <Button
            variant="ghost"
            size="icon"
            disabled={data.id === 0}
            className="ml-auto"
            onClick={() => {
              dispatch({
                type: NodeActionType.MOVEUP,
                payload: data,
              })
            }}
          >
            <ArrowUp />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            disabled={data.id === nodes.length - 1}
            onClick={() => {
              dispatch({
                type: NodeActionType.MOVEDOWN,
                payload: data,
              })
            }}
          >
            <ArrowDown />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              dispatch({
                type: NodeActionType.DELETE,
                payload: data,
              })
            }}
          >
            <X />
          </Button>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <Card>
              <CardContent className="pt-6">
                <NodeBodyComponent id={id} />
              </CardContent>
            </Card>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
