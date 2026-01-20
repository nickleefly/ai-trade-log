"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ProgressCalendarProps {
    onDateSelect: (date: Date) => void;
    userId: string;
}

export function ProgressCalendar({ onDateSelect, userId }: ProgressCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [progressData, setProgressData] = useState<Record<string, { completed: number; total: number }>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProgressData();
    }, [currentMonth, userId]);

    const fetchProgressData = async () => {
        setLoading(true);
        try {
            const monthStr = format(currentMonth, "yyyy-MM");
            const response = await fetch(
                `/api/progress/calendar?userId=${userId}&month=${monthStr}`
            );

            if (response.ok) {
                const data = await response.json();
                setProgressData(data);
            }
        } catch (error) {
            console.error("Failed to fetch progress data:", error);
        } finally {
            setLoading(false);
        }
    };

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get completion percentage for each day
    const getDayIntensity = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayData = progressData[dateStr];
        if (!dayData || dayData.total === 0) return 0;
        return dayData.completed / dayData.total;
    };

    const getIntensityColor = (intensity: number) => {
        if (intensity === 0) return "bg-gray-100 dark:bg-gray-800";
        if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
        if (intensity < 0.5) return "bg-green-300 dark:bg-green-800";
        if (intensity < 0.75) return "bg-green-400 dark:bg-green-700";
        return "bg-green-500 dark:bg-green-600";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button
                    onClick={() =>
                        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))
                    }
                    className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                    ← Previous
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <button
                    onClick={() =>
                        setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))
                    }
                    className="px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                    Next →
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-7 gap-1">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-gray-500 py-2"
                            >
                                {day}
                            </div>
                        ))}

                        {days.map((day) => {
                            const intensity = getDayIntensity(day);
                            const hasData = progressData[format(day, "yyyy-MM-dd")]?.total > 0;

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => onDateSelect(day)}
                                    className={cn(
                                        "aspect-square p-1 text-sm rounded transition-all hover:ring-2 hover:ring-primary",
                                        getIntensityColor(intensity),
                                        "text-gray-900"
                                    )}
                                >
                                    {format(day, "d")}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <span>Less</span>
                        <div className="flex gap-1">
                            <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" />
                            <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900" />
                            <div className="w-4 h-4 rounded bg-green-300 dark:bg-green-800" />
                            <div className="w-4 h-4 rounded bg-green-400 dark:bg-green-700" />
                            <div className="w-4 h-4 rounded bg-green-500 dark:bg-green-600" />
                        </div>
                        <span>More</span>
                    </div>
                </>
            )}
        </div>
    );
}
