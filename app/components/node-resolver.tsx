import {IconArrowUp, IconArrowDown, IconX, IconChevronDown, IconChevronRight, IconSelector, IconCheck, IconGripVertical} from "@tabler/icons-react"
import {type FC, useContext, useState} from "react"
import {NodesContext, NodesDispatchContext} from "~/context/contexts"
import {NodeType} from "~/types/enums"
import {DEFAULT_NODE_OPTIONS, NODE_ICONS} from "~/constants"
import {CvtColorNodeBody, FolderReaderNodeBody, FolderWriterNodeBody, LevelNodeBody, SharpNodeBody} from "./nodes"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
    Button,
    Card,
    CardHeader,
    CardContent
} from "~/components/ui"
import {UpscaleNodeBody} from "~/components/nodes"
import {Popover, PopoverContent, PopoverTrigger} from "./ui/popover"
import {Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList} from "./ui/command"
import {cn} from "~/lib/utils"
import {ResizeNodeBody} from "./nodes/resize-node"
import {ScreentoneNodeBody} from "./nodes/screentone-node"
import {NodesActionType} from "~/types/actions"
import {useSortable} from "@dnd-kit/react/sortable";

const nodeBodyComponents: { [key in NodeType]: FC<{ id: number }> } = {
    level: LevelNodeBody as FC<{ id: number }>,
    folder_reader: FolderReaderNodeBody as FC<{ id: number }>,
    folder_writer: FolderWriterNodeBody as FC<{ id: number }>,
    cvt_color: CvtColorNodeBody as FC<{ id: number }>,
    sharp: SharpNodeBody as FC<{ id: number }>,
    upscale: UpscaleNodeBody as FC<{ id: number }>,
    resize: ResizeNodeBody as FC<{ id: number }>,
    screentone: ScreentoneNodeBody as FC<{ id: number }>,
}

function Combobox({allValues, initialValue, onChange}: {
    allValues: string[];
    initialValue: string;
    onChange: (value: string) => void
}) {
    const [open, setOpen] = useState(false)
    const SelectedIcon = NODE_ICONS[initialValue as NodeType];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={
                <Button variant="outline" aria-role="combobox" aria-expanded={open}
                        className="w-[170px] md:w-[200px] justify-between">
                    <div className="flex items-center gap-2">
                        {SelectedIcon && <SelectedIcon size={18} className="text-muted-foreground dark:text-primary" />}
                        <span className="capitalize">{initialValue.replace('_', ' ')}</span>
                    </div>
                    <IconSelector className="ml-2 h-6 w-6 shrink-0 opacity-50"/>
                </Button>
            } />
            <PopoverContent className="w-[170px] md:w-[200px] p-0">
                <Command>
                    <CommandList>
                        <CommandEmpty>Nothing was found.</CommandEmpty>
                        <CommandGroup>
                            {allValues.map((_value) => {
                                const ItemIcon = NODE_ICONS[_value as NodeType];
                                return (
                                    <CommandItem
                                        key={_value}
                                        value={_value}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue)
                                            setOpen(false)
                                        }}
                                        className="flex items-center gap-2 justify-between"
                                    >
                                        <div className="flex flex-row gap-2 items-center">
                                            {ItemIcon && <ItemIcon size={18} className="text-muted-foreground dark:text-primary" />}
                                            <span className="capitalize">{_value.replace('_', ' ')}</span>
                                        </div>
                                        <IconCheck className={cn("h-4 w-4", initialValue === _value ? "opacity-100" : "opacity-0")}/>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}

export function NodeResolver({id, index}: { id: number; index: number }) {
    const nodes = useContext(NodesContext)
    const data = nodes.find((node) => node.id === id)
    const dispatch = useContext(NodesDispatchContext)
    if (!data) {
        return null
    }

    const NodeBodyComponent = nodeBodyComponents[data.type]
    const {ref, handleRef, isDragSource} = useSortable({
        id: `node-${data.id}`,
        data: {
            nodeId: data.id,
        },
        index,
        group: "nodes",
        feedback: "default",
    })
    const onTypeChange = (value: string) => {
        dispatch({
            type: NodesActionType.CHANGE,
            payload: {
                id: data.id,
                type: value as NodeType,
                collapsed: data.collapsed,
                options: DEFAULT_NODE_OPTIONS[value as NodeType],
            },
        })
    }
    return (
        <div
            ref={ref}
            className={cn(
                "transition-opacity",
                isDragSource && "opacity-70"
            )}
        >
            <Collapsible
                open={!data.collapsed}
                onOpenChange={(isOpen) => {
                    dispatch({
                        type: NodesActionType.CHANGE,
                        payload: {
                            ...data,
                            collapsed: !isOpen,
                        },
                    })
                }}
            >
                <Card className="rounded-xl">
                    <CardHeader className="flex flex-row px-2 md:px-4">
                        <Button
                            ref={handleRef}
                            className="mr-0 md:mr-1 cursor-grab active:cursor-grabbing"
                            variant="ghost"
                            size="icon"
                            aria-label="Drag node"
                            style={{ touchAction: 'none' }}
                        >
                            <IconGripVertical/>
                        </Button>
                        <Combobox initialValue={data.type} allValues={Object.values(NodeType)} onChange={onTypeChange}/>
                        <CollapsibleTrigger render={
                            <Button className="ml-0 md:ml-1" variant="ghost" size="icon">
                                {data.collapsed ? <IconChevronRight/> : <IconChevronDown/>}
                            </Button>
                        } />
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            className="ml-auto hidden md:flex"
                            onClick={() => {
                                dispatch({
                                    type: NodesActionType.MOVE,
                                    payload: {
                                        from: index,
                                        to: index - 1,
                                    },
                                })
                            }}
                        >
                            <IconArrowUp/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden md:flex"
                            disabled={index === nodes.length - 1}
                            onClick={() => {
                                dispatch({
                                    type: NodesActionType.MOVE,
                                    payload: {
                                        from: index,
                                        to: index + 1,
                                    },
                                })
                            }}
                        >
                            <IconArrowDown/>
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto md:ml-0"
                            onClick={() => {
                                dispatch({
                                    type: NodesActionType.DELETE,
                                    payload: data.id,
                                })
                            }}
                        >
                            <IconX/>
                        </Button>
                    </CardHeader>
                    <CollapsibleContent>
                        <CardContent className="px-3 md:px-4">
                            <Card>
                                <CardContent className="px-5">
                                    <NodeBodyComponent id={id}/>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>
        </div>
    )
}
