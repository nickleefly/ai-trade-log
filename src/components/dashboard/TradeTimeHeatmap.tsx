"use client";

import React, { useMemo } from "react";
import { Trades } from "@/types";
import { formatCurrency } from "@/lib/analyticsEngine";
import { cn } from "@/lib/utils";

interface TradeTimeHeatmapProps {
    trades: Trades[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = Array.from({ length: 9 }, (_, i) => i + 8); // 8 AM to 4 PM (Standard RTH-ish)

export const TradeTimeHeatmap: React.FC<TradeTimeHeatmapProps> = ({ trades }) => {
    const data = useMemo(() => {
        const heatmap: Record<string, number> = {};

        trades.forEach(t => {
            if (!t.closeDate || !t.closeTime) return;

            const date = new Date(t.closeDate);
            const dayIdx = date.getDay(); // 0 is Sunday, 1 is Monday
            if (dayIdx === 0 || dayIdx === 6) return; // Skip weekends

            const dayName = DAYS[dayIdx - 1];
            const hour = parseInt(t.closeTime.split(":")[0]);

            const key = `${dayName}-${hour}`;
            heatmap[key] = (heatmap[key] || 0) + parseFloat(t.result || "0");
        });

        return heatmap;
    }, [trades]);

    const getBgColor = (val: number) => {
        if (!val || val === 0) return "bg-zinc-50";
        if (val > 0) {
            const opacity = Math.min(900, Math.floor(val / 100) * 100 + 300);
            return `bg-buy/${Math.min(100, (val / 500) * 100)}`;
        } else {
            return `bg-sell/${Math.min(100, (Math.abs(val) / 500) * 100)}`;
        }
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Trade Time Heatmap</h3>

            <div className="flex flex-col gap-1">
                {/* Header */}
                <div className="grid grid-cols-10 gap-1 mb-2">
                    <div className="col-span-1"></div>
                    {DAYS.map(day => (
                        <div key={day} className="col-span-1 text-[10px] font-bold text-gray-400 uppercase text-center">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Rows */}
                {HOURS.map(hour => (
                    <div key={hour} className="grid grid-cols-10 gap-1 items-center">
                        <div className="col-span-1 text-[10px] font-bold text-gray-400 text-right pr-2">
                            {hour}:00
                        </div>
                        {DAYS.map(day => {
                            const val = data[`${day}-${hour}`] || 0;
                            return (
                                <div
                                    key={day}
                                    className={cn(
                                        "col-span-1 h-8 rounded-sm transition-all hover:scale-105 hover:z-10 cursor-help",
                                        val > 0 ? "bg-buy" : val < 0 ? "bg-sell" : "bg-zinc-100"
                                    )}
                                    style={{
                                        opacity: val === 0 ? 1 : Math.min(1, Math.abs(val) / 1000 + 0.2)
                                    }}
                                    title={`${day} ${hour}:00 - P&L: ${formatCurrency(val)}`}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                <span>Loss</span>
                <div className="flex gap-1 h-2 w-32 bg-gradient-to-r from-sell via-zinc-200 to-buy rounded-full" />
                <span>Profit</span>
            </div>
        </div>
    );
};
