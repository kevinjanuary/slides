import * as Diff from "diff"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useSlideStore } from "~/store/slideStore"
import type { CodeSlide } from "~/types/slide"
import { CodeDiffView } from "./CodeDiffView"
import { CodeHighlight } from "./CodeHighlight"
import Image from "next/image"

interface DiffSegment {
  text: string
  type: "unchanged" | "removed" | "added"
  fromPosition: { top: number; left: number }
}

interface PrecomputedDiff {
  beforeCode: string
  afterCode: string
  segments: DiffSegment[]
}

export function PresentationContent() {
  const [isComputing, setIsComputing] = useState(true)
  const [precomputedDiffs, setPrecomputedDiffs] = useState<PrecomputedDiff[]>(
    []
  )
  const slides = useSlideStore((state) => state.slides)
  const currentSlideIndex = useSlideStore((state) => state.currentSlideIndex)

  const currentSlide = slides[currentSlideIndex]

  // Fungsi untuk menghitung diff antara code steps
  const computeCodeDiffs = (codeSlide: CodeSlide, stepIndex: number) => {
    if (stepIndex === 0) return null
    return {
      beforeCode: codeSlide.steps[stepIndex - 1].value,
      afterCode: codeSlide.steps[stepIndex].value,
      segments: measurePositions(codeSlide, stepIndex),
    }
  }

  useEffect(() => {
    if (!currentSlide || currentSlide.type !== "code") {
      setIsComputing(false)
      return
    }

    const computeAllDiffs = () => {
      const codeSlide = currentSlide as CodeSlide
      const diffs = codeSlide.steps
        .map((_, index) => {
          if (index === 0) return null
          return computeCodeDiffs(codeSlide, index)
        })
        .filter(Boolean) as PrecomputedDiff[]

      setPrecomputedDiffs(diffs)
      setIsComputing(false)
    }

    computeAllDiffs()
  }, [currentSlide])

  // Show loading state while computing
  if (isComputing) {
    return (
      <div className="fixed inset-0 bg-[hsl(220,13%,18%)] flex items-center justify-center">
        <div className="text-white">
          Please wait while we prepare the presentation...
        </div>
      </div>
    )
  }

  if (!currentSlide) return null

  // Handle different slide types
  switch (currentSlide.type) {
    case "code": {
      if (currentSlide.currentStep === 0) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <CodeHighlight code={currentSlide.steps[0].value} preWrap />
          </motion.div>
        )
      }

      const diff = precomputedDiffs[currentSlide.currentStep - 1]
      if (!diff) return null

      return (
        <>
          <motion.div
            key={`animate-${currentSlideIndex}-${currentSlide.currentStep}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.2, delay: 1.7 }}
          >
            <CodeDiffView segments={diff.segments} />
          </motion.div>

          <motion.div
            key={`code-${currentSlideIndex}-${currentSlide.currentStep}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, delay: 1.5 }}
          >
            <CodeHighlight
              code={currentSlide.steps[currentSlide.currentStep].value}
              preWrap
              style={{ lineHeight: "inherit" }}
            />
          </motion.div>
        </>
      )
    }

    case "text":
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-2xl"
        >
          {currentSlide.content}
        </motion.div>
      )

    case "image":
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Image
            src={currentSlide.url}
            alt={currentSlide.caption || ""}
            width={1920}
            height={1080}
            className="max-h-[80vh] object-contain"
          />
          {currentSlide.caption && (
            <p className="text-white text-sm">{currentSlide.caption}</p>
          )}
        </motion.div>
      )

    default:
      return null
  }
}

