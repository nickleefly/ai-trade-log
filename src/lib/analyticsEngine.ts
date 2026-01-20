import type { InferSelectModel } from "drizzle-orm";
import type { TradeTable } from "@/drizzle/schema";

// Type alias for trade data
export type Trade = InferSelectModel<typeof TradeTable>;

// ============================================
// Core Metric Types
// ============================================

export interface AnalyticsMetrics {
    // Basic counts
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    breakEvenTrades: number;

    // Win/Loss rates
    winRate: number;           // % of winning trades
    lossRate: number;          // % of losing trades
    dayWinRate: number;        // % of profitable days

    // P&L metrics
    netPnL: number;
    grossProfit: number;
    grossLoss: number;
    avgWin: number;
    avgLoss: number;
    largestWin: number;
    largestLoss: number;
    avgTrade: number;

    // Risk metrics
    profitFactor: number;      // Gross Profit / Gross Loss
    avgRMultiple: number;      // Average R-Multiple
    expectancy: number;        // (Win% × Avg Win) - (Loss% × Avg Loss)
    maxDrawdown: number;       // Max peak-to-trough %
    maxDrawdownDollar: number; // Max peak-to-trough $
    recoveryFactor: number;    // Net Profit / Max Drawdown

    // Time-based
    avgHoldTime: number;       // Minutes
    avgDailyPnL: number;
    totalTradingDays: number;

    // Zella Score (0-100)
    zellaScore: number;
}

export interface DayPerformance {
    date: string;
    pnl: number;
    tradeCount: number;
    winCount: number;
    lossCount: number;
}

export interface TimeAnalysis {
    hourlyPnL: Record<number, number>;      // Hour (0-23) -> PnL
    dayOfWeekPnL: Record<string, number>;   // Mon-Sun -> PnL
    monthlyPnL: Record<string, number>;     // YYYY-MM -> PnL
}

export interface SymbolAnalysis {
    symbol: string;
    tradeCount: number;
    winRate: number;
    netPnL: number;
    avgR: number;
}

