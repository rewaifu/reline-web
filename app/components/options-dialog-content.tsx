import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Button
} from "~/components/ui"
import {IconSettings} from "@tabler/icons-react"
import {useTranslation} from "react-i18next"

export function OptionsDialog() {
    const {t} = useTranslation()


    return(
        <Dialog>
            <DialogTrigger>
                <Button variant="ghost" size="icon-lg">
                      <IconSettings />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t("options.title")}</DialogTitle>
                </DialogHeader>
                
            </DialogContent>
        </Dialog>
    )
}
