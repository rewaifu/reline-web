import { z } from "zod"
import useSetState from "../../hooks/useSetState"
import { useContext, useState } from "react"
import { NodesContext, NodesDispatchContext } from "../../context/contexts"
import { NodeActionType, TilerType } from "~/types/enums.ts"
import { Label } from "../shared/label"
import { DEFAULT_MODEL, DEFAULT_TILE_SIZE, MODELS } from "~/constants"
import { Popover, PopoverContent, PopoverTrigger } from "../shared/popover"
import { Button } from "../shared/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../shared/command"
import { cn } from "~/lib/utils"
import { Input } from "../shared/input"
import { Checkbox } from "../shared/checkbox"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../shared/select"

const upscaleOptionsSchema = z.object({
  is_own_model: z.boolean(),
  model: z.string(),
  tiler: z.nativeEnum(TilerType),
  exact_tiler_size: z.number(),
  allow_cpu_upscale: z.boolean(),
})

type UpscaleNodeOptions = z.infer<typeof upscaleOptionsSchema>

function Combobox({ initialValue, onChange }: { initialValue: string; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(initialValue)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
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
              {Object.values(MODELS).map((model) => (
                <CommandItem
                  key={model}
                  value={model}
                  onSelect={() => {
                    setValue(model)
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
  const [state, setState] = useSetState(node.options as UpscaleNodeOptions)
  const dispatch = useContext(NodesDispatchContext)
  const changeValue = (newOptions: Partial<UpscaleNodeOptions>) => {
    if (newOptions.tiler !== TilerType.EXACT) {
      newOptions.exact_tiler_size = undefined;
    }
    setState(newOptions)
    dispatch({
      type: NodeActionType.CHANGE,
      payload: {
        ...node,
        options: {
          ...state,
          ...newOptions,
        },
      },
    })
  }
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label>Model</Label>
        {node.options.is_own_model ? (
          <Input
            placeholder="Path/to/model"
            value={state.model}
            onChange={(e) => {
              changeValue({ model: e.target.value })
            }}
          />
        ) : (
          <Combobox
            initialValue={state.model}
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
                tiler: value as TilerType,
              })
            }
          }}
          value={state.tiler}
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
      {state.tiler === TilerType.EXACT && (
        <div className="flex flex-col gap-2">
          <Label>Tile size</Label>
          <Input
            type="number"
            className="w-[180px]"
            step={100}
            value={state.exact_tiler_size}
            onChange={(e) => {
              changeValue({
                exact_tiler_size: Number.parseInt(e.target.value),
              })
            }}
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={state.is_own_model}
          onCheckedChange={(value) => {
            if (!value) {
              changeValue({ model: MODELS.includes(state.model) ? state.model : DEFAULT_MODEL, is_own_model: !!value })
            } else if (value) {
              changeValue({ model: "", is_own_model: !!value })
            }
          }}
        />
        <Label>own model</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={state.allow_cpu_upscale}
          onCheckedChange={(value) => {
            changeValue({ allow_cpu_upscale: !!value })
          }}
        />
        <Label>allow cpu upscale</Label>
      </div>
    </div>
  )
}
