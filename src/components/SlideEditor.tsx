import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  PresentationIcon,
  Trash2Icon,
} from "lucide-react"
import Image from "next/image"
import { useSlideStore } from "~/store/slideStore"
import { CodeSlide } from "~/types/slide"
import { CodeEditor } from "./elements/CodeEditor"
import { TextEditor } from "./elements/Text"

export function SlideEditor() {
  const slides = useSlideStore((state) => state.slides)
  const currentSlideIndex = useSlideStore((state) => state.currentSlideIndex)
  const addCodeStep = useSlideStore((state) => state.addCodeStep)
  const removeCodeStep = useSlideStore((state) => state.removeCodeStep)
  const setIsPresentationMode = useSlideStore(
    (state) => state.setIsPresentationMode
  )

  const currentSlide = slides[currentSlideIndex]

  // Add step navigation buttons for code slides
  const StepNavigation = ({ slide }: { slide: CodeSlide }) => (
    <div className="flex items-center gap-2 text-sm text-white/80">
      <button
        onClick={() => {
          const newSlides = [...slides]
          const updatedSlide = {
            ...slide,
            currentStep: Math.max(0, slide.currentStep - 1),
          }
          newSlides[currentSlideIndex] = updatedSlide
          useSlideStore.getState().setSlides(newSlides)
        }}
        disabled={slide.currentStep === 0}
        className="p-1 hover:bg-white/10 rounded disabled:opacity-50"
      >
        <ChevronLeftIcon size={16} />
      </button>
      <span>
        Step {slide.currentStep + 1} / {slide.steps.length}
      </span>
      <button
        onClick={() => {
          const newSlides = [...slides]
          const updatedSlide = {
            ...slide,
            currentStep: Math.min(
              slide.steps.length - 1,
              slide.currentStep + 1
            ),
          }
          newSlides[currentSlideIndex] = updatedSlide
          useSlideStore.getState().setSlides(newSlides)
        }}
        disabled={slide.currentStep === slide.steps.length - 1}
        className="p-1 hover:bg-white/10 rounded disabled:opacity-50"
      >
        <ChevronRightIcon size={16} />
      </button>
    </div>
  )

  const PresentationButton = () => (
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
  )

  if (!currentSlide) return null

  return (
    <main className="relative container mx-auto p-8 pb-16 flex flex-col justify-center items-center">
      {currentSlide.type === "code" && (
        <div className="w-full flex justify-between items-center gap-2 mb-4">
          <StepNavigation slide={currentSlide} />
          <div className="flex gap-2">
            <button
              onClick={() =>
                removeCodeStep(currentSlide.id, currentSlide.currentStep)
              }
              disabled={currentSlide.steps.length <= 1}
              className="px-3 py-1 bg-[hsl(220,13%,26%)] hover:bg-[hsl(220,13%,34%)] rounded-lg text-white flex items-center gap-2 text-sm disabled:opacity-50"
            >
              <Trash2Icon size={16} />
              <span>Delete Step</span>
            </button>
            <button
              onClick={() => addCodeStep(currentSlide.id)}
              className="px-3 py-1 bg-[hsl(220,13%,26%)] hover:bg-[hsl(220,13%,34%)] rounded-lg text-white flex items-center gap-2 text-sm"
            >
              <PlusIcon size={16} />
              <span>Add Step</span>
            </button>
          </div>
        </div>
      )}

      <div className="relative bg-[hsl(220,13%,18%)] p-6 rounded-lg text-white font-mono aspect-video max-w-screen-md w-full">
        {currentSlide.type === "code" && <CodeEditor />}

        {currentSlide.type === "text" && <TextEditor />}

        {currentSlide.type === "image" && (
          <div className="h-full flex flex-col gap-4">
            <input
              type="text"
              value={currentSlide.url}
              onChange={(e) => {
                const newSlides = [...slides]
                newSlides[currentSlideIndex] = {
                  ...currentSlide,
                  url: e.target.value,
                }
                useSlideStore.getState().setSlides(newSlides)
              }}
              placeholder="Enter image URL..."
              className="w-full p-2 bg-[hsl(220,13%,26%)] text-white rounded-lg"
            />
            {currentSlide.url && (
              <Image
                src={currentSlide.url}
                alt={currentSlide.caption || ""}
                className="max-h-[60vh] object-contain mt-4"
                width={1920}
                height={1080}
              />
            )}
          </div>
        )}
      </div>

      <PresentationButton />
    </main>
  )
}
