"use client";

import React, { useMemo } from "react";
import { Trades } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/analyticsEngine";
import { startOfWeek, endOfWeek, format, parseISO, subWeeks, isWithinInterval } from "date-fns";
import { TrendingUp, TrendingDown, Clock } from "lucide-react";

interface WeeklySummaryProps {
    trades: Trades[];
}

interface WeekData {
    weekStart: Date;
    weekEnd: Date;
    pnl: number;
    tradeCount: number;
    winRate: number;
    isCurrent: boolean;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ trades }) => {
    const weeklyData = useMemo(() => {
        const now = new Date();
        const weeks: WeekData[] = [];

        // Calculate for the last 4 weeks
        for (let i = 0; i < 4; i++) {
            const targetDate = subWeeks(now, i);
            const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday start
            const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

            const weekTrades = trades.filter((t) => {
                const dateStr = t.closeDate || t.openDate;
                if (!dateStr) return false;
                const tradeDate = parseISO(dateStr);
                return isWithinInterval(tradeDate, { start: weekStart, end: weekEnd });
            });

            const pnl = weekTrades.reduce((acc, t) => acc + parseFloat(t.result || "0"), 0);
            const wins = weekTrades.filter((t) => parseFloat(t.result || "0") > 0).length;
            const winRate = weekTrades.length > 0 ? (wins / weekTrades.length) * 100 : 0;

            weeks.push({
                weekStart,
                weekEnd,
                pnl,
                tradeCount: weekTrades.length,
                winRate,
                isCurrent: i === 0
            });
        }

        return weeks;
    }, [trades]);

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Weekly Performance</h3>
                <Clock className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-4">
                {weeklyData.map((week, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-lg border ${week.isCurrent ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-transparent'}`}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase">
                                {week.isCurrent ? 'This Week' : `Week of ${format(week.weekStart, 'MMM d')}`}
                            </span>
                            <span className={`text-sm font-bold ${week.pnl >= 0 ? 'text-buy' : 'text-sell'}`}>
                                {formatCurrency(week.pnl)}
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-gray-500 truncate">
                                    {week.tradeCount} Trades
                                </span>
                                <span className="text-xs font-medium text-gray-700">
                                    {formatPercent(week.winRate)} Win Rate
                                </span>
                            </div>

                            <div className="flex items-center gap-1">
                                {week.pnl >= 0 ? (
                                    <TrendingUp className="w-3 h-3 text-buy" />
                                ) : (
                                    <TrendingDown className="w-3 h-3 text-sell" />
                                )}
                            </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="mt-2 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${week.pnl >= 0 ? 'bg-buy' : 'bg-sell'}`}
                                style={{ width: `${Math.min(100, (week.winRate))}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
