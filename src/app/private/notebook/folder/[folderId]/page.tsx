"use client";

import { useEffect, useState, use } from "react";
import { Plus, FileText, Search, Filter, SortAsc, Folder, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNotebooks, saveNote } from "@/server/actions/notebook";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { db } from "@/drizzle/db"; // Note: This is client component, can't use db directly.
// I should use a server action to get folder details too.

dayjs.extend(relativeTime);

export default function FolderPage({ params }: { params: Promise<{ folderId: string }> }) {
    const { folderId } = use(params);
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadNotes();
    }, [folderId]);

    const loadNotes = async () => {
        setIsLoading(true);
        const data = await getNotebooks(folderId);
        setNotes(data);
        setIsLoading(false);
    };

    const handleCreateNote = async () => {
        const result = await saveNote(null, {
            title: "Untitled Note",
            type: "trading_plan",
            content: {},
            folderId: folderId
        });

        if (result.success && result.id) {
            router.push(`/private/notebook/note/${result.id}`);
        } else {
            toast.error("Failed to create note");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/private/notebook">
                    <Button variant="ghost" size="icon" className="text-zinc-500">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-100 rounded-lg">
                        <Folder className="h-6 w-6 text-zinc-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-zinc-900">Folder View</h1>
                        <p className="text-zinc-500 mt-0.5">Note list for this section.</p>
                    </div>
                </div>
                <Button onClick={handleCreateNote} className="ml-auto gap-2">
                    <Plus className="h-4 w-4" />
                    New Note
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Search within folder..." className="pl-10" />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                    <SortAsc className="h-4 w-4" />
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 italic text-zinc-400">
                    Loading your thoughts...
                </div>
            ) : notes.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-2xl">
                    <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-zinc-900">No notes in this folder</h3>
                    <p className="text-zinc-500 mt-1 mb-6">Organize your thoughts here.</p>
                    <Button onClick={handleCreateNote} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create a note
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <Link key={note.id} href={`/private/notebook/note/${note.id}`}>
                            <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer h-full border-zinc-200 hover:border-zinc-300 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {note.type.replace("_", " ")}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2 truncate">
                                    {note.title}
                                </h3>
                                <p className="text-zinc-500 text-sm line-clamp-3 mb-4 flex-1">
                                    No content yet.
                                </p>
                                <div className="text-xs text-zinc-400">
                                    Last updated {dayjs(note.updatedAt).fromNow()}
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
