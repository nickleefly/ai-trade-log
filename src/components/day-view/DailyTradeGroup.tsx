"use client";

import React, { useState } from "react";
import { Trades } from "@/types";
import { calculateMetrics, formatCurrency } from "@/lib/analyticsEngine";
import { ChevronDown, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import CloseTradesTable from "@/components/history/CloseTradesTable";

interface DailyTradeGroupProps {
    date: string;
    trades: Trades[];
    startCapital: string | null;
}

export const DailyTradeGroup: React.FC<DailyTradeGroupProps> = ({ date, trades, startCapital }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Cast to any for analytics engine compatibility
    const metrics = calculateMetrics(trades as any);

    let formattedDate = date;
    try {
        const parsedDate = parseISO(date);
        if (isValid(parsedDate)) {
            formattedDate = format(parsedDate, "EEEE, MMM d, yyyy");
        }
    } catch (e) {
        console.error("Invalid date:", date);
    }

    const pnlColor = metrics.netPnL > 0 ? "text-buy" : metrics.netPnL < 0 ? "text-sell" : "text-zinc-900";

    // Prepare trades for CloseTradesTable typing
    const closedTrades = (trades as any[]).filter(t => t.closeDate && t.result) as any[];

    return (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50 transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-4">
                    <div className="p-1 rounded-md bg-zinc-100 text-zinc-500">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-zinc-900">{formattedDate}</h3>
                        <p className="text-xs text-zinc-500">{trades.length} trades</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-zinc-400">Total Net P&L</p>
                        <p className={cn("font-bold text-lg", pnlColor)}>
                            {formatCurrency(metrics.netPnL)}
                        </p>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="border-t bg-zinc-50/50 p-4">
                    <CloseTradesTable
                        trades={closedTrades}
                        startCapital={startCapital}
                        total={metrics.netPnL}
                    />
                </div>
            )}
        </div>
    );
};
