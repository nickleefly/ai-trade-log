"use client";

import { useEffect, useState } from "react";
import {
    Folder,
    Plus,
    MoreVertical,
    Star,
    Clock,
    ChevronRight,
    ChevronDown,
    Search,
    FileText,
    Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    getFolders,
    createFolder
} from "@/server/actions/notebook";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface FolderItem {
    id: string;
    name: string;
    color: string | null;
}

export function NotebookSidebar() {
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const pathname = usePathname();

    useEffect(() => {
        loadFolders();
    }, []);

    const loadFolders = async () => {
        const data = await getFolders();
        setFolders(data);
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;

        const result = await createFolder(newFolderName);
        if (result.success) {
            toast.success("Folder created");
            setNewFolderName("");
            setIsCreateFolderOpen(false);
            loadFolders();
        } else {
            toast.error("Failed to create folder");
        }
    };

    const navItems = [
        { icon: Star, label: "Starred", href: "/private/notebook/starred" },
        { icon: Clock, label: "Recent", href: "/private/notebook" },
        { icon: FileText, label: "Templates", href: "/private/notebook/templates" },
    ];

    return (
        <aside className="w-64 border-r border-zinc-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-zinc-100">
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search notes..."
                        className="pl-9 bg-zinc-50 border-none h-9 focus-visible:ring-1"
                    />
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-3 space-y-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                pathname === item.href
                                    ? "bg-zinc-100 text-zinc-900"
                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </div>

                <div className="mt-6 px-4 mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Folders
                    </span>
                    <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                        <DialogTrigger asChild>
                            <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                                <Plus className="h-4 w-4" />
                            </button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create Folder</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                                <Input
                                    placeholder="Folder name"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                />
                                <Button onClick={handleCreateFolder} className="w-full">
                                    Create
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="px-3 space-y-1">
                    {folders.map((folder) => (
                        <Link
                            key={folder.id}
                            href={`/private/notebook/folder/${folder.id}`}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                                pathname.includes(folder.id)
                                    ? "bg-zinc-100 text-zinc-900"
                                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                            )}
                        >
                            <Folder className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600" />
                            <span className="flex-1 truncate">{folder.name}</span>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 px-4 mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                        Tags
                    </span>
                    <button className="text-zinc-400 hover:text-zinc-600 transition-colors">
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                <div className="px-3 space-y-1">
                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 cursor-pointer">
                        <Tag className="h-4 w-4 text-emerald-500" />
                        <span>Winning Setups</span>
                    </div>
                </div>
            </ScrollArea>

            <div className="p-4 border-t border-zinc-100">
                <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-zinc-600 hover:bg-zinc-50">
                    <Plus className="h-4 w-4" />
                    New Note
                </Button>
            </div>
        </aside>
    );
}
