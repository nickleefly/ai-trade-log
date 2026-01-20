"use client";

import React, { useMemo } from "react";
import { Trades } from "@/types";
import { formatCurrency } from "@/lib/analyticsEngine";
import { ScatterChart } from "@mui/x-charts/ScatterChart";
import { Box } from "@mui/material";

interface DurationPerformanceChartProps {
    trades: Trades[];
}

export const DurationPerformanceChart: React.FC<DurationPerformanceChartProps> = ({ trades }) => {
    const data = useMemo(() => {
        return trades
            .filter(t => !t.isActiveTrade && t.openDate && t.openTime && t.closeDate && t.closeTime)
            .map((t, idx) => {
                const open = new Date(`${t.openDate}T${t.openTime}`);
                const close = new Date(`${t.closeDate}T${t.closeTime}`);
                const durationMinutes = (close.getTime() - open.getTime()) / (1000 * 60);
                const result = parseFloat(t.result || "0");

                return {
                    id: idx,
                    x: durationMinutes,
                    y: result,
                    symbol: t.symbolName
                };
            })
            .filter(d => d.x > 0); // Only trades with positive duration
    }, [trades]);

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Duration vs Performance</h3>

            <Box sx={{ width: "100%", height: 300 }}>
                {data.length > 0 ? (
                    <ScatterChart
                        series={[
                            {
                                data: data.map(d => ({ x: d.x, y: d.y, id: d.id })),
                                label: "Trades",
                                valueFormatter: (value) => {
                                    if (!value) return "";
                                    const d = data.find(item => item.x === value.x && item.y === value.y);
                                    return `${d?.symbol}: ${formatCurrency(value.y || 0)} (${Math.round(value.x || 0)}m)`;
                                }
                            },
                        ]}
                        xAxis={[
                            {
                                label: "Duration (Minutes)",
                                min: 0,
                                max: Math.max(...data.map(d => d.x)) * 1.1
                            }
                        ]}
                        yAxis={[
                            {
                                label: "P&L ($)",
                                colorMap: {
                                    type: 'piecewise',
                                    thresholds: [0],
                                    colors: ['#ef4444', '#22c55e'],
                                },
                            }
                        ]}
                        margin={{ left: 60, right: 20, top: 20, bottom: 40 }}
                        grid={{ horizontal: true, vertical: true }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        No trade duration data available
                    </div>
                )}
            </Box>
        </div>
    );
};
