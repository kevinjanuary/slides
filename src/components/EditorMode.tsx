import { SlideList } from "./SlideList"
import { SlideEditor } from "./SlideEditor"

export function EditorMode() {
  return (
    <div className="bg-[hsl(220,13%,10%)] h-screen font-[family-name:var(--font-geist-sans)] p-6 grid grid-cols-[200px_auto]">
      <SlideList />
      <SlideEditor />
    </div>
  )
}
