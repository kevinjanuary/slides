"use client"

import { EditorMode } from "~/components/EditorMode"
import PresentationMode from "~/components/PresentationMode"
import { useSlideStore } from "~/store/slideStore"

export default function Home() {
  const isPresentationMode = useSlideStore((state) => state.isPresentationMode)
  return isPresentationMode ? <PresentationMode /> : <EditorMode />
}
