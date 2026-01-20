import { NotebookSidebar } from "@/components/notebook/NotebookSidebar";

export default function NotebookLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-[calc(100vh-64px)] overflow-hidden">
            <NotebookSidebar />
            <main className="flex-1 overflow-auto bg-zinc-50/50">
                {children}
            </main>
        </div>
    );
}
