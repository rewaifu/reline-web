import { useEffect, useState } from "react"

export function useIsTauri() {
  const [isTauri, setIsTauri] = useState(false)

  useEffect(() => {
    setIsTauri(typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window))
  }, [])

  return isTauri
}
