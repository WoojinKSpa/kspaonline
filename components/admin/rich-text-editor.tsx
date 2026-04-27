"use client";

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  /** The hidden <input> name that gets submitted with the form */
  name: string;
  /** Initial HTML content */
  defaultValue?: string | null;
  /** Placeholder text shown when editor is empty */
  placeholder?: string;
  /** Min height class e.g. "min-h-[160px]" */
  minHeight?: string;
};

type ToolbarButtonProps = {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
};

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "flex size-8 items-center justify-center rounded-lg text-sm transition-colors",
        isActive
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="mx-1 h-5 w-px bg-border" />;
}

export function RichTextEditor({
  name,
  defaultValue,
  placeholder = "Start typing…",
  minHeight = "min-h-[160px]",
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        code: false,
        codeBlock: false,
        blockquote: false,
      }),
      Underline,
    ],
    content: defaultValue || "",
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none focus:outline-none px-4 py-3",
          minHeight,
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold",
          "[&_strong]:font-semibold [&_em]:italic [&_u]:underline",
          "[&_hr]:border-border [&_p]:leading-6"
        ),
      },
    },
    immediatelyRender: false,
  });

  // Attach a 'formdata' listener to the parent <form>.
  // This fires synchronously when the browser collects form data,
  // guaranteeing the current editor HTML is included at submit time.
  useEffect(() => {
    if (!editor) return;
    const form = containerRef.current?.closest("form");
    if (!form) return;

    const handleFormData = (e: FormDataEvent) => {
      // Remove any stale value from the hidden input, then inject the live HTML
      e.formData.delete(name);
      const html = editor.getHTML();
      // Don't submit an empty paragraph as content
      if (html && html !== "<p></p>") {
        e.formData.append(name, html);
      }
    };

    form.addEventListener("formdata", handleFormData);
    return () => form.removeEventListener("formdata", handleFormData);
  }, [editor, name]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-2xl border border-input bg-background focus-within:ring-2 focus-within:ring-ring"
    >
      {/* Toolbar + editor — only shown once Tiptap has initialised client-side */}
      {editor ? (
        <>
          <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-secondary/30 px-2 py-1.5">
            {/* History */}
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
              <Undo className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
              <Redo className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Headings */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive("heading", { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive("heading", { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Inline formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold"
            >
              <Bold className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic"
            >
              <Italic className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline"
            >
              <UnderlineIcon className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet list"
            >
              <List className="size-3.5" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered list"
            >
              <ListOrdered className="size-3.5" />
            </ToolbarButton>

            <Divider />

            {/* Divider line */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Divider line"
            >
              <Minus className="size-3.5" />
            </ToolbarButton>
          </div>

          <div className="relative">
            {editor.isEmpty && (
              <p className="pointer-events-none absolute px-4 py-3 text-sm text-muted-foreground/60">
                {placeholder}
              </p>
            )}
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        /* Skeleton shown during SSR / before hydration */
        <div className={cn("px-4 py-3 text-sm text-muted-foreground/60", minHeight)}>
          {placeholder}
        </div>
      )}
    </div>
  );
}
