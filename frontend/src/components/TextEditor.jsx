import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import MenuBar from "./MenuBar";

const TextEditor = ({ onSave, content }) => {
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
      onSave(editor.getHTML(), "notes");
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
