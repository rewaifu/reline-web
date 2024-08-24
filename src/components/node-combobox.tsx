"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/shared/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/shared/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shared/popover"
import { NodeActionType, NodeType } from "~/types/enums"
import { NodesDispatchContext } from "~/context/contexts"
import { DEFAULT_NODE_OPTIONS } from "~/constants"

export function NodeCombobox({ name, id }: { name: NodeType, id: number }) {
  const NodeTypes = Object.values(NodeType)
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState(name)
  const dispatch = React.useContext(NodesDispatchContext)
  const changeValue = (value: NodeType) => {
    setValue(value);
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        id,
        name: value,
        options: DEFAULT_NODE_OPTIONS[value]
      }
    })
  }

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
          <CommandInput placeholder="Search node..." />
          <CommandList>
            <CommandEmpty>No node found.</CommandEmpty>
            <CommandGroup>
              {NodeTypes.map((nodeType) => (
                <CommandItem
                  key={nodeType}
                  value={nodeType}
                  onSelect={(currentValue) => {
                    changeValue(currentValue as NodeType)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === nodeType ? "opacity-100" : "opacity-0")} />
                  {nodeType}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
