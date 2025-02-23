import { PlusIcon, PresentationIcon } from "lucide-react"
import { useCallback, useState, useEffect } from "react"
import { CodeHighlight } from "./CodeHighlight"
import { useSlideStore } from "~/store/slideStore"
import { debounce } from "~/utils/debounce"

export function SlideEditor() {
  const slides = useSlideStore((state) => state.slides)
  const currentSlide = useSlideStore((state) => state.currentSlide)
  const updateSlide = useSlideStore((state) => state.updateSlide)
  const setIsPresentationMode = useSlideStore(
    (state) => state.setIsPresentationMode
  )

  // Local state untuk textarea
  const [localValue, setLocalValue] = useState(
    slides[currentSlide]?.value ?? ""
  )

  // Update local value ketika slide berubah
  useEffect(() => {
    setLocalValue(slides[currentSlide]?.value ?? "")
  }, [currentSlide, slides])

  // Debounce update ke store
  const debouncedUpdate = useCallback(
    debounce((value: string) => {
      updateSlide(currentSlide, value)
    }, 500),
    [currentSlide, updateSlide]
  )

  const handleChange = (value: string) => {
    setLocalValue(value) // Update local state immediately
    debouncedUpdate(value) // Debounced update to store
  }

  return (
    <main className="relative container mx-auto p-8 pb-16 flex flex-col justify-center items-center">
      <div className="relative bg-[hsl(220,13%,18%)] p-6 rounded-lg text-white font-mono aspect-video max-w-screen-md w-full">
        {slides.length > 0 ? (
          <>
            <textarea
              spellCheck="false"
              className="absolute inset-0 w-full h-full bg-transparent text-transparent font-mono outline-none resize-none p-6 caret-white"
              placeholder="Type your code here..."
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
            />
            <CodeHighlight code={localValue} preWrap />
          </>
        ) : (
          <div className="h-full flex flex-col gap-4 items-center justify-center text-white/50 select-none">
            <span className="text-2xl">ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧</span>
            <span className="text-xs">
              Click the <PlusIcon size={12} className="inline" /> button to add
              a new slide
            </span>
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-8 flex justify-end mt-4">
        <button
          onClick={() => {
            setIsPresentationMode(true)
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen()
            }
          }}
          className="px-4 py-2 bg-[hsl(220,13%,26%)] hover:bg-[hsl(220,13%,34%)] rounded-lg text-white flex items-center gap-2 text-sm"
        >
          <PresentationIcon size={18} />
          <span className="hidden sm:inline">Presentation</span>
        </button>
      </div>
    </main>
  )
}
