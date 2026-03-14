import {useContext} from "react"
import {ModelsContext, NodesContext, NodesDispatchContext} from "~/context/contexts"
import {DType, TilerType} from "~/types/enums"
import {Label} from "../ui/label"
import {DEFAULT_MODEL, DEFAULT_TILE_SIZE} from "~/constants"
import {Input} from "../ui/input"
import {Checkbox} from "../ui/checkbox"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "../ui/select"
import type {UpscaleNodeOptions} from "~/types/options"
import {NodesActionType} from "~/types/actions"
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

export function ModelsCombobox({
                                   value,
                                   onChange,
                               }: {
    value?: string
    onChange: (value: string) => void
}) {
    const {t} = useTranslation()
    const models = useContext(ModelsContext)

    return (
        <Combobox
            items={models}
            value={value ?? null}
            onValueChange={(val) => val && onChange(val)}
        >
            <ComboboxInput placeholder={t('nodes.upscale.search')} showTrigger />
            <ComboboxContent>
                <ComboboxEmpty>{t('nodes.upscale.no-models-found')}</ComboboxEmpty>
                <ComboboxList>
                    {(model) => (
                        <ComboboxItem key={model} value={model}>
                            {model}
                        </ComboboxItem>
                    )}
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    )
}

export function UpscaleNodeBody({id}: { id: number }) {
    const {t} = useTranslation()
    const nodes = useContext(NodesContext)
    const node = nodes.find((item) => item.id === id)
    if (!node) {
        return null
    }
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
                <Label>{t('nodes.upscale.model')}</Label>
                {options.is_own_model ? (
                    <Input
                        placeholder={t('nodes.upscale.placeholder')}
                        value={options.model}
                        onChange={(e) => {
                            changeValue({model: e.target.value})
                        }}
                    />
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
                            <SelectValue/>
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
                        id="own-model-check"
                        checked={options.is_own_model}
                        onCheckedChange={(value) => {
                            if (!value) {
                                changeValue({
                                    model: models.includes(options.model) ? options.model : DEFAULT_MODEL,
                                    is_own_model: value
                                })
                            } else if (value) {
                                changeValue({model: "", is_own_model: !!value})
                            }
                        }}
                    />
                    <FieldLabel htmlFor="own-model-check">{t('nodes.upscale.own-model')}</FieldLabel>
                </Field>
            </FieldGroup>

            <FieldGroup>
                <Field orientation="horizontal">
                    <Checkbox
                        id="cpu-scale-check"
                        checked={options.allow_cpu_upscale}
                        onCheckedChange={(value) => {
                            changeValue({allow_cpu_upscale: !!value})
                        }}
                    />
                    <FieldLabel htmlFor="cpu-scale-check">{t('nodes.upscale.allow-cpu-upscale')}</FieldLabel>
                </Field>
            </FieldGroup>
        </div>
    )
}
