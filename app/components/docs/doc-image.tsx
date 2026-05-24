import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react"

import { createPortal } from "react-dom"
import { IconX } from "@tabler/icons-react"

import { Button } from "~/components/ui/button.tsx"
import { Slider } from "~/components/ui/slider.tsx"

type DocImageProps = {
  src: string
  alt: string
  caption?: string
}

const MIN_ZOOM = 1
const MAX_ZOOM = 8
const MIN_SCREEN_COVERAGE = 0.3

export function DocImage({
                           src,
                           alt,
                           caption,
                         }: DocImageProps) {
  const [render, setRender] = useState(false)
  const [visible, setVisible] = useState(false)
  const [zoomUI, setZoomUI] = useState(1)

  const [naturalSize, setNaturalSize] = useState<{
    w: number
    h: number
  } | null>(null)

  const [dragging, setDragging] = useState(false)

  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const zoomRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0 })

  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  })

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isZoomed = zoomUI > 1.001

  const fitScale = useMemo(() => {
    if (!naturalSize) return 1

    const vw = window.innerWidth * 0.9
    const vh = window.innerHeight * 0.9

    let scale = Math.min(vw / naturalSize.w, vh / naturalSize.h)
    scale = Math.min(scale, 1)

    const minW = window.innerWidth * MIN_SCREEN_COVERAGE
    const minH = window.innerHeight * MIN_SCREEN_COVERAGE
    const minScale = Math.max(minW / naturalSize.w, minH / naturalSize.h)

    return Math.max(scale, minScale)
  }, [naturalSize])

  const updateTransform = useCallback(() => {
    const img = imgRef.current
    if (!img) return

    const { x, y } = panRef.current
    img.style.transform = `
      translate3d(${x}px, ${y}px, 0)
      scale(${zoomRef.current * fitScale})
    `
  }, [fitScale])

  const clampPan = useCallback(
      (x: number, y: number, scale = zoomRef.current * fitScale) => {
        const container = containerRef.current
        if (!container || !naturalSize) return { x, y }

        const vw = container.clientWidth
        const vh = container.clientHeight

        const scaledW = naturalSize.w * scale
        const scaledH = naturalSize.h * scale

        const maxX = Math.max(0, (scaledW - vw) / 2)
        const maxY = Math.max(0, (scaledH - vh) / 2)

        return {
          x: Math.min(maxX, Math.max(-maxX, x)),
          y: Math.min(maxY, Math.max(-maxY, y)),
        }
      },
      [fitScale, naturalSize],
  )

  useEffect(() => {
    updateTransform()
  }, [updateTransform])

  const openViewer = useCallback(() => {
    zoomRef.current = 1
    panRef.current = { x: 0, y: 0 }
    setZoomUI(1)

    setVisible(false)
    setRender(true)

    requestAnimationFrame(() => setVisible(true))
  }, [])

  const closeViewer = useCallback(() => {
    setVisible(false)

    closeTimer.current = setTimeout(() => {
      setRender(false)
      zoomRef.current = 1
      panRef.current = { x: 0, y: 0 }
      setZoomUI(1)
    }, 200)
  }, [])

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current)
    }
  }, [])

  useEffect(() => {
    if (!render) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [render])

  useEffect(() => {
    if (!render) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation()
        closeViewer()
      }
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [render, closeViewer])

  useEffect(() => {
    if (!render) {
      setNaturalSize(null)
      return
    }

    const img = imgRef.current
    if (!img) return

    const update = () => {
      if (img.naturalWidth && img.naturalHeight) {
        setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight })
      }
    }

    if (img.complete && img.naturalWidth) update()
    img.addEventListener("load", update)
    return () => img.removeEventListener("load", update)
  }, [render])

  // ── Wheel: мгновенный зум к курсору ─────────────────────────────
  useEffect(() => {
    if (!render) return

    const container = containerRef.current
    if (!container || !naturalSize) return

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()

      const rect = container.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top

      const prevZoom = zoomRef.current
      const factor = Math.exp(-e.deltaY * 0.0015)
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prevZoom * factor))

      if (nextZoom === prevZoom) return

      const prevScale = prevZoom * fitScale
      const nextScale = nextZoom * fitScale
      const pan = panRef.current

      // Точка на изображении под курсором
      const imageX = (cx - container.clientWidth / 2 - pan.x) / prevScale
      const imageY = (cy - container.clientHeight / 2 - pan.y) / prevScale

      // Новый pan, чтобы эта точка осталась под курсором
      const nextPanX = cx - container.clientWidth / 2 - imageX * nextScale
      const nextPanY = cy - container.clientHeight / 2 - imageY * nextScale

      zoomRef.current = nextZoom
      panRef.current = clampPan(nextPanX, nextPanY, nextScale)
      setZoomUI(nextZoom)

      updateTransform()
    }

    container.addEventListener("wheel", onWheel, { passive: false })
    return () => container.removeEventListener("wheel", onWheel)
  }, [render, fitScale, naturalSize, clampPan, updateTransform])

  // ── Drag ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!dragging) return

    const onMove = (e: MouseEvent) => {
      e.preventDefault()

      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY

      const nextX = dragRef.current.startPanX + dx
      const nextY = dragRef.current.startPanY + dy

      panRef.current = clampPan(nextX, nextY)
      updateTransform()
    }

    const onUp = () => setDragging(false)

    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)

    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [dragging, clampPan, updateTransform])

  const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (!isZoomed) return
        e.preventDefault()

        dragRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          startPanX: panRef.current.x,
          startPanY: panRef.current.y,
        }
        setDragging(true)
      },
      [isZoomed],
  )

  // ── Slider: мгновенный зум от центра экрана ─────────────────────
  const handleSliderChange = useCallback(
      (v: number | readonly number[]) => {
        const value = Array.isArray(v) ? v[0] : v
        const container = containerRef.current

        const prevZoom = zoomRef.current
        const nextZoom = value

        // Зумим относительно центра вьюпорта, чтобы не уезжало в сторону
        if (container && naturalSize && prevZoom !== nextZoom) {
          const cx = container.clientWidth / 2
          const cy = container.clientHeight / 2

          const prevScale = prevZoom * fitScale
          const nextScale = nextZoom * fitScale
          const pan = panRef.current

          const imageX = (cx - container.clientWidth / 2 - pan.x) / prevScale
          const imageY = (cy - container.clientHeight / 2 - pan.y) / prevScale

          const nextPanX = cx - container.clientWidth / 2 - imageX * nextScale
          const nextPanY = cy - container.clientHeight / 2 - imageY * nextScale

          panRef.current = clampPan(nextPanX, nextPanY, nextScale)
        }

        zoomRef.current = nextZoom
        setZoomUI(nextZoom)
        updateTransform()
      },
      [fitScale, naturalSize, clampPan, updateTransform],
  )

  return (
      <>
        <figure className="my-5 w-full">
          <img
              src={src}
              alt={alt}
              className="w-full rounded-lg border cursor-zoom-in"
              onClick={openViewer}
              draggable={false}
          />
          {caption ? (
              <figcaption className="mt-2 text-center text-sm text-muted-foreground">
                {caption}
              </figcaption>
          ) : null}
        </figure>

        {render
            ? createPortal(
                <div
                    className={`
                fixed inset-0 z-50
                bg-black/70 backdrop-blur-sm
                transition-opacity duration-200
                ${visible ? "opacity-100" : "opacity-0"}
              `}
                    onClick={closeViewer}
                >
                  <Button
                      variant="outline"
                      size="icon-sm"
                      className="absolute top-4 right-4 z-20 shadow-lg !bg-background"
                      onClick={(e) => {
                        e.stopPropagation()
                        closeViewer()
                      }}
                  >
                    <IconX />
                  </Button>

                  <div
                      ref={containerRef}
                      className="absolute inset-0 overflow-hidden touch-none"
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                          ref={imgRef}
                          src={src}
                          alt={alt}
                          draggable={false}
                          onClick={(e) => e.stopPropagation()}
                          onMouseDown={handleMouseDown}
                          className={`
                      select-none will-change-transform
                      max-w-none max-h-none shrink-0
                      ${
                              isZoomed
                                  ? dragging
                                      ? "cursor-grabbing"
                                      : "cursor-grab"
                                  : "cursor-default"
                          }
                    `}
                          style={{
                            width: naturalSize?.w,
                            height: naturalSize?.h,
                            transformOrigin: "center center",
                            backfaceVisibility: "hidden",
                            imageRendering: zoomRef.current > 1 ? "pixelated" : "auto",
                          }}
                      />
                    </div>
                  </div>

                  {caption ? (
                      <div
                          className={`
                    absolute bottom-0 left-0 right-0
                    pb-5 text-center text-sm text-white/70
                    transition-opacity duration-200
                    ${isZoomed ? "opacity-0 pointer-events-none" : "opacity-100"}
                  `}
                      >
                        {caption}
                      </div>
                  ) : null}

                  <div
                      className="
                  absolute right-4 bottom-4 z-20
                  flex items-center gap-2
                  rounded-lg border bg-background
                  px-3 py-2 shadow-lg
                "
                      onClick={(e) => e.stopPropagation()}
                  >
                <span className="w-12 text-right text-xs tabular-nums text-muted-foreground select-none">
                  {Math.round(zoomUI * 100)}%
                </span>
                    <Slider
                        value={[zoomUI]}
                        min={MIN_ZOOM}
                        max={MAX_ZOOM}
                        step={0.01}
                        onValueChange={handleSliderChange}
                        className="w-32"
                    />
                  </div>
                </div>,
                document.body,
            )
            : null}
      </>
  )
}