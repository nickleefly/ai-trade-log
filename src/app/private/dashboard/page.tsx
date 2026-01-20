"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { calculateMetrics, formatCurrency, formatPercent, formatR } from "@/lib/analyticsEngine";
import { Gauge, gaugeClasses } from "@mui/x-charts/Gauge";
import { LineChart } from "@mui/x-charts";
import { Box, createTheme, ThemeProvider } from "@mui/material";
import { useMemo } from "react";
import {
    TrendingUp,
    TrendingDown,
    Target,
    Trophy,
    Clock,
    BarChart3,
    Activity,
    Zap
} from "lucide-react";

const theme = createTheme({
    typography: {
        body1: { fontSize: ".75rem" },
        body2: { fontSize: ".75rem" },
    },
});

// Metric Card Component
function MetricCard({
    title,
    value,
    subValue,
    icon: Icon,
    color = "blue",
    trend
}: {
    title: string;
    value: string;
    subValue?: string;
    icon: React.ElementType;
    color?: "blue" | "green" | "red" | "orange" | "purple";
    trend?: "up" | "down" | "neutral";
}) {
    const colorClasses = {
        blue: "bg-blue-50 text-blue-600 border-blue-200",
        green: "bg-green-50 text-green-600 border-green-200",
        red: "bg-red-50 text-red-600 border-red-200",
        orange: "bg-orange-50 text-orange-600 border-orange-200",
        purple: "bg-purple-50 text-purple-600 border-purple-200",
    };

    const iconBg = {
        blue: "bg-blue-100",
        green: "bg-green-100",
        red: "bg-red-100",
        orange: "bg-orange-100",
        purple: "bg-purple-100",
    };

    return (
        <div className={`bg-white rounded-xl border shadow-sm p-4 ${colorClasses[color].split(' ')[2]}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
                    <p className={`text-2xl font-bold mt-1 ${colorClasses[color].split(' ')[1]}`}>
                        {value}
                    </p>
                    {subValue && (
                        <p className="text-xs text-gray-500 mt-1">{subValue}</p>
                    )}
                </div>
                <div className={`p-2 rounded-lg ${iconBg[color]}`}>
                    <Icon className={`w-5 h-5 ${colorClasses[color].split(' ')[1]}`} />
                </div>
            </div>
            {trend && (
                <div className="mt-2 flex items-center gap-1">
                    {trend === "up" ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : trend === "down" ? (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                    ) : null}
                </div>
            )}
        </div>
    );
}

// Zella Score Gauge Component
function ZellaScoreGauge({ score }: { score: number }) {
    const getScoreColor = (score: number) => {
        if (score >= 80) return "#22c55e"; // Green
        if (score >= 60) return "#3b82f6"; // Blue
        if (score >= 40) return "#f59e0b"; // Orange
        return "#ef4444"; // Red
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return "Excellent";
        if (score >= 60) return "Good";
        if (score >= 40) return "Average";
        return "Needs Work";
    };

    return (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-semibold">Zella Score</h3>
            </div>
            <div className="flex items-center justify-center">
                <Gauge
                    value={score}
                    valueMin={0}
                    valueMax={100}
                    startAngle={-110}
                    endAngle={110}
                    width={200}
                    height={150}
                    cornerRadius="50%"
                    sx={{
                        [`& .${gaugeClasses.valueText}`]: {
                            fontSize: 32,
                            fontWeight: "bold",
                            fill: "#fff",
                        },
                        [`& .${gaugeClasses.valueArc}`]: {
                            fill: getScoreColor(score),
                        },
                        [`& .${gaugeClasses.referenceArc}`]: {
                            fill: "rgba(255,255,255,0.2)",
                        },
                    }}
                />
            </div>
            <div className="text-center mt-2">
                <span
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{ backgroundColor: getScoreColor(score) + "20", color: getScoreColor(score) }}
                >
                    {getScoreLabel(score)}
                </span>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 text-xs text-center text-gray-400">
                <div>PF</div>
                <div>Win%</div>
                <div>Avg R</div>
                <div>Trades</div>
                <div>Risk</div>
            </div>
        </div>
    );
}

import { useFilteredTrades } from "@/hooks/useFilteredTrades";
import { WeeklySummary } from "@/components/dashboard/WeeklySummary";
import { TradeTimeHeatmap } from "@/components/dashboard/TradeTimeHeatmap";
import { DurationPerformanceChart } from "@/components/dashboard/DurationPerformanceChart";
import { AdvancedDrawdownChart } from "@/components/dashboard/AdvancedDrawdownChart";

export default function DashboardPage() {
    const tradeRecords = useFilteredTrades();

    // Calculate all metrics
    const metrics = useMemo(() => {
        const trades = tradeRecords.map((t: any) => ({
            ...t,
            // Ensure all necessary fields exist
            result: t.result?.toString() || "0",
            isActiveTrade: t.isActiveTrade ?? false,
        }));
        return calculateMetrics(trades);
    }, [tradeRecords]);

    // Generate equity curve data for the main chart
    const equityCurve = useMemo(() => {
        const closedTrades = [...tradeRecords]
            .filter((t: any) => !t.isActiveTrade && t.closeDate && t.result)
            .sort((a: any, b: any) => (a.closeDate || "").localeCompare(b.closeDate || ""));

        let cumulative = 0;
        return closedTrades.map((trade: any) => {
            cumulative += parseFloat(trade.result?.toString() || "0");
            return {
                date: new Date(trade.closeDate || ""),
                pnl: cumulative,
            };
        });
    }, [tradeRecords]);

    return (
        <ThemeProvider theme={theme}>
            <div className="p-4 md:p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-sm text-gray-500">
                            Your trading performance at a glance
                        </p>
                    </div>
                </div>

                {/* Main Metrics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Zella Score */}
                    <div className="lg:col-span-1">
                        <ZellaScoreGauge score={metrics.zellaScore} />
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <MetricCard
                            title="Net P&L"
                            value={formatCurrency(metrics.netPnL)}
                            subValue={`${metrics.totalTrades} total trades`}
                            icon={metrics.netPnL >= 0 ? TrendingUp : TrendingDown}
                            color={metrics.netPnL >= 0 ? "green" : "red"}
                            trend={metrics.netPnL >= 0 ? "up" : "down"}
                        />
                        <MetricCard
                            title="Win Rate"
                            value={formatPercent(metrics.winRate)}
                            subValue={`${metrics.winningTrades}W / ${metrics.losingTrades}L`}
                            icon={Target}
                            color={metrics.winRate >= 50 ? "green" : "orange"}
                        />
                        <MetricCard
                            title="Profit Factor"
                            value={metrics.profitFactor === Infinity ? "∞" : metrics.profitFactor.toFixed(2)}
                            subValue="Gross P / Gross L"
                            icon={BarChart3}
                            color={metrics.profitFactor >= 1.5 ? "green" : metrics.profitFactor >= 1 ? "blue" : "red"}
                        />
                        <MetricCard
                            title="Avg R-Multiple"
                            value={formatR(metrics.avgRMultiple)}
                            subValue="Risk-adjusted return"
                            icon={Activity}
                            color={metrics.avgRMultiple >= 1 ? "green" : metrics.avgRMultiple >= 0 ? "blue" : "red"}
                        />
                        <MetricCard
                            title="Expectancy"
                            value={formatCurrency(metrics.expectancy)}
                            subValue="Per trade"
                            icon={Zap}
                            color={metrics.expectancy >= 0 ? "green" : "red"}
                        />
                        <MetricCard
                            title="Max Drawdown"
                            value={formatPercent(metrics.maxDrawdown)}
                            subValue={formatCurrency(metrics.maxDrawdownDollar)}
                            icon={TrendingDown}
                            color="red"
                        />
                        <MetricCard
                            title="Day Win Rate"
                            value={formatPercent(metrics.dayWinRate)}
                            subValue={`${metrics.totalTradingDays} trading days`}
                            icon={Trophy}
                            color={metrics.dayWinRate >= 50 ? "green" : "orange"}
                        />
                        <MetricCard
                            title="Avg Hold Time"
                            value={`${Math.floor(metrics.avgHoldTime / 60)}m`}
                            subValue={`${Math.round(metrics.avgHoldTime % 60)}s`}
                            icon={Clock}
                            color="purple"
                        />
                    </div>
                </div>

                {/* Secondary Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Equity Curve (2/3 width) */}
                    <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm p-4">
                        <h3 className="text-lg font-semibold mb-4">Equity Curve</h3>
                        {equityCurve.length > 0 ? (
                            <Box sx={{ width: "100%", height: 300 }}>
                                <LineChart
                                    dataset={equityCurve}
                                    xAxis={[{
                                        id: "Date",
                                        dataKey: "date",
                                        scaleType: "time",
                                        tickNumber: 6,
                                        valueFormatter: (date) => format(date, "MMM d"),
                                    }]}
                                    yAxis={[{
                                        colorMap: {
                                            type: "piecewise",
                                            thresholds: [0],
                                            colors: ["#ef4444", "#22c55e"],
                                        },
                                    }]}
                                    series={[{
                                        curve: "linear",
                                        id: "pnl",
                                        dataKey: "pnl",
                                        showMark: false,
                                        area: true,
                                        valueFormatter: (value) => formatCurrency(value || 0),
                                    }]}
                                    margin={{ left: 65, top: 25, right: 30, bottom: 25 }}
                                    grid={{ horizontal: true }}
                                    sx={{
                                        "& .MuiAreaElement-series-pnl": { opacity: 0.3 },
                                    }}
                                />
                            </Box>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-gray-400">
                                <p>No closed trades to display</p>
                            </div>
                        )}
                    </div>

                    {/* Weekly Summary (1/3 width) */}
                    <div className="lg:col-span-1">
                        <WeeklySummary trades={tradeRecords} />
                    </div>
                </div>

                {/* Analytics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TradeTimeHeatmap trades={tradeRecords} />
                    <DurationPerformanceChart trades={tradeRecords} />
                </div>

                {/* Drawdown Analysis */}
                <AdvancedDrawdownChart trades={tradeRecords} />

                {/* Detailed Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6">
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500 uppercase">Largest Win</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.largestWin)}</p>
                    </div>
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500 uppercase">Largest Loss</p>
                        <p className="text-xl font-bold text-red-600">-{formatCurrency(metrics.largestLoss)}</p>
                    </div>
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500 uppercase">Avg Win</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(metrics.avgWin)}</p>
                    </div>
                    <div className="bg-white rounded-xl border shadow-sm p-4">
                        <p className="text-xs text-gray-500 uppercase">Avg Loss</p>
                        <p className="text-xl font-bold text-red-600">-{formatCurrency(metrics.avgLoss)}</p>
                    </div>
                </div>
            </div>
        </ThemeProvider>
    );
}

import { format } from "date-fns";
