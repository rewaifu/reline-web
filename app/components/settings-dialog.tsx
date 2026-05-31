import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import anser from "anser"
import { IconAlertTriangle, IconCheck, IconLoader2, IconTerminal2, IconX } from "@tabler/icons-react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"

export interface DepsStatus {
  uv_installed: boolean
  repo_cloned: boolean
  venv_created: boolean
  deps_installed: boolean
  has_nvidia_gpu: boolean
}

export interface DepsVersions {
  torch_version: string | null
  torch_cuda: boolean
  resselt_version: string | null
  reline_version: string | null
}

export interface LogEntry {
  timestamp: string
  level: string
  message: string
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  depsStatus: DepsStatus | null
  versions: DepsVersions | null
  installingDeps: boolean
  statusMessage: string
  logs: LogEntry[]
  section?: "deps" | "logs"
  onInstall: (full: boolean) => Promise<void>
  onClearLogs: () => void
  onRefresh: () => void
}

function AnsiLine({ text }: { text: string }) {
  const html = useMemo(() => anser.ansiToHtml(text), [text])
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

export function SettingsDialog({
  open,
  onOpenChange,
  depsStatus,
  versions,
  installingDeps,
  statusMessage,
  logs,
  onInstall,
  onClearLogs,
  onRefresh,
}: SettingsDialogProps) {
  const { t } = useTranslation()

  const depsInstalled = depsStatus?.deps_installed === true
    && depsStatus.repo_cloned
    && depsStatus.venv_created
    && depsStatus.uv_installed

  const hasAnyDeps = depsStatus != null

  const statusItems = [
    { key: "uv", label: t("backend.depsStatus.uv"), ok: depsStatus?.uv_installed ?? false },
    { key: "repo", label: t("backend.depsStatus.repo"), ok: depsStatus?.repo_cloned ?? false },
    { key: "venv", label: t("backend.depsStatus.venv"), ok: depsStatus?.venv_created ?? false },
    { key: "deps", label: t("backend.depsStatus.deps"), ok: depsStatus?.deps_installed ?? false },
  ] as const

  const handleInstall = () => {
    onInstall(!depsInstalled)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("backend.settings")}</DialogTitle>
          <DialogDescription className="sr-only">{t("backend.dependencies")}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-5">
          {/* Left column: deps, versions, install */}
          <div className="space-y-3">
            {/* Deps status list */}
            <div className="space-y-1.5">
              {statusItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2 text-sm">
                  {item.ok ? (
                    <IconCheck className="size-4 text-green-500 shrink-0" />
                  ) : (
                    <IconX className="size-4 text-red-500 shrink-0" />
                  )}
                  <span className={item.ok ? "text-foreground" : "text-muted-foreground"}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* NVIDIA GPU warning */}
            {hasAnyDeps && !depsStatus.has_nvidia_gpu && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-600 dark:text-amber-400">
                <IconAlertTriangle className="size-3.5 shrink-0 mt-0.5" />
                <span>{t("backend.noNvidiaGpu")}</span>
              </div>
            )}

            {/* Versions */}
            {versions && (versions.torch_version || versions.resselt_version || versions.reline_version) && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">{t("backend.versions")}</span>
                <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                  {versions.torch_version && (
                    <>
                      <span className="text-muted-foreground">Torch:</span>
                      <span className="font-mono">
                        {versions.torch_version}
                        {versions.torch_cuda ? (
                          <span className="ml-1 text-green-500">{t("backend.torchCuda")}</span>
                        ) : (
                          <span className="ml-1 text-red-500">{t("backend.torchCudaFail")}</span>
                        )}
                      </span>
                    </>
                  )}
                  {versions.resselt_version && (
                    <>
                      <span className="text-muted-foreground">resselt:</span>
                      <span className="font-mono">{versions.resselt_version}</span>
                    </>
                  )}
                  {versions.reline_version && (
                    <>
                      <span className="text-muted-foreground">reline:</span>
                      <span className="font-mono">{versions.reline_version}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Install button */}
            <div className="space-y-1.5">
              <Button
                variant={depsInstalled ? "outline" : "default"}
                className="w-full"
                disabled={installingDeps}
                onClick={handleInstall}
              >
                {installingDeps ? (
                  <IconLoader2 className="animate-spin" />
                ) : depsInstalled ? (
                  t("backend.updateLibs")
                ) : (
                  t("backend.installDeps")
                )}
              </Button>
              <p className="text-[11px] text-muted-foreground leading-tight">
                {depsInstalled ? t("backend.updateLibsDesc") : t("backend.installDepsDesc")}
              </p>
            </div>

            {/* Install progress */}
            {installingDeps && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <IconLoader2 className="size-3.5 animate-spin shrink-0" />
                <span className="truncate">{statusMessage || t("backend.installing")}</span>
              </div>
            )}
          </div>

          {/* Right column: Logs */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <IconTerminal2 className="size-3.5" />
                {t("backend.viewLogs")}
              </span>
              {logs.length > 0 && (
                <Button variant="ghost" size="xs" className="h-5 text-[10px] px-1.5" onClick={onClearLogs}>
                  {t("backend.clearLogs")}
                </Button>
              )}
            </div>
            {logs.length === 0 ? (
              <p className="text-xs text-muted-foreground">{t("backend.noLogs")}</p>
            ) : (
              <div className="flex-1 min-h-0 overflow-y-auto rounded-md border">
                <pre className="p-2 text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
                  {logs.map((entry, i) => (
                    <div key={i}>
                      <span className="text-muted-foreground select-none">[{entry.timestamp}]</span>{" "}
                      <AnsiLine text={entry.message} />
                    </div>
                  ))}
                </pre>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="xs" onClick={onRefresh}>
            {t("backend.refresh")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
