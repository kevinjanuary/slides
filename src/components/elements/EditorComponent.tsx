"use client"

import {
  InsertImage,
  MDXEditor,
  headingsPlugin,
  imagePlugin,
  listsPlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  type MDXEditorMethods,
} from "@mdxeditor/editor"
import { FC } from "react"

interface EditorProps {
  markdown: string
  editorRef?: React.MutableRefObject<MDXEditorMethods | null>
}

const Editor: FC<EditorProps> = ({ markdown, editorRef }) => {
  return (
    <MDXEditor
      onChange={(e) => console.log(e)}
      ref={editorRef}
      markdown={markdown}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        markdownShortcutPlugin(),
        imagePlugin({
          imageUploadHandler: () => {
            return Promise.resolve(
              "https://placehold.co/300x300?text=Hello+World"
            )
          },
          imageAutocompleteSuggestions: [
            "https://placehold.co/300x300?text=Hello+World",
            "https://placehold.co/200x300?text=Hello+World",
          ],
        }),
        toolbarPlugin({
          toolbarContents: () => <InsertImage />,
        }),
      ]}
    />
  )
}

export default Editor
