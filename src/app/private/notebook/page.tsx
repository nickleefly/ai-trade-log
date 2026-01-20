"use client";

import { useEffect, useState } from "react";
import { Plus, FileText, Search, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getNotebooks, saveNote } from "@/server/actions/notebook";
import { Card } from "@/components/ui/card";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

dayjs.extend(relativeTime);

export default function NotebookPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setIsLoading(true);
        const data = await getNotebooks();
        setNotes(data);
        setIsLoading(false);
    };

    const handleCreateNote = async () => {
        const result = await saveNote(null, {
            title: "Untitled Note",
            type: "trading_plan",
            content: {},
        });

        if (result.success && result.id) {
            router.push(`/private/notebook/note/${result.id}`);
        } else {
            toast.error("Failed to create note");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Notebook</h1>
                    <p className="text-zinc-500 mt-1">Manage your trading plans and reflections.</p>
                </div>
                <Button onClick={handleCreateNote} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Note
                </Button>
            </div>

            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input placeholder="Search notes..." className="pl-10" />
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
                    <h3 className="text-lg font-medium text-zinc-900">No notes yet</h3>
                    <p className="text-zinc-500 mt-1 mb-6">Start documenting your strategy today.</p>
                    <Button onClick={handleCreateNote} variant="outline" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create your first note
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
                                    {/* Content preview would go here */}
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
