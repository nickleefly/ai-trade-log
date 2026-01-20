import { Card } from "@/components/ui/card";
import { Trades } from "@/types";
import {
    WinRateByHourChart,
    RollingWinRateChart,
    PlannedVsRealizedScatter
} from "@/components/reports/PerformanceGraphs";
import { CalendarReport } from "@/components/reports/CalendarReport";
import { CompareReport } from "@/components/reports/CompareReport";

interface ReportTabProps {
    trades: Trades[];
}

export function WinRateTab({ trades }: ReportTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WinRateByHourChart trades={trades} title="Win Rate by Time of Day" />
            <RollingWinRateChart trades={trades} title="Rolling Win Rate (20 Trades)" />
        </div>
    );
}

export function PnLTab({ trades }: ReportTabProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlannedVsRealizedScatter trades={trades} title="Planned vs Realized R" />

                {/* Placeholder for future PnL charts */}
                <Card className="p-6">
                    <h4 className="text-sm font-medium text-zinc-500 mb-4">Cumulative PnL Coming Soon</h4>
                    <div className="h-[300px] flex items-center justify-center text-zinc-400 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                        Additional PnL Charts
                    </div>
                </Card>
            </div>
        </div>
    );
}


export function CalendarTab({ trades }: ReportTabProps) {
    return (
        <div className="space-y-4">
            <CalendarReport trades={trades} />
        </div>
    );
}

export function CompareTab({ trades }: ReportTabProps) {
    return (
        <div className="space-y-4">
            <CompareReport filteredTrades={trades} />
        </div>
    );
}
