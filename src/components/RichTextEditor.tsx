"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

export function RichTextEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Tulis isi artikel pembangunan secara lengkap..." }),
    ],
    content: "<p>Masukkan latar belakang proyek, detail pekerjaan, progres, dan catatan anggaran.</p>",
    immediatelyRender: false,
  });

  return (
    <div className="rounded border border-zinc-300 bg-white">
      <div className="flex gap-2 border-b border-zinc-200 p-2">
        <button type="button" onClick={() => editor?.chain().focus().toggleBold().run()} className="rounded border px-3 py-1 font-black">B</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleItalic().run()} className="rounded border px-3 py-1 italic">I</button>
        <button type="button" onClick={() => editor?.chain().focus().toggleBulletList().run()} className="rounded border px-3 py-1 font-bold">List</button>
      </div>
      <EditorContent editor={editor} className="prose max-w-none p-4 [&_.ProseMirror]:min-h-64 [&_.ProseMirror]:outline-none" />
    </div>
  );
}
