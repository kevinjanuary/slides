import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd"
import {
  CodeIcon,
  FileTextIcon,
  ImageIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { useSlideStore } from "~/store/slideStore"
import type { Slide } from "~/types/slide"
import { CodeHighlight } from "./CodeHighlight"
import { TextViewer } from "./elements/Text"

const renderSlidePreview = (slide: Slide) => {
  switch (slide.type) {
    case "code":
      const lastStep = slide.steps[slide.steps.length - 1]
      return <CodeHighlight code={lastStep.value} />
    case "text":
      return <TextViewer content={slide.content} />
    case "image":
      return (
        <Image
          src={slide.url}
          alt={slide.caption || ""}
          className="object-contain"
          fill
        />
      )
    default:
      return null
  }
}

const DraggableSlide = ({
  slide,
  index,
  currentSlideIndex,
  onDelete,
}: {
  slide: Slide
  index: number
  currentSlideIndex: number
  onDelete: (index: number) => void
}) => {
  return (
    <Draggable draggableId={slide.id} index={index}>
      {(provided) => (
        <pre
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`relative bg-[hsl(220,13%,18%)] shadow-sm rounded-lg mb-4 aspect-video select-none !cursor-default overflow-hidden ${
            currentSlideIndex === index ? "ring-2 ring-white/20" : ""
          }`}
          onClick={() => useSlideStore.getState().setCurrentSlideIndex(index)}
        >
          <div className="transform scale-[0.3] origin-top-left w-[333%] h-[333%] overflow-hidden pointer-events-none select-none">
            {renderSlidePreview(slide)}
          </div>
          <button
            className="absolute top-2 right-2 rounded-md bg-black/30 size-6 hover:bg-black/70 flex items-center justify-center"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(index)
            }}
          >
            <Trash2Icon size={12} />
          </button>
          <span className="capitalize text-[9px] px-1 py-0.5 rounded-md bg-black/30 text-white absolute bottom-2 left-2">
            {slide.type}
          </span>
        </pre>
      )}
    </Draggable>
  )
}

export function SlideList() {
  const slides = useSlideStore((state) => state.slides)
  const setSlides = useSlideStore((state) => state.setSlides)
  const currentSlideIndex = useSlideStore((state) => state.currentSlideIndex)
  const setCurrentSlideIndex = useSlideStore(
    (state) => state.setCurrentSlideIndex
  )
  const deleteSlide = useSlideStore((state) => state.deleteSlide)
  const addSlide = useSlideStore((state) => state.addSlide)
  const [showAddMenu, setShowAddMenu] = useState(false)

  const handleDeleteSlide = (index: number) => {
    if (confirm("Are you sure you want to delete this slide?")) {
      deleteSlide(index)
    }
  }

  const AddSlideMenu = () => (
    <div className="absolute bottom-20 left-0 right-0 bg-[hsl(220,13%,26%)] rounded-lg overflow-hidden shadow-lg">
      <button
        onClick={() => {
          addSlide("code")
          setShowAddMenu(false)
        }}
        className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[hsl(220,13%,22%)] text-white"
      >
        <CodeIcon size={16} />
        <span>Code Slide</span>
      </button>
      <button
        onClick={() => {
          addSlide("text")
          setShowAddMenu(false)
        }}
        className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[hsl(220,13%,22%)] text-white"
      >
        <FileTextIcon size={16} />
        <span>Text Slide</span>
      </button>
      <button
        onClick={() => {
          addSlide("image")
          setShowAddMenu(false)
        }}
        className="w-full px-4 py-3 flex items-center gap-2 hover:bg-[hsl(220,13%,22%)] text-white"
      >
        <ImageIcon size={16} />
        <span>Image Slide</span>
      </button>
    </div>
  )

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    const newSlides = [...slides]
    const [movedSlide] = newSlides.splice(sourceIndex, 1)
    newSlides.splice(destinationIndex, 0, movedSlide)

    setSlides(newSlides)

    // Update currentSlideIndex if needed
    if (currentSlideIndex === sourceIndex) {
      setCurrentSlideIndex(destinationIndex)
    } else if (
      currentSlideIndex > sourceIndex &&
      currentSlideIndex <= destinationIndex
    ) {
      setCurrentSlideIndex(currentSlideIndex - 1)
    } else if (
      currentSlideIndex < sourceIndex &&
      currentSlideIndex >= destinationIndex
    ) {
      setCurrentSlideIndex(currentSlideIndex + 1)
    }
  }

  return (
    <div className="relative h-[calc(100vh-3rem)] overflow-overlay rounded-lg p-4 text-xs">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {slides.map((slide, index) => (
                <DraggableSlide
                  key={slide.id}
                  slide={slide}
                  index={index}
                  currentSlideIndex={currentSlideIndex}
                  onDelete={handleDeleteSlide}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="relative">
        <button
          className="flex items-center justify-center bg-[hsl(220,13%,18%)] hover:bg-[hsl(220,13%,20%)] aspect-video w-full p-2 rounded-lg"
          onClick={() => setShowAddMenu(!showAddMenu)}
        >
          <PlusIcon size={24} />
        </button>
        {showAddMenu && <AddSlideMenu />}
      </div>
    </div>
  )
}
