import { Trades } from "@/types";

export function getDataForSummaryChartGridPageOne(
    trades: Trades[]
): { date: Date; capital: number }[] {
    if (!Array.isArray(trades) || trades.length === 0) {
        return [];
    }

    // Clone the trades array to avoid modifying the original
    const tradesCopy = [...trades].filter(
        (trade): trade is Trades & { closeDate: string } =>
            Boolean(trade.closeDate)
    );

    // 1) Sort trades by closeDate
    tradesCopy.sort((a, b) => {
        const dateA = new Date(a.closeDate).getTime();
        const dateB = new Date(b.closeDate).getTime();
        return dateA - dateB;
    });

    // 2) Build a map of "YYYY-MM-DD" -> sum of results on that day
    const dailyResultsMap: { [key: string]: number } = {};
    for (const trade of tradesCopy) {
        const closeDate = new Date(trade.closeDate);
        if (isNaN(closeDate.getTime())) continue; // Skip invalid dates

        const dayKey = closeDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
        const resultValue = parseFloat(trade.result as unknown as string) || 0;

        dailyResultsMap[dayKey] = (dailyResultsMap[dayKey] || 0) + resultValue;
    }

    // 3) If no valid daily results, return empty
    const sortedKeys = Object.keys(dailyResultsMap).sort();
    if (sortedKeys.length === 0) {
        return [];
    }

    // 4) Build our array **only** for days we have a trade result
    let runningCapital = 0;
    const resultArray: { date: Date; capital: number }[] = [];

    for (const dayKey of sortedKeys) {
        runningCapital += dailyResultsMap[dayKey];

        // Construct a new Date from the dayKey (in "YYYY-MM-DD" format)
        // We add "T00:00:00" to avoid time-zone offset issues.
        const parsedDate = new Date(`${dayKey}T00:00:00Z`);

        resultArray.push({
            date: parsedDate,
            capital: runningCapital,
        });
    }

    return resultArray;
}

export function getOtherDataForGridPageOne(trades: Trades[]) {
    if (trades.length === 0)
        return {
            chartOne: {
                succesfullPositions: 0,
                allPositions: 0,
            },
            chartTwo: {
                succesfullBuyPositions: 0,
                allBuyPositions: 0,
            },
            chartThree: {
                succesfullSellPositions: 0,
                allSellPositions: 0,
            },
            chartFour: {
                allBuyPositions: 0,
                averageBuyPositionsPerMonth: 0,
            },
            chartFive: {
                allSellPositions: 0,
                averageSellPositionsPerMonth: 0,
            },
            chartSix: {
                averageTimeInBuyPositionSeconds: 0,
                averageTimeInSellPositionSeconds: 0,
            },
            chartSeven: {
                sequenceProfitable: 0,
                sequenceLost: 0,
            },
        };

    const allPositions = trades.length;
    const succesfullPositions = trades.filter(
        (trade) => Number(trade.result) > 0
    ).length;
    const succesfullBuyPositions = trades.filter(
        (trade) => Number(trade.result) > 0 && trade.positionType === "long"
    ).length;
    const allBuyPositions = trades.filter(
        (trade) => trade.positionType === "long"
    ).length;
    const succesfullSellPositions = trades.filter(
        (trade) => Number(trade.result) > 0 && trade.positionType === "short"
    ).length;
    const allSellPositions = trades.filter(
        (trade) => trade.positionType === "short"
    ).length;

    const totalMonthFromFirstTrade = calculateMonthsDifference(
        trades[trades.length - 1].openDate
    );

    // Calculate average time in seconds for mm:ss display
    const averageTimeInBuyPositionSeconds =
        allBuyPositions > 0
            ? Math.round(
                (calculateTotalTimeInPositionHours(trades, "long") * 3600) /
                allBuyPositions
            )
            : 0;

    const averageTimeInSellPositionSeconds =
        allSellPositions > 0
            ? Math.round(
                (calculateTotalTimeInPositionHours(trades, "short") * 3600) /
                allSellPositions
            )
            : 0;

    const sequenceProfitLost = sequenceOfProfitableLostTrades(trades);

    return {
        chartOne: {
            succesfullPositions: Math.floor(
                (succesfullPositions / (allPositions || 1)) * 100
            ),
            allPositions,
        },
        chartTwo: {
            succesfullBuyPositions: Math.floor(
                (succesfullBuyPositions / (allBuyPositions || 1)) * 100
            ),
            allBuyPositions,
        },
        chartThree: {
            succesfullSellPositions: Math.floor(
                (succesfullSellPositions / (allSellPositions || 1)) * 100
            ),
            allSellPositions,
        },
        chartFour: {
            allBuyPositions,
            averageBuyPositionsPerMonth: Math.floor(
                allBuyPositions / (totalMonthFromFirstTrade || 1)
            ),
        },
        chartFive: {
            allSellPositions,
            averageSellPositionsPerMonth: Math.floor(
                allSellPositions / (totalMonthFromFirstTrade || 1)
            ),
        },
        chartSix: {
            averageTimeInBuyPositionSeconds,
            averageTimeInSellPositionSeconds,
        },
        chartSeven: {
            sequenceProfitable: sequenceProfitLost.profitable,
            sequenceLost: sequenceProfitLost.lost,
        },
    };
}

