"use client";

import { useMemo } from "react";
import { Trades } from "@/types";
import { Card } from "@/components/ui/card";
import { useAppSelector } from "@/redux/store";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CompareReportProps {
    filteredTrades: Trades[];
}

export function CompareReport({ filteredTrades }: CompareReportProps) {
    const allTrades = useAppSelector((state) => state.tradeRecords.listOfTrades) || [];

    const calculateMetrics = (trades: Trades[]) => {
        const total = trades.length;
        const wins = trades.filter(t => Number(t.result) > 0).length;
        const losses = trades.filter(t => Number(t.result) < 0).length;
        const winRate = total > 0 ? (wins / total) * 100 : 0;

        const totalPnL = trades.reduce((acc, t) => acc + Number(t.result), 0);
        const avgPnL = total > 0 ? totalPnL / total : 0;

        // Profit Factor
        const grossProfit = trades.reduce((acc, t) => (Number(t.result) > 0 ? acc + Number(t.result) : acc), 0);
        const grossLoss = trades.reduce((acc, t) => (Number(t.result) < 0 ? acc + Math.abs(Number(t.result)) : acc), 0);
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 100 : 0;

        return {
            total,
            winRate: winRate.toFixed(1) + "%",
            totalPnL: totalPnL.toFixed(2),
            avgPnL: avgPnL.toFixed(2),
            profitFactor: profitFactor.toFixed(2)
        };
    };

    const filteredMetrics = useMemo(() => calculateMetrics(filteredTrades), [filteredTrades]);
    const allMetrics = useMemo(() => calculateMetrics(allTrades), [allTrades]);

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Compare Performance</h3>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Metric</TableHead>
                            <TableHead className="text-center bg-blue-50 text-blue-900 font-bold">Current Filter</TableHead>
                            <TableHead className="text-center">All Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Total Trades</TableCell>
                            <TableCell className="text-center bg-blue-50/50 font-semibold">{filteredMetrics.total}</TableCell>
                            <TableCell className="text-center text-zinc-600">{allMetrics.total}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Win Rate</TableCell>
                            <TableCell className="text-center bg-blue-50/50 font-semibold text-emerald-600">{filteredMetrics.winRate}</TableCell>
                            <TableCell className="text-center text-zinc-600">{allMetrics.winRate}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Net PnL</TableCell>
                            <TableCell className={`text-center bg-blue-50/50 font-semibold ${Number(filteredMetrics.totalPnL) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ${filteredMetrics.totalPnL}
                            </TableCell>
                            <TableCell className="text-center text-zinc-600">${allMetrics.totalPnL}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Avg Trade PnL</TableCell>
                            <TableCell className="text-center bg-blue-50/50 font-semibold">${filteredMetrics.avgPnL}</TableCell>
                            <TableCell className="text-center text-zinc-600">${allMetrics.avgPnL}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Profit Factor</TableCell>
                            <TableCell className="text-center bg-blue-50/50 font-semibold">{filteredMetrics.profitFactor}</TableCell>
                            <TableCell className="text-center text-zinc-600">{allMetrics.profitFactor}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
            <p className="text-xs text-zinc-500 mt-4 text-center">Comparing currently filtered trades vs. all trades in the account.</p>
        </Card>
    );
}
