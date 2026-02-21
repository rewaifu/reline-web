import type { ChangeEvent, DragEvent } from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Upload, FileJson, X, ClipboardPaste } from "lucide-react"

type FileUploadDialogContentProps = {
    onImport: (text: string) => void
}

export function FileUploadDialogContent({ onImport }: FileUploadDialogContentProps) {
    const [text, setText] = useState("")
    const [fileName, setFileName] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const processContent = (content: string, source: string = "From clipboard") => {
        try {
            JSON.parse(content)
            setText(content)
            setFileName(source)
        } catch (err) {
            alert("Invalid JSON.\nCheck your file/clipboard")
        }
    }

    const handleFile = (file?: File) => {
        if (!file) return
        if (!file.name.toLowerCase().endsWith(".json")) {
            alert("Only json file can be uploaded")
            return
        }

        setFileName(file.name)

        file
            .text()
            .then((content) => processContent(content, file.name))
            .catch(() => {
                alert("Unable to read file")
                clearFile()
            })
    }

    const handlePasteFromClipboard = async () => {
        try {
            if (!navigator.clipboard?.readText) {
                alert("Clipboard is not supported in your browser")
                return
            }

            const clipboardText = await navigator.clipboard.readText()
            if (!clipboardText.trim()) {
                alert("Clipboard is empty")
                return
            }

            processContent(clipboardText)
        } catch (err: any) {
            console.error(err)
            alert("Unable to read from clipboard.")
        }
    }

    const clearFile = () => {
        setText("")
        setFileName(null)
        if (inputRef.current) inputRef.current.value = ""
    }

    const onDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files?.[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const onDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(true)
    }

    const onDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
    }

    const onClickZone = () => {
        inputRef.current?.click()
    }

    return (
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Upload config</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={handlePasteFromClipboard}
                    >
                        <ClipboardPaste className="h-4 w-4" />
                        Paste from clipboard
                    </Button>
                </div>

                <div
                    className={cn(
                        "relative flex h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors",
                        dragActive
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/60 bg-muted/40",
                        fileName ? "border-primary/40 bg-primary/5" : ""
                    )}
                    onClick={onClickZone}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept=".json,application/json"
                        className="hidden"
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files?.[0]) {
                                handleFile(e.target.files[0])
                            }
                        }}
                    />

                    <div className="pointer-events-none flex flex-col items-center gap-3 text-center">
                        {fileName ? (
                            <>
                                <FileJson className="h-10 w-10 text-primary" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{fileName}</p>
                                    <p className="text-xs text-muted-foreground">Готов к импорту</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <Upload className="h-10 w-10 text-muted-foreground" />
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        Drag .json here or click
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Only JSON supported
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                    {fileName && (
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute right-3 top-3 h-7 w-7 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation()
                                clearFile()
                            }}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <DialogFooter className="sm:justify-between">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFile}
                    disabled={!fileName}
                >
                    Clear
                </Button>

                <DialogClose asChild>
                    <Button
                        type="button"
                        disabled={text === ""}
                        onClick={() => text && onImport(text)}
                    >
                        Import
                    </Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    )
}