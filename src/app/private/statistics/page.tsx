"use client";

import AddCapitalDialog from "@/components/statistics/AddCapitalDialog";
import { StatsGridPageOne } from "@/components/StatsGridPageOne";
import { StatsGridPageTwo } from "@/components/StatsGridPageTwo";
import { getOtherDataForGridPageTwo } from "@/features/statistics/getDataForDetails";
import {
    getDataForSummaryChartGridPageOne,
    getOtherDataForGridPageOne,
} from "@/features/statistics/getDataForSummary";
import { useAppSelector } from "@/redux/store";
import { getCapital } from "@/server/actions/user";
import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WinRateTab, PnLTab, CalendarTab, CompareTab } from "@/components/reports/ReportTabs";

import { useFilteredTrades } from "@/hooks/useFilteredTrades";

export default function Page() {
    const [start, setStart] = useState<string | undefined>();
    const [end, setEnd] = useState<string | undefined>();
    const buttonRef = useRef<HTMLDivElement | null>(null);

    const [isSwitchChartsActive, setIsSwitchChartsActive] = useState(false);

    const handleSwitch = () => {
        if (buttonRef.current && !isSwitchChartsActive) {
            buttonRef.current.style.boxShadow =
                "0 0 0 1px #70451a3d, 0 1px 2px #70451a0d, 2px 3px 5px #70451a29, 4px 6px 5px #70451a14, 8px 12px 8px #70451a14,8px 0 0.5px #70451a33 inset, 20px 20px 25px 25px #70451a33 inset";
        } else if (buttonRef.current && isSwitchChartsActive) {
            buttonRef.current.style.boxShadow =
                "0 0 0 1px #70451a3d, 0 1px 2px #70451a0d, 2px 3px 5px #70451a29, 4px 6px 5px #70451a14, 8px 12px 8px #70451a14,8px 0 0.5px #70451a33 inset, 10px 0 4px -6px #70451a33 inset";
        }
        setIsSwitchChartsActive((prev) => !prev);
    };

    const tradeRecords = useFilteredTrades();

    const localCapital = useAppSelector((state) => state.statistics.capital);
    const tradesToSort = tradeRecords;
    const startValueToUse = localCapital ?? start;

    const tradingData = getDataForSummaryChartGridPageOne(tradesToSort);

    const otherData = getOtherDataForGridPageOne(tradesToSort);

    useEffect(() => {
        async function fetchData() {
            const response = await getCapital();
            if (response && typeof response === "string") {
                setStart(response);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (startValueToUse !== undefined) {
            const reducedTotal = tradesToSort.reduce(
                (acc, cur) => acc + Number(cur.result),
                0
            );
            setEnd((Number(startValueToUse) + reducedTotal).toString());
        }
    }, [startValueToUse, tradesToSort]);

    const otherDataPageTwo = getOtherDataForGridPageTwo(
        tradesToSort,
        startValueToUse
    );

    return (
        <div className="h-full flex flex-col p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900">Reports</h1>
                    <p className="text-zinc-500">Deep dive into your trading performance.</p>
                </div>
                <AddCapitalDialog />
            </div>

            <Tabs defaultValue="overview" className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <TabsList className="bg-zinc-100 p-1 rounded-lg">
                        <TabsTrigger value="overview" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Overview</TabsTrigger>
                        <TabsTrigger value="winrate" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Win Rate</TabsTrigger>
                        <TabsTrigger value="pnl" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">PnL</TabsTrigger>
                        <TabsTrigger value="calendar" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Calendar</TabsTrigger>
                        <TabsTrigger value="compare" className="px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">Compare</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-600">Details View</span>
                        <div
                            ref={buttonRef}
                            onClick={handleSwitch}
                            className={`${isSwitchChartsActive
                                ? "switch-button active"
                                : "switch-button"
                                }`}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-auto">
                    <TabsContent value="overview" className="h-full mt-0">
                        {isSwitchChartsActive ? (
                            <StatsGridPageTwo
                                start={startValueToUse}
                                end={end}
                                oterData={otherDataPageTwo}
                            />
                        ) : (
                            <StatsGridPageOne
                                tradingData={tradingData}
                                otherData={otherData}
                            />
                        )}
                    </TabsContent>

                    <TabsContent value="winrate" className="h-full mt-0">
                        <WinRateTab trades={tradeRecords} />
                    </TabsContent>

                    <TabsContent value="pnl" className="h-full mt-0">
                        <PnLTab trades={tradeRecords} />
                    </TabsContent>

                    <TabsContent value="calendar" className="h-full mt-0">
                        <CalendarTab trades={tradeRecords} />
                    </TabsContent>

                    <TabsContent value="compare" className="h-full mt-0">
                        <CompareTab trades={tradeRecords} />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
