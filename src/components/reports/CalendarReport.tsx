"use client";

import { useMemo, useState } from "react";
import { Trades } from "@/types";
import { Card } from "@/components/ui/card";
import {
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    format,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarReportProps {
    trades: Trades[];
}

export function CalendarReport({ trades }: CalendarReportProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth));
        const end = endOfWeek(endOfMonth(currentMonth));
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const dailyStats = useMemo(() => {
        const stats: Record<string, { pnl: number, count: number }> = {};

        trades.forEach(t => {
            if (!t.closeDate) return;
            const dateKey = format(new Date(t.closeDate), 'yyyy-MM-dd');
            if (!stats[dateKey]) {
                stats[dateKey] = { pnl: 0, count: 0 };
            }
            stats[dateKey].pnl += Number(t.result);
            stats[dateKey].count += 1;
        });

        return stats;
    }, [trades]);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Monthly Performance</h3>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={prevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-bold w-32 text-center text-lg">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-zinc-200 rounded-lg overflow-hidden border border-zinc-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-zinc-50 p-2 text-center text-xs font-semibold text-zinc-500 uppercase">
                        {day}
                    </div>
                ))}

                {days.map((day, dayIdx) => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const stat = dailyStats[dateKey];
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[100px] bg-white p-2 relative flex flex-col justify-between hover:bg-zinc-50 transition-colors
                                ${!isCurrentMonth ? 'bg-zinc-50/50 text-zinc-400' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <span className={`
                                    text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                                    ${isToday ? 'bg-blue-600 text-white' : ''}
                                `}>
                                    {format(day, 'd')}
                                </span>
                                {stat && (
                                    <span className="text-[10px] bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-600">
                                        {stat.count}T
                                    </span>
                                )}
                            </div>

                            {stat && (
                                <div className="mt-2 text-right">
                                    <div className={`text-sm font-bold ${stat.pnl >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {stat.pnl >= 0 ? '+' : ''}{stat.pnl.toFixed(2)}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 flex gap-4 text-sm text-zinc-500 justify-end">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-600 rounded-sm"></div>
                    <span>Profit Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                    <span>Loss Day</span>
                </div>
            </div>
        </Card>
    );
}
