"use client";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";
import {
    setFilteredTrades,
    setSortBy,
    setTimeframe,
    setActiveTab,
} from "@/redux/slices/historyPageSlice";
import { CustomButton } from "./CustomButton";
import { DatePickerWithRange } from "./history/DatePicker";
import { DateRange } from "react-day-picker";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

export default function Filtering({
    isStatisticsPage,
}: {
    isStatisticsPage: boolean;
}) {
    const [instrumentLabels, setInstrumentLabels] = useState<string[]>([]);
    const [removedItems, setRemovedItems] = useState<string[]>([]);

    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades);
    const sortBy = useAppSelector((state) => state.history.sortBy);
    const timeframe = useAppSelector((state) => state.history.timeframe);
    const activeTab = useAppSelector((state) => state.history.activeTab);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!timeframe) return;

        const now = new Date();

        const todayCommon = {
            from: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
            to: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
        };

        switch (timeframe) {
            case "today":
                setDateRange(todayCommon);
                break;
            case "thisWeek": {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(now.getDate() - 7);
                setDateRange({
                    from: oneWeekAgo,
                    to: now,
                });
                break;
            }
            case "thisMonth": {
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
                setDateRange({
                    from: firstDay,
                    to: now,
                });
                break;
            }
            case "allHistory":
                setDateRange(undefined);
                break;
        }
    }, [timeframe]);

    useEffect(() => {
        if (trades) {
            setInstrumentLabels([
                ...new Set(
                    trades
                        .map(t => t.symbolName?.trim())
                        .filter((s): s is string => typeof s === "string" && s.trim() !== "")
                ),
            ])
        }
        dispatch(setFilteredTrades(trades));
    }, [trades]);

    useEffect(() => {
        if (!trades || trades.length === 0) return;

        if (!dateRange || !dateRange.from) {
            if (trades) {
                setInstrumentLabels([
                    ...new Set(
                        trades
                            .map(t => t.symbolName?.trim())
                            .filter((s): s is string => typeof s === "string" && s.trim() !== "")
                    ),
                ])
            }
            setRemovedItems([]);
            dispatch(setFilteredTrades(trades));
            return;
        }

        const filteredTrades = trades.filter((trade) => {
            if (!dateRange?.from || trade.closeDate === undefined)
                return false;

            // 1. Get Trade Date as YYYY-MM-DD String (Local representation)
            let tradeD = new Date(trade.closeDate);

            // Fix: ISO strings (YYYY-MM-DD) are parsed as UTC by new Date(), often shifting to previous day locally.
            // Check for strict YYYY-MM-DD format (no time)
            if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trade.closeDate)) {
                const [y, m, d] = trade.closeDate.split('-').map(Number);
                tradeD = new Date(y, m - 1, d);
            }

            const toDateStr = (d: Date) => {
                return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            };

            const tradeDateStr = toDateStr(tradeD);
            const fromStr = toDateStr(dateRange.from);

            if (dateRange.to) {
                const toStr = toDateStr(dateRange.to);
                return tradeDateStr >= fromStr && tradeDateStr <= toStr;
            }

            return tradeDateStr >= fromStr;
        });

        const newLabels = [
            ...new Set(filteredTrades.map((t) => t.symbolName).filter((s): s is string => typeof s === "string" && s.trim() !== "")),
        ];

        setInstrumentLabels(newLabels);
        setRemovedItems([]);
        dispatch(setFilteredTrades(filteredTrades));
    }, [trades, dateRange]);

    const removeInstrumentFromList = (instrument: string) => {
        const updatedLabels = instrumentLabels.filter(
            (item) => item !== instrument
        );
        setInstrumentLabels(updatedLabels);
        setRemovedItems((prev) => [...prev, instrument]);

        const filtered = (trades ?? []).filter((trade) => {
            const sym = trade.symbolName?.trim();
            if (!sym || !updatedLabels.includes(sym)) return false;

            if (!dateRange?.from || !dateRange.to || !trade.closeDate) return true;

            const closeDate = new Date(trade.closeDate).getTime();
            return (
                closeDate >= dateRange.from.getTime() &&
                closeDate <= dateRange.to.getTime()
            );
        });
        dispatch(setFilteredTrades(filtered));
    };

    const addInstrumentToTheList = (instrument: string) => {
        const updatedLabels = [...instrumentLabels, instrument];
        setInstrumentLabels(updatedLabels);
        setRemovedItems((prev) => prev.filter((item) => item !== instrument));
        const filtered = trades?.filter((trade) => {
            const sym = trade.symbolName?.trim();
            if (!sym || !updatedLabels.includes(sym)) return false;

            if (!dateRange?.from || !dateRange.to || trade.closeDate === undefined) return true;

            const closeDate = new Date(trade.closeDate).getTime();
            return (
                closeDate >= dateRange.from.getTime() &&
                closeDate <= dateRange.to.getTime()
            );
        });
        dispatch(setFilteredTrades(filtered));
    };
    return (
        <div className="flex max-md:flex-col max-md:gap-3 items-center justify-between max-md:overflow-hidden">
            <div
                className={`flex gap-2 w-full ${isStatisticsPage ? "w-full" : "md:w-1/2"
                    } md:flex-wrap overflow-auto p-1`}>
                {removedItems.length > 0 && (
                    <Select
                        onValueChange={(value) =>
                            addInstrumentToTheList(value)
                        }>
                        <SelectTrigger className="md:w-[160px]">
                            <SelectValue placeholder="Add instrument" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {removedItems.map((item) => (
                                    <SelectItem key={item} value={item}>
                                        {item}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                )}
                {instrumentLabels.map((instrument) => (
                    <CustomButton key={instrument} isBlack={false}>
                        <div
                            onClick={() => removeInstrumentFromList(instrument)}
                            className="flex gap-1 items-center text-[.85rem]">
                            {instrument}
                            <IoClose className="text-[1rem]" />
                        </div>
                    </CustomButton>
                ))}
            </div>

            {!isStatisticsPage && (
                <div className="flex max-md:flex-col gap-2 md:gap-4 max-md:w-full">
                    <div className="flex items-center">
                        <Tabs
                            suppressHydrationWarning
                            value={activeTab === "openTrades" ? "open-trades" : "close-trades"}
                            onValueChange={(value) =>
                                dispatch(setActiveTab(value === "open-trades" ? "openTrades" : "closedTrades"))
                            }>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="open-trades">Open</TabsTrigger>
                                <TabsTrigger value="close-trades">Closed</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <DatePickerWithRange
                        // setDateRangeForFiltering={setDateRange}
                        date={dateRange as DateRange | undefined}
                        setDate={(newRange) => {
                            if (typeof newRange === 'function') {
                                setDateRange((prev) => {
                                    const next = newRange(prev);
                                    return next ?? undefined;
                                });
                            } else {
                                setDateRange(newRange ?? undefined);
                            }
                            // Reset timeframe to custom if user manually picks dates
                            if (timeframe) dispatch(setTimeframe(undefined));
                        }}
                    />
                    <div className="flex items-center max-md:justify-between gap-4">
                        <Select
                            value={sortBy}
                            onValueChange={(value) =>
                                dispatch(setSortBy(value))
                            }>
                            <SelectTrigger className="max-md:flex-1 md:w-[120px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="instrumentName">
                                        Symbol
                                    </SelectItem>
                                    <SelectItem value="positionType">
                                        Type
                                    </SelectItem>
                                    <SelectItem value="closeDate">
                                        Close date
                                    </SelectItem>
                                    <SelectItem value="openDate">
                                        Open date
                                    </SelectItem>
                                    <SelectItem value="result">
                                        Result
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select
                            value={timeframe}
                            onValueChange={(value) =>
                                dispatch(setTimeframe(value))
                            }>
                            <SelectTrigger className="max-md:flex-1 md:w-[120px]">
                                <SelectValue placeholder="All history" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="thisWeek">
                                        Last 7 days
                                    </SelectItem>
                                    <SelectItem value="thisMonth">
                                        This month
                                    </SelectItem>
                                    <SelectItem value="allHistory">
                                        All history
                                    </SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    );
}
