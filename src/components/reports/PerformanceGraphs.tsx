"use client";

import { Trades } from "@/types";
import { BarChart, ScatterChart, LineChart } from "@mui/x-charts";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import dayjs from "dayjs";

interface PerformanceGraphsProps {
    trades: Trades[];
    title: string;
}

// ----------------------------------------------------------------------
// 1. Win Rate by Hour (Bar Chart)
// ----------------------------------------------------------------------

export function WinRateByHourChart({ trades, title }: PerformanceGraphsProps) {
    const data = useMemo(() => {
        const hoursMap = new Map<number, { wins: number; total: number }>();

        // Initialize 0-23
        for (let i = 0; i < 24; i++) hoursMap.set(i, { wins: 0, total: 0 });

        trades.forEach(t => {
            if (!t.openTime) return;
            // openTime format usually HH:mm:ss or HH:mm
            const hour = parseInt(t.openTime.split(":")[0], 10);
            if (!isNaN(hour)) {
                const current = hoursMap.get(hour) || { wins: 0, total: 0 };
                current.total++;
                if (Number(t.result) > 0) current.wins++;
                hoursMap.set(hour, current);
            }
        });

        // Convert to array
        return Array.from(hoursMap.entries())
            .map(([hour, stats]) => ({
                hour: `${hour}:00`,
                winRate: stats.total > 0 ? (stats.wins / stats.total) * 100 : 0,
                volume: stats.total
            }))
            .filter(d => d.volume > 0) // Only show active hours
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    }, [trades]);

    return (
        <Card className="p-4 shadow-sm border-zinc-200">
            <h4 className="text-sm font-medium text-zinc-500 mb-4">{title}</h4>
            <div className="h-[300px] w-full">
                <BarChart
                    dataset={data}
                    xAxis={[{ scaleType: 'band', dataKey: 'hour', label: 'Hour of Day' }]}
                    series={[{ dataKey: 'winRate', label: 'Win Rate (%)', color: '#10b981' }]}
                    yAxis={[{ label: 'Win Rate %', max: 100 }]}
                    margin={{ left: 50, right: 30, top: 20, bottom: 30 }}
                />
            </div>
        </Card>
    );
}

// ----------------------------------------------------------------------
// 2. Rolling Win Rate (Line Chart)
// ----------------------------------------------------------------------

export function RollingWinRateChart({ trades, title }: PerformanceGraphsProps) {
    const data = useMemo(() => {
        // Sort by date/time ascending
        const sorted = [...trades].sort((a, b) => {
            const dateA = dayjs(`${a.openDate} ${a.openTime}`);
            const dateB = dayjs(`${b.openDate} ${b.openTime}`);
            return dateA.diff(dateB);
        });

        const windowSize = 20;
        const result = [];

        for (let i = 0; i < sorted.length; i++) {
            if (i < windowSize) continue;

            const window = sorted.slice(i - windowSize, i);
            const wins = window.filter(t => Number(t.result) > 0).length;
            const winRate = (wins / windowSize) * 100;

            result.push({
                index: i,
                date: sorted[i].openDate,
                winRate
            });
        }

        return result;
    }, [trades]);

    return (
        <Card className="p-4 shadow-sm border-zinc-200">
            <h4 className="text-sm font-medium text-zinc-500 mb-4">{title}</h4>
            <div className="h-[300px] w-full">
                {data.length > 0 ? (
                    <LineChart
                        dataset={data}
                        xAxis={[{ dataKey: 'index', label: 'Trade Sequence' }]}
                        series={[{ dataKey: 'winRate', label: 'Rolling Win Rate (20 trades)', color: '#3b82f6', showMark: false }]}
                        yAxis={[{ label: 'Win Rate %', min: 0, max: 100 }]}
                        margin={{ left: 50, right: 30, top: 20, bottom: 30 }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                        Not enough data for rolling win rate (need 20+ trades)
                    </div>
                )}
            </div>
        </Card>
    );
}

// ----------------------------------------------------------------------
// 3. Planned vs Realized R (Scatter)
// ----------------------------------------------------------------------

export function PlannedVsRealizedScatter({ trades, title }: PerformanceGraphsProps) {
    const data = useMemo(() => {
        return trades
            .filter(t => t.plannedR && t.realizedR)
            .map((t, i) => ({
                id: i,
                x: parseFloat(t.plannedR || "0"),
                y: parseFloat(t.realizedR || "0"),
                result: Number(t.result) > 0 ? 'Win' : 'Loss'
            }));
    }, [trades]);

    return (
        <Card className="p-4 shadow-sm border-zinc-200">
            <h4 className="text-sm font-medium text-zinc-500 mb-4">{title}</h4>
            <div className="h-[300px] w-full">
                {data.length > 0 ? (
                    <ScatterChart
                        width={500}
                        height={300}
                        series={[
                            {
                                label: 'Trades',
                                data: data.map(d => ({ x: d.x, y: d.y, id: d.id })),
                                color: '#6366f1'
                            },
                        ]}
                        xAxis={[{ label: 'Planned R' }]}
                        yAxis={[{ label: 'Realized R' }]}
                        margin={{ left: 50, right: 30, top: 20, bottom: 40 }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-zinc-400 text-sm">
                        No R-multiple data available (ensure Planned R and Realized R are logged)
                    </div>
                )}
            </div>
        </Card>
    );
}
