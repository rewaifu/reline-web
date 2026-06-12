import { useState } from "react"
import { useTranslation } from "react-i18next"
import { IconBrandDiscordFilled, IconBrandGithub, IconLoader2, IconPlayerPlay, IconPlayerStop, IconSettings, IconTerminal2 } from "@tabler/icons-react"
import { Button } from "~/components/ui/button"
import { Progress } from "~/components/ui/progress"
import { useBackend } from "~/hooks/useBackend"
import { useIsTauri } from "~/hooks/useIsTauri"
import { useMediaQuery } from "~/hooks/useMediaQuery"
import { CollabLogo } from "~/svg/collab"
import { SettingsDialog } from "~/components/settings-dialog"

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
  const {
    stage,
    isProcessing,
    installingDeps,
    pipelineActive,
    serverRunning,
    serverPort,
    progress,
    statusMessage,
    depsStatus,
    depsReady,
    versions,
    logs,
    handleStart,
    handleStop,
    handleStartServer,
    handleStopServer,
    handleCheckDeps,
    handleInstallDeps,
    handleClearLogs,
  } = useBackend()
  const { t } = useTranslation()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState<"deps" | "logs">("deps")

  const openSettings = (sec: "deps" | "logs") => {
    setSettingsSection(sec)
    setSettingsOpen(true)
  }

  const playBusy = pipelineActive || stage === "starting" || installingDeps
  const playDisabled = !depsReady && !isProcessing && !serverRunning
  const playGreen = { borderColor: "#22c55e", color: "#22c55e", backgroundColor: "rgba(34,197,94,0.1)" }
  const playAmber = { borderColor: "#f59e0b", color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)" }
  const playGray = { borderColor: "#404040", color: "#404040", backgroundColor: "rgba(156,163,175,0.1)" }
  const stopRed = { borderColor: "#ef4444", color: "#ef4444", backgroundColor: "rgba(239,68,68,0.1)" }
  const stopGray = { borderColor: "#5a5a5a", color: "#5a5a5a", backgroundColor: "rgba(156,163,175,0.1)" }

  const serverStarting = stage === "starting"

  const dotColor = serverRunning
    ? "#22c55e"
    : serverStarting || isProcessing
      ? "#f59e0b"
      : stage === "error"
        ? "#ef4444"
        : "#6b7280"

  const parseProgressText = (msg: string) => {
    const match = msg.match(/^Processing\s+(\d+)\s*\/\s*(\d+)$/)
    if (match) return `${match[1]}/${match[2]}`
    return msg
  }

  const statusText = serverRunning && serverPort != null
    ? t("backend.serverRunning", { port: serverPort })
    : serverStarting
      ? t("backend.serverStarting")
      : stage === "error"
        ? statusMessage || t("backend.serverOffline")
        : t("backend.serverOffline")

  return (
    <>
      <footer className="relative flex h-12 bg-card rounded-xl ring-1 ring-foreground/10 p-2 px-2 mb-3 md:mb-5 mx-3 md:mx-5 items-center gap-2">
        {/* Play */}
        {playBusy ? (
          <Button size="icon-lg" variant="outline" disabled style={playAmber}>
            <IconLoader2 className="animate-spin" />
          </Button>
        ) : (
          <Button
            size="icon-lg"
            variant="outline"
            style={playDisabled ? playGray : playGreen}
            onClick={playDisabled ? undefined : handleStart}
            disabled={playDisabled}
          >
            <IconPlayerPlay />
          </Button>
        )}

        {/* Stop */}
        {pipelineActive ? (
          <Button size="icon-lg" variant="outline" style={stopRed} onClick={handleStop}>
            <IconPlayerStop />
          </Button>
        ) : (
          <Button size="icon-lg" variant="outline" style={stopGray} className="pointer-events-none">
            <IconPlayerStop />
          </Button>
        )}

        {/* Progress bar + text */}
        {!depsReady && !serverRunning ? (
          <button
            type="button"
            className="text-xs underline cursor-pointer text-muted-foreground whitespace-nowrap"
            onClick={() => openSettings("deps")}
          >
            {t("backend.installDepsPrompt")}
          </button>
        ) : pipelineActive ? (
          <div className="flex items-center gap-1.5">
            <Progress value={progress} className="w-16 shrink-0" />
            {statusMessage && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {parseProgressText(statusMessage)}
              </span>
            )}
          </div>
        ) : null}

        {/* Centered server card */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-muted-foreground/10 border p-1">
          <span className="w-2 h-2 rounded-full shrink-0 ml-2" style={{ backgroundColor: dotColor }} />
          <span className="text-sm text-muted-foreground whitespace-nowrap">{statusText}</span>
          {serverRunning ? (
            <Button variant="destructive" size="sm" onClick={handleStopServer}>
              {t("backend.stopServer")}
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleStartServer}
              disabled={serverStarting || installingDeps}
            >
              {t("backend.startServer")}
            </Button>
          )}
          {stage === "error" && (
            <Button variant="ghost" size="icon-sm" className="shrink-0 mr-1" onClick={() => openSettings("logs")}>
              <IconTerminal2 />
            </Button>
          )}
        </div>

        {/* Settings */}
        <Button size="icon-lg" variant="outline" className="ml-auto shrink-0" onClick={() => openSettings("deps")}>
          <IconSettings />
        </Button>
      </footer>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        section={settingsSection}
        depsStatus={depsStatus}
        versions={versions}
        installingDeps={installingDeps}
        statusMessage={statusMessage}
        logs={logs}
        onInstall={handleInstallDeps}
        onClearLogs={handleClearLogs}
        onRefresh={handleCheckDeps}
      />
    </>
  )
}
