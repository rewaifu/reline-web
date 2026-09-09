import { encode, decode } from "notepack.io";
import { createSignal, type Accessor } from "solid-js";

export type RunPhase = "idle" | "connecting" | "running" | "stopping";

export interface RunProgress {
  percent: number;
  step?: string;
  node?: string;
}

export interface RunNotice {
  ok: boolean;
  text: string;
}

interface Envelope {
  m: string;
  id?: number;
  d?: Record<string, unknown>;
}

// Heartbeat: echo every 5 s so proxies/NAT do not drop the idle socket;
// no echo reply for 15 s = the peer is gone, drop the socket ourselves.
const ECHO_INTERVAL_MS = 5000;
const ECHO_TIMEOUT_MS = 15000;

export const RUN_ENDPOINT_KEY = "reline-web:runEndpoint";
export const DEFAULT_ENDPOINT = "ws://127.0.0.1:8000/run";

export const apiEndpointFromUrl = (): string | undefined => {
  const q = new URLSearchParams(window.location.search).get("api")?.trim();
  if (!q) return undefined;
  return q.replace(/^http/, "ws");
};

/** ?api= wins, then the last value typed in the run tab, then the default. */
export const resolveEndpoint = (): string =>
  apiEndpointFromUrl() ??
  localStorage.getItem(RUN_ENDPOINT_KEY) ??
  DEFAULT_ENDPOINT;

export interface RunClient {
  readonly phase: Accessor<RunPhase>;
  readonly progress: Accessor<RunProgress | undefined>;
  readonly notice: Accessor<RunNotice | undefined>;
  start(url: string, pipeline: string): void;
  stop(): void;
}

export const createRunClient = (): RunClient => {
  const [phase, setPhase] = createSignal<RunPhase>("idle");
  const [progress, setProgress] = createSignal<RunProgress>();
  const [notice, setNotice] = createSignal<RunNotice>();

  let ws: WebSocket | undefined;
  let echoTimer: ReturnType<typeof setInterval> | undefined;
  let lastEcho = 0;
  let nextId = 1;

  const clearEcho = () => {
    if (echoTimer !== undefined) clearInterval(echoTimer);
    echoTimer = undefined;
  };

  const closeSocket = () => {
    clearEcho();
    if (ws !== undefined) {
      ws.onclose = ws.onerror = ws.onmessage = ws.onopen = null;
      ws.close();
      ws = undefined;
    }
  };

  const send = (m: string, d: Record<string, unknown> = {}) => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.send(encode({ m, id: nextId, d } as Envelope));
    nextId += 1;
  };

  const finish = (n: RunNotice) => {
    closeSocket();
    setPhase("idle");
    setNotice(n);
  };

  const startEcho = () => {
    lastEcho = Date.now();
    clearEcho();
    echoTimer = setInterval(() => {
      if (Date.now() - lastEcho > ECHO_TIMEOUT_MS) {
        finish({ ok: false, text: "Соединение потеряно: нет ответа на echo" });
        return;
      }
      send("echo", { t: Date.now() });
    }, ECHO_INTERVAL_MS);
  };

  const start = (url: string, pipeline: string) => {
    if (phase() !== "idle" || !url) return;
    closeSocket();
    setProgress(undefined);
    setNotice(undefined);
    setPhase("connecting");

    let socket: WebSocket;
    try {
      socket = new WebSocket(url);
    } catch (err) {
      setPhase("idle");
      setNotice({
        ok: false,
        text: `Некорректный адрес: ${
          err instanceof Error ? err.message : String(err)
        }`,
      });
      return;
    }
    socket.binaryType = "arraybuffer";
    ws = socket;

    socket.onopen = () => {
      setPhase("running");
      startEcho();
      send("start", { pipeline });
    };
    socket.onclose = () => {
      if (ws !== socket) return;
      ws = undefined;
      clearEcho();
      if (phase() !== "idle") {
        setPhase("idle");
        setNotice({ ok: false, text: "Соединение закрыто сервером" });
      }
    };
    socket.onerror = () => {
      if (ws === socket && phase() === "connecting")
        finish({ ok: false, text: "Не удалось подключиться" });
    };
    socket.onmessage = (ev: MessageEvent) => {
      if (ws !== socket) return;
      let msg: Envelope;
      try {
        msg = decode(new Uint8Array(ev.data)) as Envelope;
      } catch {
        finish({ ok: false, text: "Некорректный кадр (не MessagePack)" });
        return;
      }
      const d = (msg.d ?? {}) as Record<string, unknown>;
      switch (msg.m) {
        case "echo":
          lastEcho = Date.now();
          break;
        case "accepted":
          setNotice({ ok: true, text: "Запуск принят сервером" });
          break;
        case "progress":
          setProgress({
            percent: Number(d.percent) || 0,
            step: d.step as string | undefined,
            node: d.node as string | undefined,
          });
          break;
        case "done":
          finish(
            d.cancelled === true
              ? { ok: true, text: "Остановлено" }
              : d.ok === true
              ? {
                  ok: true,
                  text: `Готово${
                    typeof d.output === "string"
                      ? `: ${d.output.slice(0, 400)}`
                      : ""
                  }`,
                }
              : {
                  ok: false,
                  text: `Ошибка: ${String(d.error ?? "неизвестно")}`,
                }
          );
          break;
        case "error":
          if (d.fatal === true)
            finish({
              ok: false,
              text: `Ошибка сервера: ${String(d.message ?? "")}`,
            });
          else
            setNotice({
              ok: false,
              text: `Ошибка сервера: ${String(d.message ?? "")}`,
            });
          break;
      }
    };
  };

  const stop = () => {
    if (phase() !== "running" && phase() !== "connecting") return;
    if (phase() === "connecting") {
      finish({ ok: true, text: "Отменено до подключения" });
      return;
    }
    setPhase("stopping");
    send("stop");
  };

  return { phase, progress, notice, start, stop };
};
