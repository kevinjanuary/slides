import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MaximizeIcon,
  MinimizeIcon,
  MonitorXIcon,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useSlideStore } from "~/store/slideStore"
import { PresentationContent } from "./PresentationContent"

const PresentationMode = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const currentSlideIndex = useSlideStore((state) => state.currentSlideIndex) // Changed from currentSlide
  const slides = useSlideStore((state) => state.slides)
  const previousStep = useSlideStore((state) => state.previousStep) // Changed from onPreviousSlide
  const nextStep = useSlideStore((state) => state.nextStep) // Changed from onNextSlide
  const setIsPresentationMode = useSlideStore(
    (state) => state.setIsPresentationMode
  )

  const toggleFullscreen = (fullscreen?: boolean) => {
    try {
      if (fullscreen === undefined) {
        if (document.fullscreenElement) {
          return document.exitFullscreen()
        }

        document.documentElement.requestFullscreen()
      } else {
        if (!fullscreen && document.fullscreenElement) {
          return document.exitFullscreen()
        }
        if (fullscreen && !document.fullscreenElement) {
          document.documentElement.requestFullscreen()
        }
      }
    } catch (error) {
      console.error("Failed to toggle fullscreen", error)
    }
  }

  // make sure isFullscreen is in sync with document.fullscreenElement
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    handleFullscreenChange()

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const presentationContainer = document.getElementById(
      "presentation-container"
    )
    if (!presentationContainer) return

    const handleKeydown = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.key === "ArrowLeft") {
        previousStep()
      }
      if (e.key === "ArrowRight") {
        nextStep()
      }
      if (e.key === "f") {
        toggleFullscreen()
      }
      if (e.key === "Escape") {
        setIsPresentationMode(false)
      }
    }

    const handlePrevSlide = (e: MouseEvent) => {
      e.preventDefault()
      previousStep()
    }

    document.addEventListener("keydown", handleKeydown)
    presentationContainer.addEventListener("click", nextStep)
    presentationContainer.addEventListener("contextmenu", handlePrevSlide)
    return () => {
      document.removeEventListener("keydown", handleKeydown)
      presentationContainer.removeEventListener("click", nextStep)
      presentationContainer.removeEventListener("contextmenu", handlePrevSlide)
    }
  }, [nextStep, previousStep, setIsPresentationMode])

  return (
    <div className="fixed inset-0 bg-[hsl(220,13%,10%)] flex items-center justify-center select-none">
      <div
        className="max-w-screen-lg w-full bg-[hsl(220,13%,18%)] p-8 pt-0 rounded-lg aspect-video"
        id="presentation-container"
      >
        <div className="flex pt-6 pb-4 justify-between items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="size-3 bg-red-500 rounded-full"></span>
            <span className="size-3 bg-yellow-500 rounded-full"></span>
            <span className="size-3 bg-green-500 rounded-full"></span>
          </div>
          <h1>GDGOC.jsx</h1>
          <div className="text-white">
            {currentSlideIndex + 1} / {slides.length}
          </div>
        </div>
        <pre
          className="text-xl leading-relaxed overflow-hidden whitespace-pre-wrap relative h-full pointer-events-none select-none"
          id="presentation-code-container"
        >
          <PresentationContent />
        </pre>
      </div>
      <div className="fixed bottom-4 left-4 flex gap-4 opacity-50">
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFullscreen(false)
            setIsPresentationMode(false)
          }}
          className="px-4 py-2 bg-[hsl(220,13%,26%)] hover:bg-[hsl(220,13%,34%)] rounded-lg text-white flex items-center gap-2 text-sm"
        >
          <MonitorXIcon size={18} />
          <span className="hidden sm:inline">Exit</span>
        </button>
        {document.fullscreenEnabled && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleFullscreen()
            }}
            className="px-4 py-2 bg-[hsl(220,13%,26%)] hover:bg-[hsl(220,13%,34%)] rounded-lg text-white flex items-center gap-2 text-sm"
          >
            {isFullscreen ? (
              <>
                <MinimizeIcon size={18} />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <MaximizeIcon size={18} />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        )}
      </div>
      <div className="fixed bottom-4 right-4 flex gap-4 opacity-50">
        <button
          onClick={(e) => {
            e.stopPropagation()
            previousStep()
          }}
          className="px-4 py-2 bg-[hsl(220,13%,26%)] hover:bg-[hsl(220,13%,34%)] rounded-lg text-white flex items-center gap-2 text-sm disabled:bg-[hsl(220,13%,26%)] disabled:opacity-50"
          disabled={currentSlideIndex === 0}
        >
          <ArrowLeftIcon size={18} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            nextStep()
          }}
          className="px-4 py-2 bg-[hsl(220,13%,26%)] hover:bg-[hsl(220,13%,34%)] rounded-lg text-white flex items-center gap-2 text-sm disabled:bg-[hsl(220,13%,26%)] disabled:opacity-50"
          disabled={currentSlideIndex === slides.length - 1}
        >
          <span className="hidden sm:inline">Next</span>
          <ArrowRightIcon size={18} />
        </button>
      </div>
    </div>
  )
}

export default PresentationMode
