import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./MenuBar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";
import { useEffect } from "react";

const TextEditor = ({ onSave, content }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight,
      BulletList,
      OrderedList,
      ListItem,
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

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(
        content || "<p>Start your trading journal entry here...</p>",
      );
    }
  }, [content, editor]);

  return (
    <div className="trading-editor-container">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TextEditor;