export interface SetupAnalysis {
    setup: string;
    tradeCount: number;
    winRate: number;
    netPnL: number;
    profitFactor: number;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Parse numeric values from trade strings
 */
function parseNumber(value: string | null | undefined): number {
    if (!value) return 0;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Calculate P&L for a single trade
 */
function getTradePnL(trade: Trade): number {
    return parseNumber(trade.result);
}

/**
 * Check if trade is a winner
 */
function isWinningTrade(trade: Trade): boolean {
    return getTradePnL(trade) > 0;
}

/**
 * Check if trade is a loser
 */
function isLosingTrade(trade: Trade): boolean {
    return getTradePnL(trade) < 0;
}

/**
 * Calculate hold time in minutes
 */
function getHoldTimeMinutes(trade: Trade): number {
    if (!trade.openDate || !trade.openTime || !trade.closeDate || !trade.closeTime) {
        return 0;
    }

    try {
        const openDateTime = new Date(`${trade.openDate}T${trade.openTime}`);
        const closeDateTime = new Date(`${trade.closeDate}T${trade.closeTime}`);
        const diffMs = closeDateTime.getTime() - openDateTime.getTime();
        return Math.max(0, diffMs / (1000 * 60));
    } catch {
        return 0;
    }
}

// ============================================
// Core Analytics Engine
// ============================================

/**
 * Calculate all analytics metrics from a list of trades
 */
export function calculateMetrics(trades: Trade[]): AnalyticsMetrics {
    const closedTrades = trades.filter(t => !t.isActiveTrade && t.result);

    if (closedTrades.length === 0) {
        return getEmptyMetrics();
    }

    // Basic counts
    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter(isWinningTrade).length;
    const losingTrades = closedTrades.filter(isLosingTrade).length;
    const breakEvenTrades = totalTrades - winningTrades - losingTrades;

    // P&L calculations
    const pnls = closedTrades.map(getTradePnL);
    const netPnL = pnls.reduce((sum, pnl) => sum + pnl, 0);
    const grossProfit = pnls.filter(p => p > 0).reduce((sum, p) => sum + p, 0);
    const grossLoss = Math.abs(pnls.filter(p => p < 0).reduce((sum, p) => sum + p, 0));

    const winPnLs = pnls.filter(p => p > 0);
    const lossPnLs = pnls.filter(p => p < 0);

    const avgWin = winPnLs.length > 0 ? winPnLs.reduce((a, b) => a + b, 0) / winPnLs.length : 0;
    const avgLoss = lossPnLs.length > 0 ? Math.abs(lossPnLs.reduce((a, b) => a + b, 0) / lossPnLs.length) : 0;
    const avgTrade = netPnL / totalTrades;
    const largestWin = winPnLs.length > 0 ? Math.max(...winPnLs) : 0;
    const largestLoss = lossPnLs.length > 0 ? Math.abs(Math.min(...lossPnLs)) : 0;

    // Rates
    const winRate = (winningTrades / totalTrades) * 100;
    const lossRate = (losingTrades / totalTrades) * 100;

    // Day analysis
    const dailyPnL = calculateDailyPnL(closedTrades);
    const profitableDays = dailyPnL.filter(d => d.pnl > 0).length;
    const totalTradingDays = dailyPnL.length;
    const dayWinRate = totalTradingDays > 0 ? (profitableDays / totalTradingDays) * 100 : 0;
    const avgDailyPnL = totalTradingDays > 0 ? netPnL / totalTradingDays : 0;

    // Risk metrics
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    const expectancy = ((winRate / 100) * avgWin) - ((lossRate / 100) * avgLoss);

    // R-Multiple analysis
    const rMultiples = closedTrades
        .map(t => parseNumber(t.realizedR))
        .filter(r => r !== 0);
    const avgRMultiple = rMultiples.length > 0
        ? rMultiples.reduce((a, b) => a + b, 0) / rMultiples.length
        : 0;

    // Drawdown calculation
    const { maxDrawdown, maxDrawdownDollar } = calculateDrawdown(dailyPnL);
    const recoveryFactor = maxDrawdownDollar > 0 ? netPnL / maxDrawdownDollar : 0;

    // Hold time
    const holdTimes = closedTrades.map(getHoldTimeMinutes).filter(t => t > 0);
    const avgHoldTime = holdTimes.length > 0
        ? holdTimes.reduce((a, b) => a + b, 0) / holdTimes.length
        : 0;

    // Zella Score calculation
    const zellaScore = calculateZellaScore({
        profitFactor,
        winRate,
        avgRMultiple,
        totalTrades,
        maxDrawdown,
    });

    return {
        totalTrades,
        winningTrades,
        losingTrades,
        breakEvenTrades,
        winRate,
        lossRate,
        dayWinRate,
        netPnL,
        grossProfit,
        grossLoss,
        avgWin,
        avgLoss,
        largestWin,
        largestLoss,
        avgTrade,
        profitFactor,
        avgRMultiple,
        expectancy,
        maxDrawdown,
        maxDrawdownDollar,
        recoveryFactor,
        avgHoldTime,
        avgDailyPnL,
        totalTradingDays,
        zellaScore,
    };
}

/**
 * Calculate daily P&L from trades
 */
export function calculateDailyPnL(trades: Trade[]): DayPerformance[] {
    const dailyMap = new Map<string, DayPerformance>();

    for (const trade of trades) {
        const date = trade.closeDate || trade.openDate;
        if (!date) continue;

        const existing = dailyMap.get(date) || {
            date,
            pnl: 0,
            tradeCount: 0,
            winCount: 0,
            lossCount: 0,
        };

        const pnl = getTradePnL(trade);
        existing.pnl += pnl;
        existing.tradeCount++;
        if (pnl > 0) existing.winCount++;
        if (pnl < 0) existing.lossCount++;

        dailyMap.set(date, existing);
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate max drawdown from daily P&L
 */
function calculateDrawdown(dailyPnL: DayPerformance[]): { maxDrawdown: number; maxDrawdownDollar: number } {
    if (dailyPnL.length === 0) {
        return { maxDrawdown: 0, maxDrawdownDollar: 0 };
    }

    let cumulativePnL = 0;
    let peak = 0;
    let maxDrawdownDollar = 0;

    for (const day of dailyPnL) {
        cumulativePnL += day.pnl;
        if (cumulativePnL > peak) {
            peak = cumulativePnL;
        }
        const drawdown = peak - cumulativePnL;
        if (drawdown > maxDrawdownDollar) {
            maxDrawdownDollar = drawdown;
        }
    }

    // Calculate percentage drawdown relative to peak
    const maxDrawdown = peak > 0 ? (maxDrawdownDollar / peak) * 100 : 0;

    return { maxDrawdown, maxDrawdownDollar };
}

/**
 * Calculate Zella Score (0-100 composite metric)
 *
 * Components:
 * - Profit Factor: 25 points max
 * - Win Rate: 20 points max
 * - Average R-Multiple: 25 points max
 * - Consistency (trade count): 15 points max
 * - Risk Management (drawdown): 15 points max
 */
interface ZellaScoreInput {
    profitFactor: number;
    winRate: number;
    avgRMultiple: number;
    totalTrades: number;
    maxDrawdown: number;
}

export function calculateZellaScore(input: ZellaScoreInput): number {
    const { profitFactor, winRate, avgRMultiple, totalTrades, maxDrawdown } = input;

    // Profit Factor Score (0-25)
    // PF of 2.0+ = 25 points
    const pfScore = Math.min(25, (Math.min(profitFactor, 2) / 2) * 25);

    // Win Rate Score (0-20)
    // 60%+ win rate = 20 points
    const wrScore = Math.min(20, (Math.min(winRate, 60) / 60) * 20);

    // R-Multiple Score (0-25)
    // Average R of 2.0+ = 25 points
    const rScore = Math.min(25, (Math.min(Math.max(avgRMultiple, 0), 2) / 2) * 25);

    // Consistency Score (0-15)
    // 100+ trades = 15 points
    const consistencyScore = Math.min(15, (Math.min(totalTrades, 100) / 100) * 15);

    // Risk Management Score (0-15)
    // Lower drawdown is better - 10% or less = 15 points
    const riskScore = maxDrawdown <= 10
        ? 15
        : Math.max(0, 15 - ((maxDrawdown - 10) / 5) * 5);

    return Math.round(pfScore + wrScore + rScore + consistencyScore + riskScore);
}

/**
 * Analyze performance by time of day
 */
export function analyzeByTime(trades: Trade[]): TimeAnalysis {
    const hourlyPnL: Record<number, number> = {};
    const dayOfWeekPnL: Record<string, number> = {
        'Sunday': 0, 'Monday': 0, 'Tuesday': 0, 'Wednesday': 0,
        'Thursday': 0, 'Friday': 0, 'Saturday': 0
    };
    const monthlyPnL: Record<string, number> = {};

    for (const trade of trades) {
        if (!trade.closeDate || !trade.closeTime) continue;

        const pnl = getTradePnL(trade);

        // Hour analysis
        const hour = parseInt(trade.closeTime.split(':')[0], 10);
        if (!isNaN(hour)) {
            hourlyPnL[hour] = (hourlyPnL[hour] || 0) + pnl;
        }

        // Day of week analysis
        try {
            const date = new Date(trade.closeDate);
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = days[date.getDay()];
            dayOfWeekPnL[dayName] += pnl;
        } catch {
            // Skip invalid dates
        }

        // Monthly analysis
        const month = trade.closeDate.substring(0, 7); // YYYY-MM
        monthlyPnL[month] = (monthlyPnL[month] || 0) + pnl;
    }

    return { hourlyPnL, dayOfWeekPnL, monthlyPnL };
}

/**
 * Analyze performance by symbol
 */
export function analyzeBySymbol(trades: Trade[]): SymbolAnalysis[] {
    const symbolMap = new Map<string, Trade[]>();

    for (const trade of trades) {
        const symbol = trade.symbolName || 'Unknown';
        const existing = symbolMap.get(symbol) || [];
        existing.push(trade);
        symbolMap.set(symbol, existing);
    }

    return Array.from(symbolMap.entries()).map(([symbol, symbolTrades]) => {
        const metrics = calculateMetrics(symbolTrades);
        return {
            symbol,
            tradeCount: metrics.totalTrades,
            winRate: metrics.winRate,
            netPnL: metrics.netPnL,
            avgR: metrics.avgRMultiple,
        };
    }).sort((a, b) => b.netPnL - a.netPnL);
}

/**
 * Analyze performance by setup type
 */
export function analyzeBySetup(trades: Trade[]): SetupAnalysis[] {
    const setupMap = new Map<string, Trade[]>();

    for (const trade of trades) {
        const setup = trade.setup || 'Untagged';
        const existing = setupMap.get(setup) || [];
        existing.push(trade);
        setupMap.set(setup, existing);
    }

    return Array.from(setupMap.entries()).map(([setup, setupTrades]) => {
        const metrics = calculateMetrics(setupTrades);
        return {
            setup,
            tradeCount: metrics.totalTrades,
            winRate: metrics.winRate,
            netPnL: metrics.netPnL,
            profitFactor: metrics.profitFactor,
        };
    }).sort((a, b) => b.netPnL - a.netPnL);
}

/**
 * Calculate R-Multiple for a trade
 */
export function calculateRMultiple(
    entryPrice: number,
    exitPrice: number,
    stopLoss: number,
    positionType: 'long' | 'short'
): number {
    if (positionType === 'long') {
        const risk = entryPrice - stopLoss;
        const reward = exitPrice - entryPrice;
        return risk > 0 ? reward / risk : 0;
    } else {
        const risk = stopLoss - entryPrice;
        const reward = entryPrice - exitPrice;
        return risk > 0 ? reward / risk : 0;
    }
}

/**
 * Calculate planned R-Multiple from entry, SL, and TP
 */
export function calculatePlannedR(
    entryPrice: number,
    stopLoss: number,
    takeProfit: number,
    positionType: 'long' | 'short'
): number {
    return calculateRMultiple(entryPrice, takeProfit, stopLoss, positionType);
}

/**
 * Get empty metrics object
 */
function getEmptyMetrics(): AnalyticsMetrics {
    return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        breakEvenTrades: 0,
        winRate: 0,
        lossRate: 0,
        dayWinRate: 0,
        netPnL: 0,
        grossProfit: 0,
        grossLoss: 0,
        avgWin: 0,
        avgLoss: 0,
        largestWin: 0,
        largestLoss: 0,
        avgTrade: 0,
        profitFactor: 0,
        avgRMultiple: 0,
        expectancy: 0,
        maxDrawdown: 0,
        maxDrawdownDollar: 0,
        recoveryFactor: 0,
        avgHoldTime: 0,
        avgDailyPnL: 0,
        totalTradingDays: 0,
        zellaScore: 0,
    };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(value);
}

/**
 * Format percentage for display
 */
export function formatPercent(value: number): string {
    return `${value.toFixed(2)}%`;
}

/**
 * Format R-Multiple for display
 */
export function formatR(value: number): string {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}R`;
}
