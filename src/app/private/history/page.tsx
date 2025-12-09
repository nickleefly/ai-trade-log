"use client";
import { sortTrades } from "@/features/history/sortTrades";
import { useAppSelector } from "@/redux/store";
import { Trades } from "@/types";
import { useEffect, useState } from "react";

import { getCapital } from "@/server/actions/user";
import { OpenTradesTable } from "@/components/history/OpenTradesTable";
import { CloseTradesTable } from "@/components/history/CloseTradesTable";



export default function Page() {
    const [sortedTrades, setSortedTrades] = useState<Trades[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [startCapital, setStartCapital] = useState<string | null>(null);

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const filteredTrades = useAppSelector(
        (state) => state.history.filteredTrades
    );

    const sortBy = useAppSelector((state) => state.history.sortBy);
    const timeframe = useAppSelector((state) => state.history.timeframe);

    const activeTab = useAppSelector((state) => state.history.activeTab);

    const tradesToSort = filteredTrades || trades || [];

    useEffect(() => {
        async function fetchData() {
            const response = await getCapital();
            if (response && typeof response === "string") {
                setStartCapital(response);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        const result = sortTrades({
            sortBy,
            timeframe,
            tradesToSort,
        });
        // Only calculate total for closed trades (with closeDate)
        const closedTrades = result.filter((trade) => trade.closeDate && trade.closeDate !== "");
        const reducedTotal = closedTrades.reduce(
            (acc, cur) => acc + Number(cur.result || 0),
            0
        );
        setSortedTrades(result);
        setTotal(reducedTotal);
    }, [sortBy, timeframe, trades, filteredTrades]);



    const closedTrades = sortedTrades.filter((trade): trade is Trades & { closeDate: string; closeTime: string; result: string } =>
        Boolean(trade.closeDate && trade.closeDate !== "" &&
            trade.closeTime && trade.closeTime !== "" &&
            trade.result && trade.result !== "")
    );

    const openTrades = sortedTrades.filter((trade) =>
        Boolean(!trade.closeDate || trade.closeDate === "")
    );

    if (closedTrades.length === 0 && openTrades.length === 0) {
        return (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500">
                No trades found - complete some trades to see history
            </div>
        );
    }

    return (

        <div>
            {activeTab === "openTrades" && (
                openTrades.length > 0 ? (
                    <OpenTradesTable trades={openTrades} startCapital={startCapital} />
                ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500">
                        No open trades found - complete some trades to see history
                    </div>
                )
            )}

            {activeTab === "closedTrades" && (
                closedTrades.length > 0 ? (
                    <CloseTradesTable trades={closedTrades} startCapital={startCapital} total={total} />
                ) : (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-zinc-500">
                        No closed trades found - complete some trades to see history
                    </div>
                )
            )}
        </div>


    );
}
