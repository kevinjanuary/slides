"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import type { TextElement as TextElementType } from "~/types/slide"

const EditorComp = dynamic(() => import("./EditorComponent"), { ssr: false })

interface TextElementProps {
  element: TextElementType
  onTextChange?: (text: string) => void
}

export function TextElement({ element }: TextElementProps) {
  const placeholder = element.type === "text" ? element.content : ""

  return (
    <div className="w-full h-full">
      <Suspense
        fallback={<div className="w-full h-full p-4">{placeholder}</div>}
      >
        <Suspense fallback={null}>
          <EditorComp markdown="" />
        </Suspense>
      </Suspense>
    </div>
  )
}
