import Filtering from "@/components/Filtering";
import CSVImportDialog from "@/components/csv-import/CSVImportDialog";
import { ReactNode } from "react";

export default function HistoryLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col h-full">
            <div className="px-3 md:px-6 flex items-center justify-between py-2 border-b border-zinc-200">
                <div className="flex-1 overflow-hidden">
                    <Filtering isStatisticsPage={false} />
                </div>
                <div className="ml-4 shrink-0">
                    <CSVImportDialog />
                </div>
            </div>
            <section className="flex-1 overflow-auto px-2 md:px-6">
                {children}
            </section>
        </div>
    );
}
