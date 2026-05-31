import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { invoke } from "@tauri-apps/api/core"
import { listen, type UnlistenFn } from "@tauri-apps/api/event"
import { toast } from "sonner"
import { NodesContext } from "~/context/contexts"
import { nodesToString } from "~/lib/utils"

type BackendStage = "idle" | "cloning" | "creating_venv" | "installing" | "starting" | "running" | "error"

interface BackendStatusEvent {
  stage: BackendStage
  message: string
  port: number | null
}

interface DepsStatus {
  uv_installed: boolean
  repo_cloned: boolean
  venv_created: boolean
  deps_installed: boolean
  has_nvidia_gpu: boolean
}

interface DepsVersions {
  torch_version: string | null
  torch_cuda: boolean
  resselt_version: string | null
  reline_version: string | null
}

interface LogEntry {
  timestamp: string
  level: string
  message: string
}

const PROCESSING_STAGES: BackendStage[] = ["cloning", "creating_venv", "installing", "starting"]

interface UseBackendReturn {
  stage: BackendStage
  isProcessing: boolean
  installingDeps: boolean
  pipelineActive: boolean
  serverRunning: boolean
  serverPort: number | null
  progress: number
  statusMessage: string
  depsStatus: DepsStatus | null
  depsReady: boolean
  versions: DepsVersions | null
  logs: LogEntry[]
  handleStart: () => Promise<void>
  handleStop: () => void
  handleStartServer: () => Promise<void>
  handleStopServer: () => void
  handleCheckDeps: () => Promise<void>
  handleInstallDeps: (full: boolean) => Promise<void>
  handleGetLogs: () => Promise<void>
  handleClearLogs: () => Promise<void>
}

