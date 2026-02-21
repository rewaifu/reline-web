import {useContext} from "react"
import {NodesContext, NodesDispatchContext} from "~/context/contexts"
import {ResizeFilterType, ResizeType} from "~/types/enums"
import {Label} from "../ui/label"
import {DEFAULT_RESIZE_HEIGHT, DEFAULT_RESIZE_PERCENT, DEFAULT_RESIZE_WIDTH, DEFAULT_SPREAD_SIZE} from "~/constants"
import {Input} from "../ui/input"
import {Checkbox} from "../ui/checkbox"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "../ui/select"
import type {ResizeNodeOptions} from "~/types/options"
import {NodesActionType} from "~/types/actions"
import {Combobox} from "~/components/ui/combobox"

const renderSizeInput = (options: ResizeNodeOptions, changeValue: (newOptions: Partial<ResizeNodeOptions>) => void) => {
    return (
        <div className="flex flex-col gap-2">
            {(options.resize_type === ResizeType.BY_WIDTH || options.resize_type === ResizeType.ABSOLUTE) && (
                <div className="flex flex-col gap-2">
                    <Label>width</Label>
                    <Input
                        type="number"
                        className="w-[180px]"
                        step={1}
                        min={1}
                        value={options.width}
                        onChange={(e) => {
                            changeValue({width: Number.parseInt(e.target.value)})
                        }}
                    />
                </div>
            )}
            {(options.resize_type === ResizeType.BY_HEIGHT || options.resize_type === ResizeType.ABSOLUTE) && (
                <div className="flex flex-col gap-2">
                    <Label>height</Label>
                    <Input
                        type="number"
                        className="w-[180px]"
                        step={1}
                        min={1}
                        value={options.height}
                        onChange={(e) => {
                            changeValue({height: Number.parseInt(e.target.value)})
                        }}
                    />
                </div>
            )}
            {options.resize_type === ResizeType.PERCENT && (
                <div className="flex flex-col gap-2">
                    <Label>percent</Label>
                    <Input
                        type="number"
                        className="w-[180px]"
                        step={0.1}
                        min={0}
                        value={options.percent}
                        onChange={(e) => {
                            changeValue({percent: Number.parseFloat(e.target.value)})
                        }}
                    />
                </div>
            )}
        </div>
    )
}

export function ResizeNodeBody({id}: { id: number }) {
    const nodes = useContext(NodesContext)
    const node = nodes[id]
    const options = node.options as ResizeNodeOptions
    const dispatch = useContext(NodesDispatchContext)
    const filterOptions = Object.values(ResizeFilterType).map((type) => ({
        value: type,
        label: type,
    }))
    const changeValue = (newOptions: Partial<ResizeNodeOptions>) => {
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
                <Label>Filter</Label>

                <Combobox
                    value={options.filter}
                    onChange={(value) =>
                        changeValue({filter: value as ResizeFilterType})
                    }
                    options={filterOptions}
                    className="w-[180px]"
                />
            </div>
            <div className="flex flex-col gap-2">
                <Label>Resize Type</Label>
                <Select
                    onValueChange={(value) => {
                        changeValue({
                            width:
                                (value as ResizeType) === ResizeType.BY_WIDTH || (value as ResizeType) === ResizeType.ABSOLUTE
                                    ? options.width
                                        ? options.width
                                        : DEFAULT_RESIZE_WIDTH
                                    : undefined,
                            height:
                                (value as ResizeType) === ResizeType.BY_HEIGHT || (value as ResizeType) === ResizeType.ABSOLUTE
                                    ? options.height
                                        ? options.height
                                        : DEFAULT_RESIZE_HEIGHT
                                    : undefined,
                            percent: (value as ResizeType) === ResizeType.PERCENT ? (options.percent ? options.percent : DEFAULT_RESIZE_PERCENT) : undefined,
                            resize_type: value as ResizeType,
                        })
                    }}
                    value={options.resize_type}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Object.values(ResizeType).map((type) => {
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
            {renderSizeInput(options, changeValue)}
            <div className="flex items-center space-x-2">
                <Checkbox
                    checked={options.spread}
                    onCheckedChange={(value) => {
                        changeValue({
                            spread: !!value,
                            spread_size: value ? DEFAULT_SPREAD_SIZE : undefined,
                        })
                    }}
                />
                <Label>spread</Label>
            </div>
            {options.spread && (
                <div className="flex flex-col gap-2">
                    <Label>Spread size</Label>
                    <Input
                        className="w-[180px]"
                        value={options.spread_size}
                        onChange={(e) => {
                            changeValue({spread_size: Number.parseInt(e.target.value)})
                        }}
                    />
                </div>
            )}
            <div className="flex items-center space-x-2">
                <Checkbox
                    checked={options.gamma_correction}
                    onCheckedChange={(value) => {
                        changeValue({
                            gamma_correction: !!value,
                        })
                    }}
                />
                <Label>gamma correction</Label>
            </div>
        </div>
    )
}
