import { PlusIcon, Trash2Icon } from "lucide-react"
import { CodeHighlight } from "./CodeHighlight"
import { useSlideStore } from "~/store/slideStore"

export function SlideList() {
  const slides = useSlideStore((state) => state.slides)
  const currentSlide = useSlideStore((state) => state.currentSlide)
  const setCurrentSlide = useSlideStore((state) => state.setCurrentSlide)
  const deleteSlide = useSlideStore((state) => state.deleteSlide)
  const addSlide = useSlideStore((state) => state.addSlide)

  const handleDeleteSlide = (index: number) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      deleteSlide(index)
    }
  }

  return (
    <div className="h-[calc(100vh-3rem)] overflow-overlay rounded-lg bg-[hsl(220,13%,26%)] p-4 text-xs">
      {slides.map((slide, index) => (
        <pre
          key={index}
          onClick={() => setCurrentSlide(index)}
          className={`relative p-3 bg-[hsl(220,13%,18%)] shadow-sm rounded-lg mb-4 aspect-video select-none cursor-pointer overflow-hidden ${
            currentSlide === index ? "ring-2 ring-white/20" : ""
          }`}
        >
          <div className="transform scale-[0.3] origin-top-left w-[333%] h-[333%] overflow-hidden">
            <CodeHighlight code={slide.value} />
          </div>

          <button
            className="absolute top-2 right-2 rounded-md bg-white/10 size-6 hover:bg-white/20 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteSlide(index)
            }}
          >
            <Trash2Icon size={12} />
          </button>
        </pre>
      ))}
      <button
        className="flex items-center justify-center bg-[hsl(220,13%,18%)] hover:bg-[hsl(220,13%,20%)] aspect-video w-full p-2 rounded-lg"
        onClick={addSlide}
      >
        <PlusIcon size={24} />
      </button>
    </div>
  )
}
