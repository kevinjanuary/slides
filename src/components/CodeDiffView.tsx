import { motion } from "framer-motion"
import { CodeHighlight } from "./CodeHighlight"

interface CodeDiffViewProps {
  segments: Array<{
    text: string
    type: "unchanged" | "removed" | "added"
    fromPosition: { top: number; left: number }
  }>
}

const addedInitial = {
  opacity: 0,
}
const addedAnimate = {
  opacity: 1,
}

const removedInitial = {
  opacity: 1,
}
const removedAnimate = {
  opacity: 0,
  display: "none",
}

export function CodeDiffView({ segments }: CodeDiffViewProps) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === "unchanged") {
          return (
            <span key={`unchanged-${index}`} className="relative">
              <motion.span
                style={{
                  display: "inline",
                  position: "absolute",
                }}
                data-x={segment.fromPosition.left}
                data-y={segment.fromPosition.top}
                initial={{
                  x: segment.fromPosition.left,
                  y: segment.fromPosition.top,
                }}
                animate={{
                  x: 0,
                  y: 0,
                }}
                transition={{
                  duration: 1,
                }}
              >
                <CodeHighlight code={segment.text} />
              </motion.span>
              <span className="opacity-0">{segment.text}</span>
            </span>
          )
        }

        const isAdded = segment.type === "added"

        return (
          <motion.span
            key={`${segment.type}-${index}`}
            style={{
              display: "inline",
            }}
            initial={isAdded ? addedInitial : removedInitial}
            animate={isAdded ? addedAnimate : removedAnimate}
            transition={{
              duration: 0.5,
              delay: isAdded ? 1 : 0,
            }}
          >
            <CodeHighlight code={segment.text} />
          </motion.span>
        )
      })}
    </>
  )
}
