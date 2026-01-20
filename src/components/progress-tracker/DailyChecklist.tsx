"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface DailyChecklistProps {
    date: Date;
    userId: string;
}

interface ProgressRule {
    id: string;
    name: string;
    type: "MANUAL" | "AUTOMATED";
    targetDays: string[];
}

interface ProgressLog {
    id: string;
    ruleId: string;
    date: string;
    completed: boolean;
}

export function DailyChecklist({ date, userId }: DailyChecklistProps) {
    const [rules, setRules] = useState<ProgressRule[]>([]);
    const [logs, setLogs] = useState<ProgressLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState<string | null>(null);

    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

    useEffect(() => {
        fetchRulesAndLogs();
    }, [date, userId]);

    const fetchRulesAndLogs = async () => {
        setLoading(true);
        try {
            const [rulesRes, logsRes] = await Promise.all([
                fetch(`/api/progress/rules?userId=${userId}`),
                fetch(`/api/progress/logs?userId=${userId}&date=${dateStr}`),
            ]);

            if (rulesRes.ok && logsRes.ok) {
                const rulesData = await rulesRes.json();
                const logsData = await logsRes.json();
                setRules(rulesData);
                setLogs(logsData);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleRule = async (ruleId: string, completed: boolean) => {
        setToggling(ruleId);
        try {
            const response = await fetch("/api/progress/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, ruleId, date: dateStr, completed }),
            });

            if (response.ok) {
                // Update local state
                setLogs((prev) => {
                    const existing = prev.find((l) => l.ruleId === ruleId);
                    if (existing) {
                        return prev.map((l) =>
                            l.ruleId === ruleId ? { ...l, completed } : l
                        );
                    } else {
                        return [
                            ...prev,
                            {
                                id: Date.now().toString(),
                                userId,
                                ruleId,
                                date: dateStr,
                                completed,
                            },
                        ];
                    }
                });
            }
        } catch (error) {
            console.error("Failed to toggle rule:", error);
        } finally {
            setToggling(null);
        }
    };

    // Filter rules for current day
    const applicableRules = rules.filter((rule) =>
        rule.targetDays.includes(dayOfWeek) || rule.targetDays.length === 0
    );

    const manualRules = applicableRules.filter((r) => r.type === "MANUAL");
    const automatedRules = applicableRules.filter((r) => r.type === "AUTOMATED");

    const completedCount = logs.filter((l) => l.completed).length;
    const totalCount = applicableRules.length;

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                    {date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                    })}
                </h3>
                <span className="text-sm text-gray-500">
                    {completedCount}/{totalCount} completed
                </span>
            </div>

            {manualRules.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">
                        Manual Rules
                    </h4>
                    <div className="space-y-2">
                        {manualRules.map((rule) => {
                            const log = logs.find((l) => l.ruleId === rule.id);
                            const isToggling = toggling === rule.id;
                            return (
                                <div
                                    key={rule.id}
                                    className="flex items-center space-x-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                                >
                                    <Checkbox
                                        id={rule.id}
                                        checked={log?.completed || false}
                                        onCheckedChange={(checked) => toggleRule(rule.id, !!checked)}
                                        disabled={isToggling}
                                    />
                                    <Label
                                        htmlFor={rule.id}
                                        className="cursor-pointer flex-1 font-medium text-gray-900"
                                    >
                                        {rule.name}
                                    </Label>
                                    {isToggling && (
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    )}
                                    {log?.completed && !isToggling && (
                                        <span className="text-green-600 text-sm">✓</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {automatedRules.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium mb-3 text-gray-500 uppercase tracking-wide">
                        Automated Rules
                    </h4>
                    <div className="space-y-2">
                        {automatedRules.map((rule) => {
                            const log = logs.find((l) => l.ruleId === rule.id);
                            return (
                                <div
                                    key={rule.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                                >
                                    <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                                    <span
                                        className={`text-sm font-semibold ${
                                            log?.completed ? "text-green-600" : "text-amber-600"
                                        }`}
                                    >
                                        {log?.completed ? "✓ Passed" : "○ Pending"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {applicableRules.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p>No rules configured for this day.</p>
                    <p className="text-sm mt-1">
                        Click "Edit Rules" to create custom habits.
                    </p>
                </div>
            )}
        </div>
    );
}
