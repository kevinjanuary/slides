"use client"

import { MDXEditorMethods } from "@mdxeditor/editor"
import dynamic from "next/dynamic"
import { Suspense, useRef } from "react"
import { useSlideStore } from "~/store/slideStore"
import { useDebounceCallback } from "~/hooks/useDebounceCallback"

const EditorComp = dynamic(() => import("./EditorComponent"), { ssr: false })

export function TextEditor() {
  const ref = useRef<MDXEditorMethods>(null)
  const slides = useSlideStore((state) => state.slides)
  const currentSlideIndex = useSlideStore((state) => state.currentSlideIndex)
  const updateSlideContent = useSlideStore((state) => state.updateSlideContent)
  const currentSlide = slides[currentSlideIndex]

  const handleChange = useDebounceCallback((content: string) => {
    updateSlideContent(content)
  }, 1000)

  if (currentSlide.type !== "text") {
    return null
  }

  return (
    <Suspense fallback={null}>
      <EditorComp
        editorRef={ref}
        markdown={currentSlide.content}
        onChange={handleChange}
      />
    </Suspense>
  )
}

export function TextViewer({ content }: { content: string }) {
  return (
    <Suspense fallback={null}>
      <EditorComp markdown={content} />
    </Suspense>
  )
}
