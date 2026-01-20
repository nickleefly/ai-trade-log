"use client";

import React, { useMemo } from "react";
import { Trades } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/analyticsEngine";
import { LineChart } from "@mui/x-charts/LineChart";
import { Box } from "@mui/material";

interface AdvancedDrawdownChartProps {
    trades: Trades[];
}

export const AdvancedDrawdownChart: React.FC<AdvancedDrawdownChartProps> = ({ trades }) => {
    const data = useMemo(() => {
        const sorted = [...trades]
            .filter(t => !t.isActiveTrade && t.closeDate && t.result)
            .sort((a, b) => (a.closeDate || "").localeCompare(b.closeDate || ""));

        let cumulative = 0;
        let peak = 0;

        return sorted.map((t, idx) => {
            const result = parseFloat(t.result || "0");
            cumulative += result;
            if (cumulative > peak) peak = cumulative;

            const dd = peak - cumulative;
            const ddPerc = peak > 0 ? (dd / peak) * 100 : 0;

            return {
                id: idx,
                date: new Date(t.closeDate || ""),
                pnl: cumulative,
                peak: peak,
                drawdown: dd
            };
        });
    }, [trades]);

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Equity Peaks vs Drawdown</h3>

            <Box sx={{ width: "100%", height: 300 }}>
                {data.length > 0 ? (
                    <LineChart
                        dataset={data}
                        xAxis={[
                            {
                                dataKey: "date",
                                scaleType: "time",
                                valueFormatter: (value) => {
                                    if (!value) return "";
                                    // The original valueFormatter was (date) => format(date, "MMM d")
                                    // The provided snippet seems to be for a different data structure.
                                    // Applying the null check to the original formatter for faithfulness.
                                    return format(value, "MMM d");
                                },
                            }
                        ]}
                        yAxis={[{ label: "USD ($)" }]}
                        series={[
                            {
                                dataKey: "pnl",
                                label: "Equity",
                                color: "#22c55e",
                                showMark: false,
                                area: true,
                            },
                            {
                                dataKey: "peak",
                                label: "Peak",
                                color: "#94a3b8",
                                showMark: false,
                            },
                        ]}
                        margin={{ left: 60, right: 30, top: 20, bottom: 40 }}
                        grid={{ horizontal: true }}
                        sx={{
                            "& .MuiAreaElement-root": {
                                fillOpacity: 0.1,
                            },
                            "& .MuiLineElement-series-peak": {
                                strokeDasharray: "5 5",
                            },
                        }}
                    />
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                        No drawdown data available
                    </div>
                )}
            </Box>
        </div>
    );
};

// Helper to avoid import errors from date-fns if not already imported in scope
import { format } from "date-fns";
