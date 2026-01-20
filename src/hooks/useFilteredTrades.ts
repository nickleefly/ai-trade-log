import { useMemo } from "react";
import { useAppSelector } from "@/redux/store";
import { Trades } from "@/types";
import { isWithinInterval, parseISO, startOfDay, endOfDay } from "date-fns";

export function useFilteredTrades() {
    const trades = useAppSelector((state) => state.tradeRecords.listOfTrades) || [];
    const { selectedAccountId, dateRange } = useAppSelector((state) => state.globalFilters);

    const filteredTrades = useMemo(() => {
        return trades.filter((trade) => {
            // 1. Filter by Account
            if (selectedAccountId !== "all") {
                if (trade.accountId !== selectedAccountId) {
                    return false;
                }
            }

            // 2. Filter by Date Range
            // We prioritize closeDate for performance filtering, but fallback to openDate if closeDate is missing
            const tradeDateStr = trade.closeDate || trade.openDate;
            if (!tradeDateStr) return true;

            if (dateRange.from || dateRange.to) {
                try {
                    const tDate = parseISO(tradeDateStr);
                    const from = dateRange.from ? startOfDay(parseISO(dateRange.from)) : null;
                    const to = dateRange.to ? endOfDay(parseISO(dateRange.to)) : null;

                    if (from && tDate < from) return false;
                    if (to && tDate > to) return false;
                } catch (e) {
                    console.error("Error parsing date for trade:", trade.id, e);
                }
            }

            return true;
        });
    }, [trades, selectedAccountId, dateRange]);

    return filteredTrades;
}