export function useBackend(): UseBackendReturn {
  const [stage, setStage] = useState<BackendStage>("idle")
  const [port, setPort] = useState<number | null>(null)
  const [pipelineActive, setPipelineActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const [depsStatus, setDepsStatus] = useState<DepsStatus | null>(null)
  const [versions, setVersions] = useState<DepsVersions | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const nodes = useContext(NodesContext)
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const wsRef = useRef<WebSocket | null>(null)
  const pendingConfigRef = useRef(false)

  const sendConfig = useCallback(() => {
    const ws = wsRef.current
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(nodesToString(nodesRef.current))
      return
    }
    pendingConfigRef.current = true
  }, [])

  // ── Listen for backend-status events ──────────────────────────
  useEffect(() => {
    let cancelled = false
    let unlisten: UnlistenFn | null = null

    listen<BackendStatusEvent>("backend-status", (event) => {
      if (cancelled) return
      const payload = event.payload
      if (payload?.stage) {
        setStage(payload.stage)
        setStatusMessage(payload.message)
        if (payload.port != null) {
          setPort(payload.port)
        }
      }
    })
      .then((fn) => {
        if (cancelled) {
          fn()
        } else {
          unlisten = fn
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (unlisten) unlisten()
    }
  }, [])

  // ── Listen for backend-log events ─────────────────────────────
  useEffect(() => {
    let cancelled = false
    let unlisten: UnlistenFn | null = null

    listen<LogEntry>("backend-log", (event) => {
      if (cancelled) return
      setLogs((prev) => [...prev, event.payload])
    })
      .then((fn) => {
        if (cancelled) fn()
        else unlisten = fn
      })
      .catch(() => {})

    return () => {
      cancelled = true
      if (unlisten) unlisten()
    }
  }, [])

  // ── On mount: check for existing port, check deps ─────────────
  useEffect(() => {
    invoke<number | null>("get_backend_port")
      .then((p) => {
        if (p != null) {
          setStage("running")
          setPort(p)
        }
      })
      .catch(() => {})

    handleCheckDepsSilent()
  }, [])

  const handleCheckDepsSilent = async () => {
    try {
      const deps = await invoke<DepsStatus>("check_deps")
      setDepsStatus(deps)
      try {
        const vers = await invoke<DepsVersions>("check_versions")
        setVersions(vers)
      } catch {
        setVersions(null)
      }
    } catch {
      setDepsStatus(null)
    }
  }

  const handleCheckDeps = async () => {
    await handleCheckDepsSilent()
  }

  // ── WebSocket connection to running backend ───────────────────
  useEffect(() => {
    if (stage !== "running" || port == null) return

    let retries = 0
    const retryDelay = 500
    let timer: ReturnType<typeof setTimeout> | null = null
    let stopped = false

    const connect = () => {
      if (stopped) return
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`)

      ws.onopen = () => {
        retries = 0
        setPipelineActive(false)
        setProgress(0)
        if (pendingConfigRef.current) {
          pendingConfigRef.current = false
          ws.send(nodesToString(nodesRef.current))
        }
      }

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.status === "running" && typeof msg.progress === "number" && typeof msg.data_len === "number") {
            setPipelineActive(true)
            setProgress(msg.data_len > 0 ? Math.round((msg.progress / msg.data_len) * 100) : 0)
            setStatusMessage(`Processing ${msg.progress + 1} / ${msg.data_len}`)
          } else if (msg.status === "running" && msg.message) {
            setPipelineActive(true)
            setStatusMessage(msg.message)
          } else if (msg.status === "queued") {
            setStatusMessage(msg.message ?? "Waiting...")
          } else if (msg.status === "done") {
            setPipelineActive(false)
            setProgress(100)
            setStatusMessage("Pipeline completed")
            toast.success("Pipeline completed")
          } else if (msg.status === "error") {
            setPipelineActive(false)
            setStatusMessage(msg.error ?? "Pipeline error")
            toast.error(msg.error ?? "Pipeline error")
          } else if (msg.status === "cancelled") {
            setPipelineActive(false)
            setStatusMessage("Pipeline cancelled")
            toast.info("Pipeline cancelled")
          }
        } catch {
          // ignore parse errors
        }
      }

      ws.onclose = () => {
        wsRef.current = null
        if (!stopped) {
          retries++
          const delay = Math.min(retries * retryDelay, 5000)
          setStatusMessage(`Reconnecting... (${retries})`)
          timer = setTimeout(connect, delay)
        }
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    }

    timer = setTimeout(connect, 300)

    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [stage, port])

  // ── Actions ───────────────────────────────────────────────────

  const handleStart = useCallback(async () => {
    if (stage === "running") {
      sendConfig()
      return
    }
    setLogs([])
    pendingConfigRef.current = true
    try {
      await invoke("initialize")
    } catch (err) {
      pendingConfigRef.current = false
      toast.error(String(err))
    }
  }, [stage, sendConfig])

  const handleStop = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "cancel" }))
    }
  }, [])

  const handleStartServer = useCallback(async () => {
    setLogs([])
    pendingConfigRef.current = false
    try {
      await invoke("initialize")
    } catch (err) {
      toast.error(String(err))
    }
  }, [])

  const handleStopServer = useCallback(() => {
    invoke("stop_backend").catch(() => {})
    setStage("idle")
    setPort(null)
    setPipelineActive(false)
  }, [])

  const handleInstallDeps = useCallback(async (full: boolean) => {
    try {
      setLogs([])
      await invoke("install_deps", { full })
      await handleCheckDepsSilent()
    } catch (err) {
      toast.error(String(err))
    }
  }, [])

  const handleGetLogs = useCallback(async () => {
    try {
      const entries = await invoke<LogEntry[]>("get_logs")
      setLogs(entries)
    } catch {
      // ignore
    }
  }, [])

  const handleClearLogs = useCallback(async () => {
    try {
      await invoke("clear_logs")
      setLogs([])
    } catch {
      setLogs([])
    }
  }, [])

  return {
    stage,
    isProcessing: PROCESSING_STAGES.includes(stage),
    installingDeps: stage === "cloning" || stage === "creating_venv" || stage === "installing",
    pipelineActive,
    serverRunning: stage === "running",
    serverPort: port,
    progress,
    statusMessage,
    depsStatus,
    depsReady: depsStatus?.deps_installed === true && depsStatus.repo_cloned && depsStatus.venv_created && depsStatus.uv_installed,
    versions,
    logs,
    handleStart,
    handleStop,
    handleStartServer,
    handleStopServer,
    handleCheckDeps,
    handleInstallDeps,
    handleGetLogs,
    handleClearLogs,
  }
}
