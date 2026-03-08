import {useContext, useEffect} from "react"
import {NodesContext, NodesDispatchContext} from "~/context/contexts.ts"
import {Label} from "../ui/label"
import {Input} from "../ui/input"
import type {ScreentoneNodeOptions} from "~/types/options"
import {NodesActionType} from "~/types/actions.ts"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "~/components/ui/select.tsx"
import {DotType, HalftoneMode, FilterType} from "~/types/enums.ts"
import {NumberInput} from "~/components/ui/number-input.tsx"
import {DEFAULT_HALFTONE_SSAA_FILTER} from "~/constants";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "~/components/ui/combobox"
import {Checkbox} from "~/components/ui";
import {useTranslation} from "react-i18next"
import {Separator} from "~/components/ui/separator.tsx";

export function ScreentoneNodeBody({id}: { id: number }) {
    const {t} = useTranslation()
    const nodes = useContext(NodesContext)
    const node = nodes.find((item) => item.id === id)
    if (!node) {
        return null
    }
    const options = node.options as ScreentoneNodeOptions
    useEffect(() => {
        const needsPatch =
            options.ssaa_filter === undefined

        if (needsPatch) {
            changeValue({
                ssaa_filter: options.ssaa_filter ?? DEFAULT_HALFTONE_SSAA_FILTER,
            })
        }
    }, [])
    const dispatch = useContext(NodesDispatchContext)
    const changeValue = (newOptions: Partial<ScreentoneNodeOptions>) => {
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

    const mode = options.halftone_mode
    const channelCount = mode === "cmyk" ? 4 : mode === "rgb" ? 3 : 1

    const ensureArray = <T, >(value: T | T[], length: number, fallback: T): T[] => {
        if (Array.isArray(value)) return value.length === length ? value : Array(length).fill(fallback)
        return Array(length).fill(value)
    }

    const getAutoDot = (dot: number): number | null => {
        if (!options.ssaa_scale || options.ssaa_scale <= 1) return null
        if (options.disable_auto_dot === true) return null
        return Number((dot * options.ssaa_scale).toFixed(2))
    }

    const dotSizes = ensureArray(options.dot_size, channelCount, 6)
    const angles = ensureArray(options.angle, channelCount, 45)
    const dotTypes = ensureArray(options.dot_type, channelCount, DotType.CIRCLE)

    const updateArrayField = <T, >(
        key: keyof ScreentoneNodeOptions,
        index: number,
        value: T
    ) => {
        const current = ensureArray(options[key] as T | T[], channelCount, value)
        const updated = [...current]
        updated[index] = value
        changeValue({[key]: updated} as any)
    }

    const renderDotOptionsArray = () => {
        return [...Array(channelCount)].map((_, i) => (
            <div key={i} className="border rounded-xl p-4 flex flex-col gap-4">
                <Label className="self-center font-normal">{t('nodes.screentone.channel')} {i + 1}</Label>
                <Separator />
                <div className="flex flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-2">
                        <Label>{t('nodes.screentone.dot-type')}</Label>
                        <Select
                            onValueChange={(value) => updateArrayField("dot_type", i, value as DotType)}
                            value={dotTypes[i]}
                        >
                            <SelectTrigger className="w-full min-w-[180px]">
                                <SelectValue/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {Object.values(DotType).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex-1">
                        <div className="translate-y-2">
                            <NumberInput
                                min={0}
                                max={360}
                                step={1}
                                labelText={t('nodes.screentone.angle')}
                                value={angles[i]}
                                onChange={(value) => updateArrayField("angle", i, Math.trunc(value))}
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-2">
                        <Label>{t('nodes.screentone.dot-size')}</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                className="min-w-[100px]"
                                step={1}
                                min={0}
                                value={dotSizes[i]}
                                onChange={(e) => updateArrayField("dot_size", i, parseInt(e.target.value))}
                            />
                            {getAutoDot(dotSizes[i]) !== null && (
                                <span className="text-sm text-muted-foreground">~{getAutoDot(dotSizes[i])}</span>
                            )}
                        </div>
                    </div>
                </div>


            </div>
        ))
    }
    const filterOptions = Object.values(FilterType)

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <Label>{t('nodes.screentone.halftone-mode')}</Label>
                <Select
                    onValueChange={(value) => {
                        const newMode = value as HalftoneMode
                        let newOptions: Partial<ScreentoneNodeOptions>

                        if (newMode === "rgb" || newMode === "cmyk") {
                            const channels = newMode === "cmyk" ? 4 : 3
                            const prevDotTypes = Array.isArray(options.dot_type)
                                ? options.dot_type
                                : [options.dot_type]

                            newOptions = {
                                halftone_mode: newMode,
                                dot_size: Array(channels).fill(7),
                                angle: Array(channels).fill(0),
                                dot_type: Array.from({ length: channels }, (_, i) =>
                                    prevDotTypes[i] ?? DotType.CIRCLE
                                ),
                            }
                        } else {
                            newOptions = {
                                halftone_mode: newMode,
                                dot_size: 7,
                                angle: 0,
                                dot_type: DotType.CIRCLE,
                            }
                        }

                        changeValue(newOptions)
                    }}
                    value={options.halftone_mode}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Object.values(HalftoneMode).map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <Separator/>

            {(mode === "rgb" || mode === "cmyk") ? (
                renderDotOptionsArray()
            ) : (
                <div className="flex flex-row gap-4 w-full items-center">
                    <div className="flex-1">
                        <div className="flex flex-col gap-2">
                            <Label>{t('nodes.screentone.dot-type')}</Label>
                            <Select
                                onValueChange={(value) => {
                                    changeValue({
                                        dot_type: value as DotType,
                                    })
                                }}
                                value={options.dot_type as DotType}
                            >
                                <SelectTrigger className="min-w-[180px] w-full">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {Object.values(DotType).map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="-mb-2">
                            <NumberInput
                                min={0}
                                max={360}
                                step={1}
                                labelText={t('nodes.screentone.angle')}
                                value={options.angle as number}
                                onChange={(value) => {
                                    changeValue({angle: Math.trunc(value)})
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-col gap-2">
                            <Label>{t('nodes.screentone.dot-size')}</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    className="min-w-[100px]"
                                    step="1"
                                    min="0"
                                    value={options.dot_size as number}
                                    onChange={(e) => {
                                        changeValue({
                                            dot_size: Number.parseInt(e.target.value),
                                        })
                                    }}
                                />
                                {getAutoDot(options.dot_size as number) !== null && (
                                    <span className="text-sm text-muted-foreground text-right">~{getAutoDot(options.dot_size as number)}

                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            )}
            <Separator/>
            <div className="flex flex-row gap-4">
                <div className="w-[180px]">
                    <div className="flex flex-col gap-2">
                        <Label>{t('nodes.screentone.ssaa-scale')}</Label>
                        <Input
                            type="number"
                            className="min-w-[180px]"
                            step="0.1"
                            min="1"
                            placeholder={t('nodes.screentone.ssaa-scale-placeholder')}
                            value={options.ssaa_scale ?? ""}
                            onInput={(e) => {
                                const raw = (e.target as HTMLInputElement).value

                                if (raw === "") {
                                    changeValue({ssaa_scale: undefined})
                                    return
                                }

                                const num = parseFloat(raw)
                                if (num === 1 && !options.ssaa_scale) {
                                    changeValue({ssaa_scale: 1.1})
                                    return
                                }
                                if (num <= 1) {
                                    changeValue({ssaa_scale: undefined})
                                    return
                                }

                                changeValue({ssaa_scale: Number(num.toFixed(2))})
                            }}
                        />
                    </div>
                </div>
                <div className="flex-1">
                    <div className="flex flex-col gap-2">
                        <Label>{t('nodes.screentone.ssaa-filter')}</Label>
                        <Combobox
                            items={filterOptions}
                            value={options.ssaa_filter ?? null}
                            onValueChange={(value) =>
                                changeValue({ssaa_filter: value as FilterType})
                            }
                        >
                            <ComboboxInput placeholder={t('nodes.resize.select-filter')} showTrigger />
                            <ComboboxContent>
                                <ComboboxEmpty>{t('nodes.resize.no-items-found')}</ComboboxEmpty>
                                <ComboboxList>
                                    {(opt) => (
                                        <ComboboxItem key={opt} value={opt}>
                                            {opt}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>
                </div>
            </div>
            <div className="flex flex-row gap-2">
                <Checkbox
                    checked={options.disable_auto_dot === true}
                    onCheckedChange={(value) => {
                        changeValue({disable_auto_dot: value === true ? true : undefined})
                    }}
                />
                <Label>{t('nodes.screentone.disable-auto-dot')}</Label>
            </div>
        </div>
    )
}
