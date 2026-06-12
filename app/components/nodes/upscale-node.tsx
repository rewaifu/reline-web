import {useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode} from "react"
import {ModelsContext, NodesContext, NodesDispatchContext} from "~/context/contexts"
import {DType, TilerType} from "~/types/enums"
import {Label} from "../ui/label"
import {DEFAULT_MODEL, DEFAULT_TILE_SIZE} from "~/constants"
import {Input} from "../ui/input"
import {Checkbox} from "../ui/checkbox"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "../ui/select"
import type {UpscaleNodeOptions} from "~/types/options"
import {NodesActionType, type NodesAction} from "~/types/actions"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "~/components/ui/combobox"
import {FieldGroup, FieldLabel, Field} from "~/components/ui/field.tsx"
import {Separator} from "~/components/ui/separator.tsx"
import {useTranslation} from "react-i18next"
import {cn} from "~/lib/utils"
import {useIsTauri} from "~/hooks/useIsTauri"
import {IconFile, IconFolderOpen} from "@tabler/icons-react"
import {Button} from "~/components/ui/button"

export function ModelsCombobox({
                                    value,
                                    onChange,
                                    items: itemsProp,
                                    renderItem,
                                    renderValue,
                                    disabled,
                                    placeholder: placeholderProp,
                                }: {
    value?: string
    onChange: (value: string) => void
    items?: string[]
    renderItem?: (item: string) => ReactNode
    renderValue?: (value: string) => string
    disabled?: boolean
    placeholder?: string
}) {
    const {t} = useTranslation()
    const models = useContext(ModelsContext)
    const items = itemsProp ?? models

    return (
        <Combobox
            items={items}
            value={value ?? null}
            onValueChange={(val) => {
                if (typeof val === "string") {
                    onChange(val)
                }
            }}
        >
            <ComboboxInput placeholder={placeholderProp ?? t('nodes.upscale.search')} showTrigger disabled={disabled} renderValue={renderValue} />
            <ComboboxContent>
                <ComboboxEmpty>{t('nodes.upscale.no-models-found')}</ComboboxEmpty>
                <ComboboxList>
                    {(model) => (
                        <ComboboxItem key={model} value={model}>
                            {renderItem ? renderItem(model) : model}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}

function extractModelScale(modelName: string): number | null {
    let match = modelName.match(/(\d+)x/i)
    if (match) {
        return Number.parseInt(match[1], 10)
    }
    match = modelName.match(/x(\d+)/i)
    if (match) {
        return Number.parseInt(match[1], 10)
    }
    return null
}

export function UpscaleNodeBody({id, dispatch: dispatchProp, idSuffix}: { id: number; dispatch?: Dispatch<NodesAction>; idSuffix?: string }) {
    const {t} = useTranslation()
    const nodes = useContext(NodesContext)
    const node = nodes.find((item) => item.id === id)
    if (!node) {
        return null
    }
    const options = node.options as UpscaleNodeOptions
    const [target, setTarget] = useState(options.target_scale !== undefined)
    const contextDispatch = useContext(NodesDispatchContext)
    const dispatch = dispatchProp ?? contextDispatch
    const models = useContext(ModelsContext)
    const sid = (baseId: string) => idSuffix ? `${baseId}-${idSuffix}` : `${baseId}-${id}`
    const isTauri = useIsTauri()
    const [localModels, setLocalModels] = useState<string[]>([])
    const MODELS_FOLDER_KEY = "upscale-models-folder"
    const [modelsFolder, setModelsFolder] = useState<string>(() => localStorage.getItem(MODELS_FOLDER_KEY) ?? "")

    useEffect(() => {
        if (!isTauri || !modelsFolder) return
        const scanFolder = async () => {
            try {
                const { readDir } = await import("@tauri-apps/plugin-fs")
                const entries = await readDir(modelsFolder)
                const folder = modelsFolder.replace(/\\/g, '/')
                const modelFiles = entries
                    .filter(e => e.name && /\.(pt|pth|safetensors)$/i.test(e.name))
                    .map(e => `${folder}/${e.name}`)
                setLocalModels(modelFiles)
                if (!options.is_own_model && modelFiles.length > 0 && !modelFiles.includes(options.model)) {
                    changeValue({ model: modelFiles[0] })
                }
            } catch (err) {
                console.error("Failed to read models folder:", err)
            }
        }
        scanFolder()
    }, [isTauri, modelsFolder])

    const handleBrowseFolder = async () => {
        try {
            const { open } = await import("@tauri-apps/plugin-dialog")
            const folder = await open({ directory: true, multiple: false, title: t('nodes.upscale.browse-models-folder') })
            if (folder) {
                localStorage.setItem(MODELS_FOLDER_KEY, folder as string)
                setModelsFolder(folder as string)
            }
        } catch (err) {
            console.error("Folder dialog failed:", err)
        }
    }

    const handleBrowseFile = async () => {
        try {
            const { open } = await import("@tauri-apps/plugin-dialog")
            const file = await open({
                multiple: false,
                title: t('nodes.upscale.browse-model'),
                filters: [{ name: "Model files", extensions: ["pt", "pth", "safetensors"] }],
            })
            if (file) {
                changeValue({ model: file as string })
            }
        } catch (err) {
            console.error("File dialog failed:", err)
        }
    }

    const displayModelName = (fullPath: string) => {
        const basename = fullPath.replace(/^.*[\\/]/, '')
        return basename.replace(/\.(pt|pth|safetensors)$/i, '')
    }

    const modelScale = useMemo(() => extractModelScale(options.model), [options.model])
    const showWarning = target && options.target_scale !== undefined && modelScale !== null && options.target_scale > modelScale
    const showUnknownScaleWarning = target && options.target_scale !== undefined && modelScale === null && options.target_scale !== 1

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
                <Label>{t('nodes.upscale.model')}</Label>
                {options.is_own_model ? (
                    <div className="flex items-center gap-2">
                        <Input
                            className="flex-1"
                            placeholder={t('nodes.upscale.placeholder')}
                            value={options.model}
                            onChange={(e) => {
                                changeValue({model: e.target.value})
                            }}
                        />
                        {isTauri && (
                            <Button variant="outline" size="icon" onClick={handleBrowseFile}>
                                <IconFile className="size-4" />
                            </Button>
                        )}
                    </div>
                ) : isTauri ? (
                    <div className="flex items-center gap-2">
                        <div className="flex-1">
                            <ModelsCombobox
                                items={localModels}
                                renderItem={displayModelName}
                                renderValue={displayModelName}
                                value={modelsFolder && localModels.includes(options.model) ? options.model : undefined}
                                onChange={(model) => {
                                    changeValue({model: model})
                                }}
                                disabled={!modelsFolder}
                                placeholder={!modelsFolder ? t('nodes.upscale.select-folder') : undefined}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={handleBrowseFolder}>
                            <IconFolderOpen className="size-4" />
                        </Button>
                    </div>
                ) : (
                    <ModelsCombobox
                        value={options.model}
                        onChange={(model) => {
                            changeValue({
                                model: model,
                            })
                        }}
                    />
                )}
            </div>
            <Separator/>
            <div className="flex flex-col md:flex-row gap-6 md:gap-4">
                <div className="flex-1 flex flex-col gap-2">
                    <Label>{t('nodes.upscale.tiler')}</Label>
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
                        <SelectTrigger className="w-full min-w-[80px]">
                            <SelectValue>{t(`nodes.upscale.tiler-options.${options.tiler}`)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {Object.values(TilerType).map((type) => {
                                    return (
                                        <SelectItem key={type} value={type}>
                                            {t(`nodes.upscale.tiler-options.${type}`)}
                                        </SelectItem>
                                    )
                                })}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                {options.tiler === TilerType.EXACT && (
                    <div className="flex-1 flex flex-col gap-2">
                        <Label>{t('nodes.upscale.tile-size')}</Label>
                        <Input
                            type="number"
                            className="w-full min-w-[80px]"
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

                <div className="flex-1 flex flex-col gap-2">
                    <Label>{t('nodes.upscale.dtype')}</Label>
                    <Select onValueChange={(value: DType | null) => changeValue({dtype: value!})} value={options.dtype}>
                        <SelectTrigger className="w-full min-w-[80px]">
                            <SelectValue/>
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
            </div>
            <Separator/>
            <FieldGroup>
                <Field orientation="horizontal">
                    <Checkbox
                        id={sid("target-scale-check")}
                        checked={target}
                        onCheckedChange={(value) => {
                            setTarget(!!value)
                            if (!value) {
                                changeValue({target_scale: undefined})
                            } else {
                                changeValue({target_scale: modelScale ?? 1})
                            }
                        }}
                    />
                    <FieldLabel htmlFor={sid("target-scale-check")}>{t('nodes.upscale.enable-target-scale')}</FieldLabel>
                </Field>
            </FieldGroup>
            {target && (
                <div className="flex flex-col gap-2">
                    <Label>{t('nodes.upscale.target-scale-size')}</Label>
                    <Input
                        type="number"
                        className={cn("w-[180px]", showWarning && "border-destructive focus-visible:ring-destructive")}
                        step={1}
                        min={1}
                        max={32}
                        value={options.target_scale ?? 1}
                        onChange={(e) => {
                            changeValue({target_scale: Number.parseFloat(e.target.value)})
                        }}
                    />
                    {showWarning && (
                        <p className="text-sm text-destructive">
                            {t('nodes.upscale.target-scale-warning', {modelScale})}
                        </p>
                    )}
                    {showUnknownScaleWarning && (
                        <p className="text-sm text-destructive">
                            {t('nodes.upscale.target-scale-unknown')}
                        </p>
                    )}
                </div>
            )}
            <Separator/>
            <FieldGroup>
                <Field orientation="horizontal">
                    <Checkbox
                        id={sid("own-model-check")}
                        checked={options.is_own_model}
                        onCheckedChange={(value) => {
                            if (!value) {
                                if (isTauri) {
                                    changeValue({
                                        model: localModels.includes(options.model) ? options.model : "",
                                        is_own_model: value,
                                    })
                                } else {
                                    changeValue({
                                        model: models.includes(options.model) ? options.model : DEFAULT_MODEL,
                                        is_own_model: value,
                                    })
                                }
                            } else if (value) {
                                changeValue({model: "", is_own_model: !!value})
                            }
                        }}
                    />
                    <FieldLabel htmlFor={sid("own-model-check")}>{isTauri ? t('nodes.upscale.from-file') : t('nodes.upscale.own-model')}</FieldLabel>
                </Field>
            </FieldGroup>

            <FieldGroup>
                <Field orientation="horizontal">
                    <Checkbox
                        id={sid("cpu-scale-check")}
                        checked={options.allow_cpu_upscale}
                        onCheckedChange={(value) => {
                            changeValue({allow_cpu_upscale: !!value})
                        }}
                    />
                    <FieldLabel htmlFor={sid("cpu-scale-check")}>{t('nodes.upscale.allow-cpu-upscale')}</FieldLabel>
                </Field>
            </FieldGroup>

        </div>
    )
}
