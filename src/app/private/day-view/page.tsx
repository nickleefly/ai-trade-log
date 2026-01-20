"use client";

import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { DayMetricsBar } from "@/components/DayMetricsBar";
import { useEffect, useMemo, useState } from "react";
import { Trades } from "@/types";
import { DailyTradeGroup } from "@/components/day-view/DailyTradeGroup";
import { getCapital } from "@/server/actions/user";

export default function DayViewPage() {
    const tradeRecords = useFilteredTrades();
    const [startCapital, setStartCapital] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            const response = await getCapital();
            if (response && typeof response === "string") {
                setStartCapital(response);
            }
        }
        fetchData();
    }, []);

    const groupedTrades = useMemo(() => {
        const groups: Record<string, Trades[]> = {};

        tradeRecords.forEach((trade) => {
            const date = trade.closeDate || trade.openDate;
            if (!date) return;

            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(trade);
        });

        // Sort dates descending
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [tradeRecords]);

    return (
        <div className="flex flex-col gap-6">
            <DayMetricsBar trades={tradeRecords} />

            <div className="flex flex-col gap-4">
                {groupedTrades.map(([date, trades]) => (
                    <DailyTradeGroup
                        key={date}
                        date={date}
                        trades={trades}
                        startCapital={startCapital}
                    />
                ))}

                {groupedTrades.length === 0 && (
                    <div className="text-center py-20 bg-white border rounded-xl shadow-sm text-zinc-500">
                        No trades found for the selected filters.
                    </div>
                )}
            </div>
        </div>
    );
}