function measurePositions(codeSlide: CodeSlide, stepIndex: number) {
  const wrapper = document.getElementById("presentation-code-container")
  if (!wrapper) return []

  // Compute diff segments first
  const segments = computeDiffSegments(
    codeSlide.steps[stepIndex - 1].value,
    codeSlide.steps[stepIndex].value
  )

  // Create measurement layers
  const prevLayer = document.createElement("pre") // Changed to pre
  const currentLayer = document.createElement("pre") // Changed to pre
  const wrapperRect = wrapper.getBoundingClientRect()

  // Style untuk hidden layers
  const layerStyle = `
    position: absolute;
    top: 0;
    left: 0;
    visibility: hidden;
    pointer-events: none;
    white-space: pre;
    font-size: inherit;
    font-family: inherit;
    line-height: inherit;
    margin: 0;
    padding: 0;
  `
  prevLayer.style.cssText = layerStyle
  currentLayer.style.cssText = layerStyle

  // Render segments dengan ID yang unik
  let prevHTML = ""
  let currentHTML = ""

  segments.forEach((segment, i) => {
    const segmentId = `segment-${stepIndex}-${i}`

    if (segment.type === "unchanged") {
      prevHTML += `<span id="prev-${segmentId}">${segment.text}</span>`
      currentHTML += `<span id="current-${segmentId}">${segment.text}</span>`
    } else if (segment.type === "removed") {
      prevHTML += `<span id="prev-${segmentId}">${segment.text}</span>`
    } else if (segment.type === "added") {
      currentHTML += `<span id="current-${segmentId}">${segment.text}</span>`
    }
  })

  prevLayer.innerHTML = `<code>${prevHTML}</code>`
  currentLayer.innerHTML = `<code>${currentHTML}</code>`

  wrapper.appendChild(prevLayer)
  wrapper.appendChild(currentLayer)

  // Measure positions
  segments.forEach((segment, i) => {
    const segmentId = `segment-${stepIndex}-${i}`

    const measureElement = (el: Element | null) => {
      if (!el) return null
      const range = document.createRange()
      const textNode = el.firstChild
      if (!textNode) return null

      range.selectNodeContents(textNode)
      const rect = range.getBoundingClientRect()
      return {
        top: rect.top - wrapperRect.top,
        left: rect.left - wrapperRect.left,
      }
    }

    if (segment.type === "unchanged") {
      const prevEl = prevLayer.querySelector(`#prev-${segmentId}`)
      const currentEl = currentLayer.querySelector(`#current-${segmentId}`)

      const prevPos = measureElement(prevEl)
      const currentPos = measureElement(currentEl)

      if (prevPos && currentPos) {
        segment.fromPosition = {
          left: prevPos.left - currentPos.left,
          top: prevPos.top - currentPos.top,
        }
      }
    } else if (segment.type === "added") {
      const pos = measureElement(
        currentLayer.querySelector(`#current-${segmentId}`)
      )
      if (pos) {
        segment.fromPosition = pos
      }
    } else {
      const pos = measureElement(prevLayer.querySelector(`#prev-${segmentId}`))
      if (pos) {
        segment.fromPosition = pos
      }
    }
  })

  wrapper.removeChild(prevLayer)
  wrapper.removeChild(currentLayer)

  return segments
}

function computeDiffSegments(
  beforeCode: string,
  afterCode: string
): DiffSegment[] {
  // Gunakan diffWordsWithSpace untuk tokenisasi kata yang lebih baik
  const diffResult = Diff.diffWordsWithSpace(beforeCode, afterCode)
  const segments: DiffSegment[] = []
  let currentSegment: DiffSegment | null = null

  function pushCurrentSegment() {
    if (currentSegment) {
      segments.push(currentSegment)
      currentSegment = null
    }
  }

  function getTokenType(
    text: string
  ): "newline" | "whitespace" | "word" | "operator" {
    if (text === "\n") return "newline"
    if (/^\s+$/.test(text)) return "whitespace"
    if (/^[a-zA-Z0-9_$]+$/.test(text)) return "word"
    return "operator"
  }

  function shouldStartNewSegment(text: string, type: DiffSegment["type"]) {
    if (!currentSegment || currentSegment.type !== type) return true
    if (text === "\n" || currentSegment.text === "\n") return true
    return getTokenType(text) !== getTokenType(currentSegment.text)
  }

  diffResult.forEach((part) => {
    const type = part.added ? "added" : part.removed ? "removed" : "unchanged"
    const chars = part.value.split("")
    let buffer = ""

    chars.forEach((char, i) => {
      const isLastChar = i === chars.length - 1

      if (char === "\n") {
        // Handle text before newline
        if (buffer) {
          if (shouldStartNewSegment(buffer, type)) {
            pushCurrentSegment()
            currentSegment = {
              text: buffer,
              type,
              fromPosition: { top: 0, left: 0 },
            }
          } else if (currentSegment) {
            currentSegment.text += buffer
          }
        }
        pushCurrentSegment()

        // Create newline segment
        currentSegment = {
          text: "\n",
          type,
          fromPosition: { top: 0, left: 0 },
        }
        pushCurrentSegment()
        buffer = ""
      } else {
        buffer += char

        // Handle last char
        if (isLastChar && buffer) {
          if (shouldStartNewSegment(buffer, type)) {
            pushCurrentSegment()
            currentSegment = {
              text: buffer,
              type,
              fromPosition: { top: 0, left: 0 },
            }
          } else if (currentSegment) {
            currentSegment.text += buffer
          }
        }
      }
    })
  })

  pushCurrentSegment()
  return segments
}
