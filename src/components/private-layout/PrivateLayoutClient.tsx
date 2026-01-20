"use client";

import SidebarMenu from "@/components/SidebarMenu";
import TopNavBar from "@/components/TopNavBar";
import GlobalFiltersBar from "@/components/GlobalFiltersBar";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Toaster } from "sonner";
import { useAppDispatch } from "@/redux/store";
import {
    setInitialMonthViewSummary,
    setInitialTotalOfParticularYearSummary,
    setInitialYearViewSummary,
    setListOfTrades,
    setTradeDetailsForEachDay,
} from "@/redux/slices/tradeRecordsSlice";
import { setStrategyState } from "@/redux/slices/strategySlice";
import { Trades } from "@/types";
import { Strategy } from "@/types/strategies.types";
import { getTradeSummary } from "@/features/calendar/getTradeSummary";
import { getTradeDetailsForEachDay } from "@/features/calendar/getTradeDetailsForEachDay";

interface PrivateLayoutClientProps {
    children: ReactNode;
    initialTradeRecords: Trades[];
    initialStrategies: Strategy[];
}

export default function PrivateLayoutClient({
    children,
    initialTradeRecords,
    initialStrategies,
}: PrivateLayoutClientProps) {
    const dispatch = useAppDispatch();
    const [isMounted, setIsMounted] = useState(false);

    const monthViewTrades = useMemo(
        () => getTradeSummary("day", initialTradeRecords),
        [initialTradeRecords]
    );
    const yearViewTrades = useMemo(
        () => getTradeSummary("month", initialTradeRecords),
        [initialTradeRecords]
    );
    const particularYearTrades = useMemo(
        () => getTradeSummary("year", initialTradeRecords),
        [initialTradeRecords]
    );
    const tradeDetailsForEachDay = useMemo(
        () => getTradeDetailsForEachDay(initialTradeRecords),
        [initialTradeRecords]
    );

    useEffect(() => {
        setIsMounted(true);

        if (initialTradeRecords?.length > 0) {
            dispatch(setListOfTrades(initialTradeRecords));
        }

        // Initialize strategies in Redux
        if (initialStrategies?.length > 0) {
            dispatch(setStrategyState(initialStrategies));
        }

        if (Object.keys(monthViewTrades).length > 0) {
            dispatch(setInitialMonthViewSummary(monthViewTrades));
        }

        if (Object.keys(yearViewTrades).length > 0) {
            dispatch(setInitialYearViewSummary(yearViewTrades));
        }

        if (Object.keys(particularYearTrades).length > 0) {
            dispatch(
                setInitialTotalOfParticularYearSummary(particularYearTrades)
            );
        }
        if (Object.keys(tradeDetailsForEachDay).length > 0) {
            dispatch(setTradeDetailsForEachDay(tradeDetailsForEachDay));
        }
    }, [
        dispatch,
        initialTradeRecords,
        initialStrategies,
        monthViewTrades,
        yearViewTrades,
        particularYearTrades,
        tradeDetailsForEachDay,
    ]);

    if (!isMounted) return null;

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="flex h-screen bg-zinc-50">
                <div className="hidden md:block h-full shrink-0">
                    <SidebarMenu />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                    <TopNavBar />
                    <GlobalFiltersBar />
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </>
    );
}
