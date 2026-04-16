import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "./MenuBar.js";
import { TextEditorProps } from "../types/common.types";

const TextEditor = ({ onSave, onChange, content }: TextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
    ],
    content: content || "<p>Start your trading journal entry here...</p>",
    onBlur({ editor }) {
      if (onSave) onSave(editor.getHTML(), "notes");
    },
    onUpdate({ editor }) {
      if (onChange) onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "trading-editor",
      },
    },
  });

  return (
    <div className="trading-editor-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextEditor;
