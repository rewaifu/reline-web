import { Card, CardHeader, CardContent } from "./ui/card"
import { useContext, useState } from "react"
import { NodesContext, NodesDispatchContext } from "~/context/contexts"
import { Button } from "./ui/button"
import { Check, Copy, FileUp } from "lucide-react"
import { useToast } from "./ui/use-toast"
import { nodesToString, stringToNodes } from "~/lib/utils"
import { Dialog, DialogTrigger } from "./ui/dialog"
import { FileUploadDialogContent } from "./file-upload-dialog-content"
import { NodesActionType } from "~/types/actions.ts"

export function CodeSection() {
  const nodes = useContext(NodesContext)
  const dispatch = useContext(NodesDispatchContext)
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()
  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div>Code</div>
        <div className="flex flex-row gap-2 ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <FileUp />
              </Button>
            </DialogTrigger>
            <FileUploadDialogContent
              onImport={(text) => {
                dispatch({
                  type: NodesActionType.IMPORT,
                  payload: stringToNodes(text),
                })
              }}
            />
          </Dialog>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(nodesToString(nodes)).then(() => {
                setIsCopied(true)
                toast({
                  title: "Copied!",
                })
                setTimeout(() => {
                  setIsCopied(false)
                }, 5000)
              })
            }}
          >
            {isCopied ? <Check /> : <Copy />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <pre>{nodesToString(nodes)}</pre>
      </CardContent>
    </Card>
  )
}
