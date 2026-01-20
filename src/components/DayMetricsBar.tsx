"use client";

import React from "react";
import { calculateMetrics, formatCurrency, formatPercent, formatR } from "@/lib/analyticsEngine";
import { Trades } from "@/types";

interface DayMetricsBarProps {
    trades: Trades[];
}

export const DayMetricsBar: React.FC<DayMetricsBarProps> = ({ trades }) => {
    // Cast Trades to any for calculateMetrics because of minor schema differences
    // that analyticsEngine handles internally via parseNumber
    const metrics = calculateMetrics(trades as any);

    const MetricItem = ({
        label,
        value,
        colorClass = "text-zinc-900"
    }: {
        label: string;
        value: string;
        colorClass?: string;
    }) => (
        <div className="flex flex-col px-6 border-r border-zinc-200 last:border-r-0">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-1 whitespace-nowrap">
                {label}
            </span>
            <span className={`text-lg font-bold ${colorClass} whitespace-nowrap`}>
                {value}
            </span>
        </div>
    );

    const pnlColor = metrics.netPnL > 0 ? "text-buy" : metrics.netPnL < 0 ? "text-sell" : "text-zinc-900";

    return (
        <div className="bg-white border rounded-xl shadow-sm h-20 flex items-center py-4 mb-6 overflow-x-auto no-scrollbar">
            <MetricItem
                label="Net P&L"
                value={formatCurrency(metrics.netPnL)}
                colorClass={pnlColor}
            />
            <MetricItem
                label="Win Rate"
                value={formatPercent(metrics.winRate)}
            />
            <MetricItem
                label="Profit Factor"
                value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
            />
            <MetricItem
                label="Avg Trade"
                value={formatCurrency(metrics.avgTrade)}
                colorClass={metrics.avgTrade > 0 ? "text-buy" : metrics.avgTrade < 0 ? "text-sell" : "text-zinc-900"}
            />
            <MetricItem
                label="Total Trades"
                value={metrics.totalTrades.toString()}
            />
            <MetricItem
                label="Avg R"
                value={formatR(metrics.avgRMultiple)}
            />
        </div>
    );
};