function calculateMonthsDifference(openDateString: string) {
    if (!openDateString) return 0;
    const openDate = new Date(openDateString);
    const today = new Date();

    const yearDifference = today.getFullYear() - openDate.getFullYear();
    const monthDifference = today.getMonth() - openDate.getMonth();

    const totalMonths = yearDifference * 12 + monthDifference;

    return totalMonths;
}

function calculateTotalTimeInPositionHours(
    trades: Trades[],
    filter: "long" | "short"
): number {
    if (trades.length === 0) return 0;
    const filteredTrades = trades.filter(
        (trade): trade is Trades & { closeDate: string; closeTime: string } =>
            trade.positionType === filter &&
            Boolean(trade.closeDate) &&
            Boolean(trade.closeTime)
    );

    if (filteredTrades.length === 0) return 0;

    const totalTimeInPositionMinutes = filteredTrades.reduce((acc, trade) => {
        // Handle both ISO format (with T) and plain date format (YYYY-MM-DD)
        const openDatePart = trade.openDate.includes("T")
            ? trade.openDate.split("T")[0]
            : trade.openDate;
        const closeDatePart = trade.closeDate.includes("T")
            ? trade.closeDate.split("T")[0]
            : trade.closeDate;

        // Parse time - handle HH:MM:SS and HH:MM formats
        const openTimeParts = trade.openTime.split(":");
        const closeTimeParts = trade.closeTime.split(":");

        const openHour = Number(openTimeParts[0]) || 0;
        const openMinute = Number(openTimeParts[1]) || 0;
        const closeHour = Number(closeTimeParts[0]) || 0;
        const closeMinute = Number(closeTimeParts[1]) || 0;

        const openDateTime = new Date(`${openDatePart}T${String(openHour).padStart(2, '0')}:${String(openMinute).padStart(2, '0')}:00`);
        const closeDateTime = new Date(`${closeDatePart}T${String(closeHour).padStart(2, '0')}:${String(closeMinute).padStart(2, '0')}:00`);

        const diffMs = closeDateTime.getTime() - openDateTime.getTime();
        const diffMinutes = diffMs / (1000 * 60);

        return acc + (isNaN(diffMinutes) ? 0 : diffMinutes);
    }, 0);

    // Return total in hours
    return totalTimeInPositionMinutes / 60;
}

function sequenceOfProfitableLostTrades(trades: Trades[]) {
    if (trades.length === 0) return { profitable: 0, lost: 0 };

    const tradesCopy = [...trades].filter(
        (trade): trade is Trades & { closeDate: string } =>
            Boolean(trade.closeDate)
    );

    const sortedTrades = tradesCopy.sort((a, b) => {
        const dateA = new Date(a.closeDate).getTime();
        const dateB = new Date(b.closeDate).getTime();
        return dateA - dateB;
    });

    let profitableTemp = 0;
    let lostTemp = 0;

    const sequences = {
        profitable: 0,
        lost: 0,
    };

    for (let i = 0; i < sortedTrades.length; i++) {
        if (Number(sortedTrades[i].result) >= 0) {
            profitableTemp++;

            sequences.lost = Math.max(sequences.lost, lostTemp);
            lostTemp = 0;
        } else {
            lostTemp++;

            sequences.profitable = Math.max(
                sequences.profitable,
                profitableTemp
            );
            profitableTemp = 0;
        }
    }

    sequences.profitable = Math.max(sequences.profitable, profitableTemp);
    sequences.lost = Math.max(sequences.lost, lostTemp);
    return sequences;
}
