"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import { useEffect, useState, useCallback } from "react";
import {
    Loader2,
    Save,
    Bold,
    Italic,
    Strikethrough,
    Code,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Heading1,
    Heading2,
    Heading3,
    Image as ImageIcon,
    Link as LinkIcon,
    Trash2,
    ChevronLeft
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { saveNote, deleteNote } from "@/server/actions/notebook";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
    noteId: string;
    initialData: {
        title: string;
        content: any;
        type: "trading_plan" | "loss_recap" | "template" | "weekly_review";
        folderId?: string | null;
    };
}

const MenuBar = ({ editor }: { editor: Editor }) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt("Enter image URL");
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    const buttonClass = (isActive: boolean) =>
        cn(
            "p-2 rounded hover:bg-zinc-100 transition-colors",
            isActive ? "bg-zinc-200 text-zinc-900" : "text-zinc-600"
        );

    return (
        <div className="border border-zinc-200 rounded-lg p-2 mb-4 flex flex-wrap gap-1 bg-white sticky top-0 z-10 shadow-sm">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={buttonClass(editor.isActive("bold"))}
                title="Bold"
            >
                <Bold className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={buttonClass(editor.isActive("italic"))}
                title="Italic"
            >
                <Italic className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={buttonClass(editor.isActive("strike"))}
                title="Strikethrough"
            >
                <Strikethrough className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={buttonClass(editor.isActive("code"))}
                title="Code"
            >
                <Code className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-200 mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 1 }))}
                title="Heading 1"
            >
                <Heading1 className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={buttonClass(editor.isActive("heading", { level: 2 }))}
                title="Heading 2"
            >
                <Heading2 className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-200 mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={buttonClass(editor.isActive("bulletList"))}
                title="Bullet List"
            >
                <List className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={buttonClass(editor.isActive("orderedList"))}
                title="Numbered List"
            >
                <ListOrdered className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-200 mx-1 self-center" />

            <button
                type="button"
                onClick={addImage}
                className={buttonClass(false)}
                title="Add Image"
            >
                <ImageIcon className="h-4 w-4" />
            </button>

            <div className="w-px h-6 bg-zinc-200 mx-1 self-center" />

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className={cn(buttonClass(false), "disabled:opacity-30")}
                title="Undo"
            >
                <Undo className="h-4 w-4" />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className={cn(buttonClass(false), "disabled:opacity-30")}
                title="Redo"
            >
                <Redo className="h-4 w-4" />
            </button>
        </div>
    );
};

export function NoteEditor({ noteId, initialData }: NoteEditorProps) {
    const [title, setTitle] = useState(initialData.title);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const router = useRouter();

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Start typing your trading reflections...",
            }),
            ImageExtension.configure({
                HTMLAttributes: {
                    class: "rounded-lg border border-zinc-200 my-4 max-w-full h-auto",
                },
            }),
            LinkExtension.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-blue-600 underline hover:text-blue-800",
                },
            }),
        ],
        content: initialData.content,
        immediatelyRender: false,
        onUpdate: () => {
            setHasUnsavedChanges(true);
        },
        editorProps: {
            attributes: {
                class: "prose prose-zinc prose-lg max-w-none focus:outline-none min-h-[500px]",
            },
        },
    });

    const handleSave = useCallback(async () => {
        if (!editor) return;

        setIsSaving(true);
        try {
            const content = editor.getJSON();
            const result = await saveNote(noteId, {
                title,
                type: initialData.type,
                content,
                folderId: initialData.folderId,
            });

            if (result.success) {
                setHasUnsavedChanges(false);
                toast.success("Note saved");
            } else {
                toast.error(result.error || "Failed to save note");
            }
        } catch (error) {
            toast.error("Failed to save note");
        } finally {
            setIsSaving(false);
        }
    }, [editor, noteId, title, initialData.type, initialData.folderId]);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        setIsDeleting(true);
        try {
            const result = await deleteNote(noteId);
            if (result.success) {
                toast.success("Note deleted");
                router.push("/private/notebook");
            } else {
                toast.error(result.error || "Failed to delete note");
                setIsDeleting(false);
            }
        } catch {
            toast.error("Failed to delete note");
            setIsDeleting(false);
        }
    };

    // Auto-save logic (debounced)
    useEffect(() => {
        if (!hasUnsavedChanges) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 3000);

        return () => clearTimeout(timer);
    }, [hasUnsavedChanges, handleSave]);

    if (!editor) return null;

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Toolbar Top */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-200">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Input
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setHasUnsavedChanges(true);
                        }}
                        className="text-xl font-bold border-none shadow-none focus-visible:ring-0 p-0 h-auto w-[400px]"
                        placeholder="Note Title"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-xs text-zinc-400 mr-2 italic">
                        {isSaving ? "Saving..." : hasUnsavedChanges ? "Unsaved changes" : "All changes saved"}
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-zinc-400 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        size="sm"
                        className="gap-2"
                    >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Save
                    </Button>
                </div>
            </div>

            {/* Editor Area */}
            <ScrollArea className="flex-1 p-8">
                <div className="max-w-4xl mx-auto">
                    <MenuBar editor={editor} />
                    <EditorContent editor={editor} className="mt-8" />
                </div>
            </ScrollArea>
        </div>
    );
}
