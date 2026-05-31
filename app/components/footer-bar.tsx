import { useTranslation } from "react-i18next"
import { IconBrandDiscordFilled, IconBrandGithub, IconLoader2, IconPlayerPlay, IconPlayerStop, IconSettings } from "@tabler/icons-react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { useBackend } from "~/hooks/useBackend"
import { useIsTauri } from "~/hooks/useIsTauri"
import { useMediaQuery } from "~/hooks/useMediaQuery"
import { CollabLogo } from "~/svg/collab"

export function FooterBar() {
  const { t } = useTranslation()
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const isTauri = useIsTauri()

  const colab = isDesktop ? t("home-page.collab") : t("home-page.collab").split(" (")[0]

  if (isTauri) {
    return <TauriFooter />
  }

  return (
    <footer className="flex h-10 bg-card rounded-xl ring-1 ring-foreground/10 p-2 md:px-5 mb-3 md:mb-5 mx-3 md:mx-5 justify-around md:justify-between mt-1 md:mt-0">
      <div className="flex flex-row gap-2 items-center">
        <h1 className="hidden md:flex text-sm font-semibold tracking-tight select-none">{t("home-page.use-in")}</h1>
        <a href="https://colab.research.google.com/drive/1-ijaR4Ld_CUkEMb-l2Cbf918TCQOp8D9" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            <CollabLogo />
            <div />
            {colab}
          </Button>
        </a>
        <a href="https://github.com/rewaifu/reline_local" target="_blank" className="hidden md:flex" rel="noreferrer">
          <Button variant="outline" size="sm">
            <IconBrandGithub />
            Reline Local
          </Button>
        </a>
        <a href="https://github.com/breadyk/reline-local-GUI" target="_blank" className="hidden md:flex" rel="noreferrer">
          <Button variant="outline" size="sm">
            <IconBrandGithub />
            Reline Local GUI
          </Button>
        </a>
      </div>
      <div className="flex flex-row gap-2 items-center">
        <h1 className="hidden md:flex scroll-m-20 text-sm font-semibold tracking-tight select-none">{t("home-page.need-help")}</h1>
        <a href="https://discord.gg/hEgdaVzTs9" target="_blank" rel="noreferrer">
          <Button variant="outline" size="sm">
            <IconBrandDiscordFilled />
            RawkumaSR
          </Button>
        </a>
      </div>
    </footer>
  )
}

function TauriFooter() {
  const { stage, isProcessing, progress, statusMessage, handleStart, handleStop } = useBackend()

  return (
    <footer className="flex h-12 bg-card rounded-xl ring-1 ring-foreground/10 p-2 px-2 mb-3 md:mb-5 mx-3 md:mx-5 items-center">
      <div className="flex flex-row gap-2 items-center">
        {isProcessing ? (
          <Button
            size="icon-lg"
            variant="outline"
            className="pointer-events-none"
            style={{ borderColor: "#f59e0b", color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)" }}
          >
            <IconLoader2 className="animate-spin" />
          </Button>
        ) : (
          <Button
            size="icon-lg"
            variant="outline"
            style={{ borderColor: "#22c55e", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)" }}
            onClick={handleStart}
          >
            <IconPlayerPlay />
          </Button>
        )}
        {isProcessing ? (
          <Button
            size="icon-lg"
            variant="outline"
            style={{ borderColor: "#ef4444", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }}
            onClick={handleStop}
          >
            <IconPlayerStop />
          </Button>
        ) : (
          <Button
            size="icon-lg"
            variant="outline"
            className="pointer-events-none"
            style={{ borderColor: "#9ca3af", color: "#9ca3af", backgroundColor: "rgba(156,163,175,0.1)" }}
          >
            <IconPlayerStop />
          </Button>
        )}
      </div>
      <Progress value={progress} className="flex-1 mx-3 max-w-60" />
      {statusMessage && <span className="text-xs text-muted-foreground truncate min-w-0 max-w-40">{statusMessage}</span>}
      <Button size="icon-lg" variant="outline" className="ml-auto">
        <IconSettings />
      </Button>
    </footer>
  )
}
