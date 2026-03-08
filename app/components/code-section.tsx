import React, {useContext, useEffect, useRef, useState} from "react"
import {NodesContext, NodesDispatchContext} from "~/context/contexts"
import {IconDownload, IconCopy, IconFileUpload, IconCheck} from "@tabler/icons-react"
import {nodesToString, stringToNodes} from "~/lib/utils"
import {toast} from "sonner"
import {Card, CardHeader, Dialog, DialogTrigger, Button, CardContent} from "~/components/ui"
import {FileUploadDialogContent} from "~/components/file-upload-dialog-content"
import {NodesActionType} from "~/types/actions"
import {migrateNodes} from "~/lib/config-migration"
import {ScrollArea, ScrollBar} from "~/components/ui/scroll-area.tsx";
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import 'highlight.js/styles/github-dark.css';
import {Tooltip, TooltipTrigger, TooltipContent} from "~/components/ui/tooltip.tsx";
import {useTranslation} from "react-i18next"

hljs.registerLanguage('json', json);

export function CodeSection() {
    const {t} = useTranslation()
    const nodes = useContext(NodesContext)
    const dispatch = useContext(NodesDispatchContext)
    const [isCopied, setIsCopied] = useState(false)
    const codeRef = useRef<HTMLElement>(null)
    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.removeAttribute('data-highlighted');
            hljs.highlightElement(codeRef.current);
        }
    }, [nodes])
    return (
        <Card>
            <CardHeader className="flex flex-row items-center mx-2">
                <h2 className="scroll-m-20 text-xl font-semibold tracking-tight">{t('home-page.code')}</h2>
                <div className="flex flex-row gap-1 ml-auto">
                    <Dialog>
                        <Tooltip>
                            <TooltipTrigger>
                                <DialogTrigger asChild>
                                    <Button size="icon" variant="ghost">
                                        <IconFileUpload />
                                    </Button>
                                </DialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{t('tooltips.import')}</p>
                            </TooltipContent>
                        </Tooltip>
                        <FileUploadDialogContent
                            onImport={(text) => {
                                const parsedNodes = stringToNodes(text)
                                const migratedNodes = migrateNodes(parsedNodes)
                                dispatch({
                                    type: NodesActionType.IMPORT,
                                    payload: migratedNodes,
                                })
                            }}
                        />
                    </Dialog>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => {
                                    navigator.clipboard.writeText(nodesToString(nodes)).then(() => {
                                        setIsCopied(true)
                                        toast.success(t('toasts.copied'))
                                        setTimeout(() => {
                                            setIsCopied(false)
                                        }, 5000)
                                    })
                                }}
                            >
                                {isCopied ? <IconCheck/> : <IconCopy/>}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('tooltips.copy')}</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button size="icon" variant="ghost"
                                    onClick={async () => {
                                        const data = nodesToString(nodes);
                                        if ('showSaveFilePicker' in window) {
                                            try {
                                                // @ts-ignore
                                                const handle = await window.showSaveFilePicker({
                                                    suggestedName: 'config.json',
                                                    types: [{
                                                        description: 'JSON File',
                                                        accept: { 'application/json': ['.json'] },
                                                    }],
                                                });

                                                const writable = await handle.createWritable();
                                                await writable.write(data);
                                                await writable.close();

                                                toast.success(t('toasts.saved'));
                                            } catch (err) {
                                                console.error(err);
                                            }
                                        } else {
                                            const blob = new Blob([data], { type: "application/json" });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.href = url;
                                            link.download = "config.json";
                                            link.click();
                                            URL.revokeObjectURL(url);
                                            toast.success(t('toasts.dl-started'));
                                        }
                                    }}
                            >
                                <IconDownload/>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{t('tooltips.download')}</p>
                        </TooltipContent>
                    </Tooltip>

                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="relative rounded-xl border h-full bg-background overflow-hidden">
                    <div className="m-4">
                        <pre>
                            <code ref={codeRef} className="language-json !bg-transparent !p-0">
                                {nodesToString(nodes)}
                            </code>
                        </pre>
                    </div>
                    <ScrollBar className="mr-1 mt-2 pb-4"/>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
