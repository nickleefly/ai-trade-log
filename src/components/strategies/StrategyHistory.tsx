"use client";
import { useState, useEffect } from "react";
import { Strategy } from "@/types/strategies.types";
import { Trades } from "@/types";
import { useAppSelector } from "@/redux/store";
import { getCapital } from "@/server/actions/user";
import { CloseTradesTable } from "@/components/history/CloseTradesTable";

interface StrategyHistoryProps {
    strategy: Strategy;
}

export default function StrategyHistory({ strategy }: StrategyHistoryProps) {
    const [startCapital, setStartCapital] = useState<string | null>(null);

    // Get trades from Redux and filter by strategy
    const allTrades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const strategyTrades = allTrades?.filter(trade => trade.strategyId === strategy.id) || [];

    const closedTrades = strategyTrades.filter((trade): trade is Trades & { closeDate: string; closeTime: string; result: string } =>
        Boolean(trade.closeDate && trade.closeDate !== "" &&
            trade.closeTime && trade.closeTime !== "" &&
            trade.result && trade.result !== "")
    );

    const total = closedTrades.reduce((acc, cur) => acc + Number(cur.result || 0), 0);

    // Fetch capital for percentage calculation
    useEffect(() => {
        async function fetchData() {
            const response = await getCapital();
            if (response && typeof response === "string") {
                setStartCapital(response);
            }
        }
        fetchData();
    }, []);

    return (
        <div className="w-full">
            <h1 className="py-4 text-neutral-500">
                Closed trades using {strategy.strategyName} ({closedTrades.length} trades):
            </h1>
            {closedTrades.length > 0 ? (
                <CloseTradesTable trades={closedTrades} startCapital={startCapital} total={total} />
            ) : (
                <div className="text-center text-gray-500 py-8">
                    No closed trades found for this strategy
                </div>
            )}
        </div>
    );
}