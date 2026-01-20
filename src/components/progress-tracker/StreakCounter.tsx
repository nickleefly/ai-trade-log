"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy, Loader2 } from "lucide-react";

interface StreakCounterProps {
    userId: string;
}

interface StreakData {
    currentStreak: number;
    longestStreak: number;
}

export function StreakCounter({ userId }: StreakCounterProps) {
    const [streak, setStreak] = useState<StreakData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStreak();
    }, [userId]);

    const fetchStreak = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/progress/streak?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setStreak(data);
            }
        } catch (error) {
            console.error("Failed to fetch streak:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    Current Streak
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500">
                        {streak?.currentStreak || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        {(streak?.currentStreak || 0) === 1 ? "day" : "days"}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-gray-500">
                            <Trophy className="h-3 w-3" />
                            Best
                        </span>
                        <span className="font-semibold text-gray-900">
                            {streak?.longestStreak || 0}
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
