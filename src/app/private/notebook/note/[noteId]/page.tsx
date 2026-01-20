import { getNote } from "@/server/actions/notebook";
import { NoteEditor } from "@/components/notebook/NoteEditor";
import { notFound } from "next/navigation";

export default async function NotePage({
    params,
}: {
    params: Promise<{ noteId: string }>;
}) {
    const { noteId } = await params;
    const note = await getNote(noteId);

    if (!note) {
        notFound();
    }

    return (
        <NoteEditor
            noteId={noteId}
            initialData={{
                title: note.title,
                content: note.content,
                type: note.type as any,
                folderId: note.folderId,
            }}
        />
    );
}
