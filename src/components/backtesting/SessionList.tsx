"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, PlayCircle } from "lucide-react";
import Link from "next/link";

interface SessionListProps {
    userId: string;
    onSessionChange?: () => void;
}

interface BacktestingSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    symbol: string;
    timeframe: string;
    initialCapital: string;
    status: string;
    result?: {
        pnl: string;
        winRate: number;
        totalTrades: number;
    };
    createdAt: string;
}

export function SessionList({ userId, onSessionChange }: SessionListProps) {
    const [sessions, setSessions] = useState<BacktestingSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, [userId]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/backtesting/sessions?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setSessions(data);
            }
        } catch (error) {
            console.error("Failed to fetch sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "default";
            case "in_progress":
                return "secondary";
            case "cancelled":
                return "destructive";
            default:
                return "secondary";
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <PlayCircle className="h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">No backtesting sessions yet</p>
                    <p className="text-sm text-gray-400 mb-4">Start testing your strategies today</p>
                    <Link href="/private/backtesting/create">
                        <Button>Create Your First Session</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Sessions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => {
                    const pnl = session.result?.pnl ? parseFloat(session.result.pnl) : 0;
                    const isProfitable = pnl >= 0;

                    return (
                        <Card
                            key={session.id}
                            className="hover:shadow-lg transition-shadow border-l-4"
                            style={{ borderLeftColor: isProfitable ? "#22c55e" : "#ef4444" }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <CardTitle className="text-base">{session.name}</CardTitle>
                                    <Badge variant={getStatusColor(session.status) as any}>
                                        {session.status === "in_progress" ? "In Progress" : session.status}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Symbol:</span>
                                        <span className="font-medium text-gray-900">{session.symbol}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Period:</span>
                                        <span className="font-medium text-gray-900">
                                            {session.startDate} → {session.endDate}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Timeframe:</span>
                                        <span className="font-medium text-gray-900">{session.timeframe}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Capital:</span>
                                        <span className="font-medium text-gray-900">${session.initialCapital}</span>
                                    </div>
                                    {session.result && (
                                        <>
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="text-gray-500">P&L:</span>
                                                <span
                                                    className={`font-bold flex items-center gap-1 ${
                                                        isProfitable ? "text-green-600" : "text-red-600"
                                                    }`}
                                                >
                                                    {isProfitable ? (
                                                        <TrendingUp className="h-4 w-4" />
                                                    ) : (
                                                        <TrendingDown className="h-4 w-4" />
                                                    )}
                                                    ${session.result.pnl}
                                                </span>
                                            </div>
                                            {session.result.totalTrades > 0 && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Trades:</span>
                                                    <span className="font-medium text-gray-900">
                                                        {session.result.totalTrades}
                                                    </span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                                <Link
                                    href={`/private/backtesting/session/${session.id}`}
                                    className="block mt-4"
                                >
                                    <Button variant="outline" className="w-full">
                                        View Session
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
