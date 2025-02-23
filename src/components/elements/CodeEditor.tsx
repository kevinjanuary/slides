import { useDebounceCallback } from "~/hooks/useDebounceCallback"
import { CodeHighlight } from "../CodeHighlight"
import { useEffect, useState } from "react"
import { useSlideStore } from "~/store/slideStore"

export function CodeEditor() {
  const [localValue, setLocalValue] = useState("")
  const slides = useSlideStore((state) => state.slides)
  const currentSlideIndex = useSlideStore((state) => state.currentSlideIndex)
  const currentSlide = slides[currentSlideIndex]
  const updateCodeSlide = useSlideStore((state) => state.updateCodeSlide)

  const debouncedUpdate = useDebounceCallback((value: string) => {
    if (currentSlide?.type === "code") {
      updateCodeSlide(currentSlide.id, currentSlide.currentStep, value)
    }
  }, 500)

  const handleChange = (value: string) => {
    setLocalValue(value)
    debouncedUpdate(value)
  }

  useEffect(() => {
    if (currentSlide?.type === "code") {
      setLocalValue(currentSlide.steps[currentSlide.currentStep]?.value ?? "")
    }
  }, [currentSlide])

  return (
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
  )
}
