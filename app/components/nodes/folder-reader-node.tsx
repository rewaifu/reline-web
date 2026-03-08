import {useContext} from "react"
import {NodesContext, NodesDispatchContext} from "~/context/contexts"
import {ReaderNodeMode} from "~/types/enums"
import {Input} from "../ui/input"
import {Checkbox} from "../ui/checkbox"
import {Label} from "../ui/label"
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "../ui/select"
import {NodesActionType} from "~/types/actions.ts"
import type {FolderReaderNodeOptions} from "~/types/options"
import {FieldGroup, FieldLabel, Field} from "~/components/ui/field.tsx"
import {useTranslation} from "react-i18next"

export function FolderReaderNodeBody({id}: { id: number }) {
    const {t} = useTranslation()
    const nodes = useContext(NodesContext)
    const node = nodes[id]
    const options = node.options as FolderReaderNodeOptions
    const dispatch = useContext(NodesDispatchContext)
    const changeValue = (newOptions: Partial<FolderReaderNodeOptions>) => {
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
                <Label>{t('nodes.folder-reader.path')}</Label>
                <Input
                    placeholder={t('nodes.folder-reader.placeholder')}
                    value={options.path}
                    onChange={(e) => {
                        changeValue({path: e.target.value})
                    }}
                />
            </div>
            <div className="flex flex-col space-y-2">
                <Label>{t('nodes.folder-reader.mode')}</Label>
                <Select
                    onValueChange={(value) => {
                        changeValue({
                            mode: value as ReaderNodeMode,
                        })
                    }}
                    value={options.mode}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            {Object.values(ReaderNodeMode).map((mode) => {
                                return (
                                    <SelectItem key={mode} value={mode}>
                                        {mode}
                                    </SelectItem>
                                )
                            })}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-3 -mt-1">
                <FieldGroup className="w-35">
                    <Field orientation="horizontal">
                        <Checkbox
                            id="recursive-check"
                            checked={options.recursive}
                            onCheckedChange={(value) => {
                                changeValue({recursive: !!value})
                            }}
                        />
                        <FieldLabel htmlFor="recursive-check">{t('nodes.folder-reader.recursive')}</FieldLabel>
                    </Field>
                </FieldGroup>
                <FieldGroup className="w-35">
                    <Field orientation="horizontal">
                        <Checkbox
                            id="unarchive-check"
                            checked={options.unarchive}
                            onCheckedChange={(value) => {
                                changeValue({unarchive: !!value})
                            }}
                        />
                        <FieldLabel htmlFor="unarchive-check">{t('nodes.folder-reader.unarchive')}</FieldLabel>
                    </Field>
                </FieldGroup>
            </div>

        </div>
    )
}
