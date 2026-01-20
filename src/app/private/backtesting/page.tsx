"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionList } from "@/components/backtesting/SessionList";
import { Plus, PlayCircle2, TrendingUp, BarChart3 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function BacktestingPage() {
    const [refreshKey, setRefreshKey] = useState(0);
    const { user } = useUser();

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Backtesting</h1>
                    <p className="text-sm text-gray-500">
                        Test your strategies with historical market data
                    </p>
                </div>
                <Link href="/private/backtesting/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Session
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Why Backtest?</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                        <PlayCircle2 className="h-8 w-8 text-blue-600 mb-2" />
                        <h3 className="font-semibold mb-2 text-gray-900">Travel Back in Time</h3>
                        <p className="text-sm text-gray-600">
                            Navigate through historical market conditions at your own pace
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100">
                        <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                        <h3 className="font-semibold mb-2 text-gray-900">Simulate Trades</h3>
                        <p className="text-sm text-gray-600">
                            Witness your strategy come to life in real-time simulation
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                        <BarChart3 className="h-8 w-8 text-green-600 mb-2" />
                        <h3 className="font-semibold mb-2 text-gray-900">Detailed Analytics</h3>
                        <p className="text-sm text-gray-600">
                            Get comprehensive analysis of your backtesting performance
                        </p>
                    </div>
                </CardContent>
            </Card>

            <SessionList key={refreshKey} userId={user?.id || ""} onSessionChange={() => setRefreshKey((prev) => prev + 1)} />
        </div>
    );
}
