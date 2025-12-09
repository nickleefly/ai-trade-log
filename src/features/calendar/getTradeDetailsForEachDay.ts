import { Trades } from "@/types";

export function getTradeDetailsForEachDay(data: Trades[]): {
    [key: string]: { result: number; win: number; lost: number };
} {
    return data.reduce(
        (
            acc: {
                [key: string]: { result: number; win: number; lost: number };
            },
            trade
        ) => {
            // Skip trades without valid closeDate or result
            if (!trade.closeDate) return acc;
            const numericResult = Number(trade.result);
            if (!Number.isFinite(numericResult)) return acc;

            const closeDate = new Date(trade.closeDate);
            const dateKey = closeDate
                .toLocaleDateString("en-GB")
                .split("/")
                .join("-");

            if (acc[dateKey]) {
                acc[dateKey] = {
                    result: (acc[dateKey].result += 1),
                    win: numericResult >= 0
                        ? (acc[dateKey].win += 1)
                        : acc[dateKey].win,
                    lost: numericResult < 0
                        ? (acc[dateKey].lost += 1)
                        : acc[dateKey].lost,
                };
            } else {
                acc[dateKey] = {
                    result: 1,
                    win: numericResult >= 0 ? 1 : 0,
                    lost: numericResult < 0 ? 1 : 0,
                };
            }

            return acc;
        },
        {}
    );
}
