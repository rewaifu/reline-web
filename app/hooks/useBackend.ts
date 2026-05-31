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

const PROCESSING_STAGES: BackendStage[] = ["cloning", "creating_venv", "installing", "starting", "running"]

interface UseBackendReturn {
  stage: BackendStage
  isProcessing: boolean
  pipelineActive: boolean
  progress: number
  statusMessage: string
  handleStart: () => Promise<void>
  handleStop: () => void
}

export function useBackend(): UseBackendReturn {
  const [stage, setStage] = useState<BackendStage>("idle")
  const [port, setPort] = useState<number | null>(null)
  const [pipelineActive, setPipelineActive] = useState(false)
  const [progress, setProgress] = useState(0)
  const [statusMessage, setStatusMessage] = useState("")
  const nodes = useContext(NodesContext)
  const nodesRef = useRef(nodes)
  nodesRef.current = nodes
  const wsRef = useRef<WebSocket | null>(null)

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

  useEffect(() => {
    invoke<number | null>("get_backend_port")
      .then((p) => {
        if (p != null) {
          setStage("running")
          setPort(p)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (stage !== "running" || port == null) return

    let retries = 0
    const maxRetries = 20
    const retryDelay = 500
    let timer: ReturnType<typeof setTimeout> | null = null
    let stopped = false

    const connect = () => {
      if (stopped) return
      const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`)
      let hasOpened = false

      ws.onopen = () => {
        hasOpened = true
        retries = 0
        setPipelineActive(false)
        setProgress(0)
        ws.send(nodesToString(nodesRef.current))
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
        if (!hasOpened && !stopped && retries < maxRetries) {
          retries++
          setStatusMessage(`Connecting to backend... (attempt ${retries}/${maxRetries})`)
          timer = setTimeout(connect, retryDelay)
        }
      }

      ws.onerror = () => {
        ws.close()
      }

      wsRef.current = ws
    }

    connect()

    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [stage, port])

  const handleStart = useCallback(async () => {
    try {
      await invoke("initialize")
    } catch (err) {
      toast.error(String(err))
    }
  }, [])

  const handleStop = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "cancel" }))
    }
  }, [])

  return {
    stage,
    isProcessing: PROCESSING_STAGES.includes(stage),
    pipelineActive,
    progress,
    statusMessage,
    handleStart,
    handleStop,
  }
}
