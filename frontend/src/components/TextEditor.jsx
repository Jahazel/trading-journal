import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import MenuBar from "./MenuBar";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import { BulletList, ListItem, OrderedList } from "@tiptap/extension-list";

const TextEditor = () => {
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
    content: "<p>Start your trading journal entry here...</p>",
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
