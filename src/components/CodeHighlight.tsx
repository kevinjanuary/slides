import { CSSProperties } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

interface CodeHighlightProps {
  code: string
  className?: string
  style?: CSSProperties
  preWrap?: boolean
}

// Buat custom theme berdasarkan oneDark tanpa background
const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "transparent",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
  },
  token: {
    ...oneDark["token"],
    background: "transparent",
  },
}

const customThemePreWrap = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "transparent",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    whiteSpace: "pre-wrap",
  },
  token: {
    ...oneDark["token"],
    background: "transparent",
  },
}

export function CodeHighlight({
  code,
  className = "",
  style,
  preWrap = false,
}: CodeHighlightProps) {
  return (
    <SyntaxHighlighter
      language="jsx"
      style={preWrap ? customThemePreWrap : customTheme}
      customStyle={{
        ...style,
        background: "transparent",
        padding: 0,
        margin: 0,
        display: "inline",
        wordSpacing: "normal",
        wordBreak: "normal",
        overflowWrap: "normal",
      }}
      className={className}
      wrapLongLines={true}
      useInlineStyles={true}
    >
      {code}
    </SyntaxHighlighter>
  )
}
