"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function CreateBacktestingSessionPage() {
    const router = useRouter();
    const { user } = useUser();

    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        symbol: "",
        timeframe: "1h",
        initialCapital: "10000",
    });

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/backtesting/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    ...formData,
                }),
            });

            if (response.ok) {
                const session = await response.json();
                router.push(`/private/backtesting/session/${session.id}`);
            }
        } catch (error) {
            console.error("Failed to create session:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 p-6">
            <div className="flex items-center gap-4">
                <Link href="/private/backtesting">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Backtesting Session</h1>
                    <p className="text-sm text-gray-500">
                        Set up a new simulation to test your strategy
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Session Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Session Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g., E-mini S&P Strategy Test"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, startDate: e.target.value })
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) =>
                                        setFormData({ ...formData, endDate: e.target.value })
                                    }
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="symbol">Symbol</Label>
                                <Select
                                    value={formData.symbol}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, symbol: value })
                                    }
                                    required
                                >
                                    <SelectTrigger id="symbol">
                                        <SelectValue placeholder="Select symbol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ES">E-mini S&P 500</SelectItem>
                                        <SelectItem value="NQ">E-mini Nasdaq-100</SelectItem>
                                        <SelectItem value="CL">Crude Oil</SelectItem>
                                        <SelectItem value="GC">Gold</SelectItem>
                                        <SelectItem value="AAPL">Apple</SelectItem>
                                        <SelectItem value="TSLA">Tesla</SelectItem>
                                        <SelectItem value="SPY">SPY ETF</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="timeframe">Timeframe</Label>
                                <Select
                                    value={formData.timeframe}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, timeframe: value })
                                    }
                                    required
                                >
                                    <SelectTrigger id="timeframe">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1m">1 Minute</SelectItem>
                                        <SelectItem value="5m">5 Minutes</SelectItem>
                                        <SelectItem value="15m">15 Minutes</SelectItem>
                                        <SelectItem value="1h">1 Hour</SelectItem>
                                        <SelectItem value="1d">Daily</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="initialCapital">Initial Capital</Label>
                            <Input
                                id="initialCapital"
                                type="number"
                                placeholder="10000"
                                value={formData.initialCapital}
                                onChange={(e) =>
                                    setFormData({ ...formData, initialCapital: e.target.value })
                                }
                                required
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Link href="/private/backtesting" className="flex-1">
                                <Button variant="outline" className="w-full" type="button">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" className="flex-1" disabled={loading}>
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Session"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
