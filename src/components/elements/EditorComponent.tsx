"use client"

import {
  BoldItalicUnderlineToggles,
  InsertImage,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  headingsPlugin,
  imagePlugin,
  listsPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  type MDXEditorMethods,
} from "@mdxeditor/editor"
import { FC } from "react"
import "@mdxeditor/editor/style.css"

interface EditorProps {
  markdown: string
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>
  onChange?: (content: string) => void
}

const Editor: FC<EditorProps> = ({ markdown, editorRef, onChange }) => {
  return (
    <MDXEditor
      className="dark-theme dark-editor w-full h-full"
      contentEditableClassName="prose prose-invert"
      onChange={onChange}
      ref={editorRef}
      markdown={markdown}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        markdownShortcutPlugin(),
        imagePlugin({
          imageUploadHandler: () => {
            return Promise.resolve(
              "https://placehold.co/300x300/png?text=Hello+World"
            )
          },
          imageAutocompleteSuggestions: [
            "https://placehold.co/300x300/png?text=Hello+World",
            "https://placehold.co/200x300/png?text=Hello+World",
          ],
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <ListsToggle />
              <InsertImage />
            </>
          ),
          toolbarClassName:
            "!bg-[hsl(220,13%,26%)] !absolute !-top-12 left-0 z-10",
        }),
      ]}
    />
  )
}

export default Editor
