import * as Diff from "diff"
import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { useSlideStore } from "~/store/slideStore"
import { CodeDiffView } from "./CodeDiffView"
import { CodeHighlight } from "./CodeHighlight"

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
  const currentSlide = useSlideStore((state) => state.currentSlide)

  useEffect(() => {
    function measurePositions(slideIndex: number) {
      const wrapper = document.getElementById("presentation-code-container")
      if (!wrapper) return []

      // Compute diff segments first
      const segments = computeDiffSegments(
        slides[slideIndex - 1].value,
        slides[slideIndex].value
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
        const segmentId = `segment-${slideIndex}-${i}`

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
        const segmentId = `segment-${slideIndex}-${i}`

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
          const pos = measureElement(
            prevLayer.querySelector(`#prev-${segmentId}`)
          )
          if (pos) {
            segment.fromPosition = pos
          }
        }
      })

      // wrapper.removeChild(prevLayer)
      // wrapper.removeChild(currentLayer)

      return segments
    }

    const computeAllDiffs = () => {
      const diffs = slides
        .map((_, index) => {
          if (index === 0) return null

          const beforeCode = slides[index - 1].value
          const afterCode = slides[index].value
          const segments = measurePositions(index)

          return {
            beforeCode,
            afterCode,
            segments,
          }
        })
        .filter(Boolean) as PrecomputedDiff[]

      setPrecomputedDiffs(diffs)
      setIsComputing(false)
    }

    computeAllDiffs()
  }, [slides])

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

  if (currentSlide === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <CodeHighlight code={slides[0].value} />
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        key={`animate-${currentSlide}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.2, delay: 1.7 }}
      >
        <CodeDiffView
          key={currentSlide}
          segments={precomputedDiffs[currentSlide - 1].segments}
        />
      </motion.div>

      <motion.div
        key={`code-${currentSlide}`}
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: 1.5 }}
      >
        <CodeHighlight
          style={{
            lineHeight: "inherit",
          }}
          code={slides[currentSlide].value}
          preWrap
        />
      </motion.div>
    </>
  )
}

// function computeDiffSegments(
//   beforeCode: string,
//   afterCode: string
// ): DiffSegment[] {
//   const diffChars = Diff.diffChars(beforeCode, afterCode)

//   const segments: DiffSegment[] = []
//   let currentSegment: DiffSegment | null = null

//   function pushCurrentSegment() {
//     if (currentSegment) {
//       segments.push(currentSegment)
//       currentSegment = null
//     }
//   }

//   function getTokenType(
//     text: string
//   ): "newline" | "whitespace" | "word" | "operator" {
//     if (text === "\n") return "newline"
//     if (/^\s+$/.test(text)) return "whitespace"
//     if (/^[a-zA-Z0-9_$]+$/.test(text)) return "word"
//     return "operator"
//   }

//   function shouldStartNewSegment(text: string, type: DiffSegment["type"]) {
//     if (!currentSegment || currentSegment.type !== type) return true

//     // Prioritaskan pemisahan newline
//     if (text.includes("\n") || currentSegment.text.includes("\n")) return true

//     // Satukan jika tipe token sama
//     return getTokenType(text) !== getTokenType(currentSegment.text)
//   }

//   diffChars.forEach((part) => {
//     console.log(part)
//     const type = part.added ? "added" : part.removed ? "removed" : "unchanged"
//     let buffer = ""
//     const chars = part.value.split("")

//     chars.forEach((char, i) => {
//       buffer += char
//       const isLastChar = i === chars.length - 1

//       if (isLastChar || char === "\n") {
//         if (shouldStartNewSegment(buffer, type)) {
//           pushCurrentSegment()
//           currentSegment = {
//             text: buffer,
//             type,
//             fromPosition: { top: 0, left: 0 },
//           }
//         } else if (currentSegment) {
//           currentSegment.text += buffer
//         }
//         buffer = ""
//       }
//     })
//   })

//   pushCurrentSegment()

//   console.log(segments)
//   return segments
// }

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
