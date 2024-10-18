import { useContext, useState } from "react"
import { ModelsContext, NodesContext, NodesDispatchContext } from "~/context/contexts"
import { DType, TilerType } from "~/types/enums"
import { Label } from "../ui/label"
import { DEFAULT_MODEL, DEFAULT_TILE_SIZE } from "~/constants"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"
import { cn } from "~/lib/utils"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import type { UpscaleNodeOptions } from "~/types/options"
import { NodesActionType } from "~/types/actions"

function Combobox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const models = useContext(ModelsContext)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" aria-role="combobox" aria-expanded={open} className="w-full justify-between">
          {value}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>Nothing was found.</CommandEmpty>
            <CommandGroup>
              {Object.values(models).map((model) => (
                <CommandItem
                  key={model}
                  value={model}
                  onSelect={() => {
                    onChange(model)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === model ? "opacity-100" : "opacity-0")} />
                  {model}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function UpscaleNodeBody({ id }: { id: number }) {
  const nodes = useContext(NodesContext)
  const node = nodes[id]
  const options = node.options as UpscaleNodeOptions
  const dispatch = useContext(NodesDispatchContext)
  const models = useContext(ModelsContext)
  const changeValue = (newOptions: Partial<UpscaleNodeOptions>) => {
    dispatch({
      type: NodesActionType.CHANGE,
      payload: {
        ...node,
        options: {
          ...node.options,
          ...newOptions,
        },
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>Model</Label>
        {options.is_own_model ? (
          <Input
            placeholder="Path/to/model"
            value={options.model}
            onChange={(e) => {
              changeValue({ model: e.target.value })
            }}
          />
        ) : (
          <Combobox
            value={options.model}
            onChange={(model) => {
              changeValue({
                model: model,
              })
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tiler</Label>
        <Select
          onValueChange={(value) => {
            if (value === TilerType.EXACT) {
              changeValue({
                exact_tiler_size: DEFAULT_TILE_SIZE,
                tiler: value as TilerType,
              })
            } else {
              changeValue({
                exact_tiler_size: undefined,
                tiler: value as TilerType,
              })
            }
          }}
          value={options.tiler}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.values(TilerType).map((type) => {
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

      {options.tiler === TilerType.EXACT && (
        <div className="flex flex-col gap-2">
          <Label>Tile size</Label>
          <Input
            type="number"
            className="w-[180px]"
            step={100}
            value={options.exact_tiler_size}
            onChange={(e) => {
              changeValue({
                exact_tiler_size: Number.parseInt(e.target.value),
              })
            }}
          />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label>DType</Label>
        <Select onValueChange={(value: DType) => changeValue({ dtype: value })} value={options.dtype}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {Object.values(DType).map((type) => {
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

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={options.is_own_model}
          onCheckedChange={(value) => {
            if (!value) {
              changeValue({ model: models.includes(options.model) ? options.model : DEFAULT_MODEL, is_own_model: value })
            } else if (value) {
              changeValue({ model: "", is_own_model: !!value })
            }
          }}
        />
        <Label>own model</Label>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          checked={options.allow_cpu_upscale}
          onCheckedChange={(value) => {
            changeValue({ allow_cpu_upscale: !!value })
          }}
        />
        <Label>allow cpu upscale</Label>
      </div>
    </div>
  )
}
