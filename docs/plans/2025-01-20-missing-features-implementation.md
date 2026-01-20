# AI Trading Journal - Missing TradeZella Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add missing TradeZella features to the existing AI Trading Journal application.

**Existing Stack:**
- Next.js 16 with App Router
- React 19 + TypeScript
- Drizzle ORM + PostgreSQL (Neon)
- Clerk Authentication
- shadcn/ui components
- Redux Toolkit for state management
- Recharts for visualization

**Missing Features to Implement:**
1. Progress Tracker (daily checklist, habit tracking, streaks)
2. Backtesting Module
3. Resources (Economic Calendar)
4. Mentor/Mentee Mode

---

## Phase 1: Progress Tracker

### Task 1.1: Add Progress Tracker Tables to Schema

**Files:**
- Modify: `src/drizzle/schema.ts`

**Step 1: Add ProgressRule and ProgressLog tables**

```typescript
// Add to src/drizzle/schema.ts after existing tables

// ProgressRuleTable - Rules for daily habit tracking
export const ProgressRuleTable = pgTable(
    "progress_rules",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        name: text("name").notNull(),
        type: text("type").notNull(), // "MANUAL" | "AUTOMATED"
        condition: jsonb("condition"), // For automated rules
        targetDays: jsonb("target_days").$type<string[]>(), // ["Mon", "Tue", "Wed", "Thu", "Fri"]
        isActive: boolean("is_active").default(true).notNull(),
        order: integer("order").default(0).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdIndex: index("progress_rules_user_id_idx").on(table.userId),
    })
);

// ProgressLogTable - Daily completion tracking
export const ProgressLogTable = pgTable(
    "progress_logs",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        ruleId: uuid("rule_id")
            .notNull()
            .references(() => ProgressRuleTable.id),
        date: text("date").notNull(), // YYYY-MM-DD format
        completed: boolean("completed").default(false).notNull(),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdRuleIdDateIndex: index("progress_logs_user_rule_date_idx").on(
            table.userId,
            table.ruleId,
            table.date
        ),
    })
);

// UserStreakTable - Track user's current streak
export const UserStreakTable = pgTable(
    "user_streaks",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        currentStreak: integer("current_streak").default(0).notNull(),
        longestStreak: integer("longest_streak").default(0).notNull(),
        lastCompletedDate: text("last_completed_date"), // YYYY-MM-DD
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdIndex: index("user_streaks_user_id_idx").on(table.userId),
    })
);

// Add relations
export const ProgressRuleRelations = relations(ProgressRuleTable, ({ many }) => ({
    logs: many(ProgressLogTable),
}));

export const ProgressLogRelations = relations(ProgressLogTable, ({ one }) => ({
    rule: one(ProgressRuleTable, {
        fields: [ProgressLogTable.ruleId],
        references: [ProgressRuleTable.id],
    }),
}));
```

**Step 2: Generate and push migration**

```bash
npx drizzle-kit generate:pg --config=drizzle.config.ts
npx drizzle-kit push:pg --config=drizzle.config.ts
```

Expected: Tables created in database

**Step 3: Commit**

```bash
git add src/drizzle/schema.ts drizzle/
git commit -m "feat: add progress tracker tables to schema"
```

### Task 1.2: Create Progress Tracker Page

**Files:**
- Create: `src/app/private/progress-tracker/page.tsx`
- Create: `src/components/progress-tracker/DailyChecklist.tsx`
- Create: `src/components/progress-tracker/ProgressCalendar.tsx`
- Create: `src/components/progress-tracker/StreakCounter.tsx`
- Create: `src/components/progress-tracker/EditRulesDialog.tsx`

**Step 1: Create Progress Tracker page**

```typescript
// src/app/private/progress-tracker/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyChecklist } from "@/components/progress-tracker/DailyChecklist";
import { ProgressCalendar } from "@/components/progress-tracker/ProgressCalendar";
import { StreakCounter } from "@/components/progress-tracker/StreakCounter";
import { EditRulesDialog } from "@/components/progress-tracker/EditRulesDialog";
import { Settings } from "lucide-react";

export default function ProgressTrackerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editRulesOpen, setEditRulesOpen] = useState(false);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Progress Tracker</h1>
                    <p className="text-muted-foreground">
                        Build better trading habits through consistent daily practice
                    </p>
                </div>
                <Button variant="outline" onClick={() => setEditRulesOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Rules
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StreakCounter />
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Checklist</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DailyChecklist date={selectedDate} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressCalendar onDateSelect={setSelectedDate} />
                </CardContent>
            </Card>

            <EditRulesDialog open={editRulesOpen} onClose={() => setEditRulesOpen(false)} />
        </div>
    );
}
```

**Step 2: Create Daily Checklist component**

```typescript
// src/components/progress-tracker/DailyChecklist.tsx
"use client";

import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface DailyChecklistProps {
    date: Date;
}

interface ProgressRule {
    id: string;
    name: string;
    type: "MANUAL" | "AUTOMATED";
    condition: any;
    targetDays: string[];
}

interface ProgressLog {
    id: string;
    ruleId: string;
    date: string;
    completed: boolean;
}

export function DailyChecklist({ date }: DailyChecklistProps) {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

    const { data: rules, isLoading: rulesLoading } = useQuery({
        queryKey: ["progress-rules", user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/progress/rules?userId=${user?.id}`);
            if (!response.ok) throw new Error("Failed to fetch rules");
            return response.json() as Promise<ProgressRule[]>;
        },
        enabled: !!user?.id,
    });

    const { data: logs, isLoading: logsLoading } = useQuery({
        queryKey: ["progress-logs", user?.id, dateStr],
        queryFn: async () => {
            const response = await fetch(`/api/progress/logs?userId=${user?.id}&date=${dateStr}`);
            if (!response.ok) throw new Error("Failed to fetch logs");
            return response.json() as Promise<ProgressLog[]>;
        },
        enabled: !!user?.id,
    });

    const toggleMutation = useMutation({
        mutationFn: async ({ ruleId, completed }: { ruleId: string; completed: boolean }) => {
            const response = await fetch("/api/progress/toggle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    ruleId,
                    date: dateStr,
                    completed,
                }),
            });
            if (!response.ok) throw new Error("Failed to toggle rule");
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["progress-logs"] });
            queryClient.invalidateQueries({ queryKey: ["user-streak"] });
        },
    });

    if (rulesLoading || logsLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Filter rules for current day
    const applicableRules = rules?.filter((rule) =>
        rule.targetDays.includes(dayOfWeek) || rule.targetDays.length === 0
    ) || [];

    const completedCount = logs?.filter((l) => l.completed).length || 0;
    const totalCount = applicableRules.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                    {date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </h3>
                <span className="text-sm text-muted-foreground">
                    {completedCount}/{totalCount} completed
                </span>
            </div>

            <div className="space-y-4">
                <div>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                        Manual Rules
                    </h4>
                    <div className="space-y-3">
                        {applicableRules
                            .filter((r) => r.type === "MANUAL")
                            .map((rule) => {
                                const log = logs?.find((l) => l.ruleId === rule.id);
                                return (
                                    <div
                                        key={rule.id}
                                        className="flex items-center space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                    >
                                        <Checkbox
                                            id={rule.id}
                                            checked={log?.completed || false}
                                            onCheckedChange={(checked) =>
                                                toggleMutation.mutate({ ruleId: rule.id, completed: !!checked })
                                            }
                                            disabled={toggleMutation.isPending}
                                        />
                                        <Label
                                            htmlFor={rule.id}
                                            className="cursor-pointer flex-1 font-medium"
                                        >
                                            {rule.name}
                                        </Label>
                                        {log?.completed && (
                                            <span className="text-green-600 text-sm">✓</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
                        Automated Rules
                    </h4>
                    <div className="space-y-3">
                        {applicableRules
                            .filter((r) => r.type === "AUTOMATED")
                            .map((rule) => {
                                const log = logs?.find((l) => l.ruleId === rule.id);
                                return (
                                    <div
                                        key={rule.id}
                                        className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                                    >
                                        <span className="text-sm font-medium">{rule.name}</span>
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
            </div>
        </div>
    );
}
```

**Step 3: Create Progress Calendar component**

```typescript
// src/components/progress-tracker/ProgressCalendar.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";

interface ProgressCalendarProps {
    onDateSelect: (date: Date) => void;
}

export function ProgressCalendar({ onDateSelect }: ProgressCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const { data: progressData } = useQuery({
        queryKey: ["progress-calendar", format(currentMonth, "yyyy-MM")],
        queryFn: async () => {
            const response = await fetch(
                `/api/progress/calendar?month=${format(currentMonth, "yyyy-MM")}`
            );
            if (!response.ok) throw new Error("Failed to fetch progress data");
            return response.json();
        },
    });

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get completion percentage for each day
    const getDayIntensity = (date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const dayData = progressData?.[dateStr];
        if (!dayData || dayData.total === 0) return 0;
        return dayData.completed / dayData.total;
    };

    const getIntensityColor = (intensity: number) => {
        if (intensity === 0) return "bg-gray-100 dark:bg-gray-800";
        if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
        if (intensity < 0.5) return "bg-green-300 dark:bg-green-800";
        if (intensity < 0.75) return "bg-green-400 dark:bg-green-700";
        return "bg-green-500 dark:bg-green-600";
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    className="px-3 py-1 text-sm hover:bg-accent rounded"
                >
                    ← Previous
                </button>
                <h3 className="text-lg font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                </h3>
                <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    className="px-3 py-1 text-sm hover:bg-accent rounded"
                >
                    Next →
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                    </div>
                ))}

                {days.map((day) => {
                    const intensity = getDayIntensity(day);
                    return (
                        <button
                            key={day.toISOString()}
                            onClick={() => onDateSelect(day)}
                            className={cn(
                                "aspect-square p-1 text-xs rounded transition-all hover:ring-2 hover:ring-primary",
                                getIntensityColor(intensity)
                            )}
                        >
                            {format(day, "d")}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="w-4 h-4 bg-green-200 dark:bg-green-900 rounded" />
                    <div className="w-4 h-4 bg-green-300 dark:bg-green-800 rounded" />
                    <div className="w-4 h-4 bg-green-400 dark:bg-green-700 rounded" />
                    <div className="w-4 h-4 bg-green-500 dark:bg-green-600 rounded" />
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
```

**Step 4: Create Streak Counter component**

```typescript
// src/components/progress-tracker/StreakCounter.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Trophy } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function StreakCounter() {
    const { user } = useUser();

    const { data: streak } = useQuery({
        queryKey: ["user-streak", user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/progress/streak?userId=${user?.id}`);
            if (!response.ok) throw new Error("Failed to fetch streak");
            return response.json();
        },
        enabled: !!user?.id,
    });

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
                    <div className="text-sm text-muted-foreground mt-1">
                        {streak?.currentStreak === 1 ? "day" : "days"}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Trophy className="h-3 w-3" />
                            Best
                        </span>
                        <span className="font-semibold">{streak?.longestStreak || 0}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
```

**Step 5: Create Edit Rules Dialog**

```typescript
// src/components/progress-tracker/EditRulesDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface EditRulesDialogProps {
    open: boolean;
    onClose: () => void;
}

export function EditRulesDialog({ open, onClose }: EditRulesDialogProps) {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [manualRules, setManualRules] = useState<any[]>([]);
    const [newManualRule, setNewManualRule] = useState("");

    const { data: rules } = useQuery({
        queryKey: ["progress-rules", user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/progress/rules?userId=${user?.id}`);
            return response.json();
        },
        enabled: open && !!user?.id,
    });

    useEffect(() => {
        if (rules) {
            setManualRules(rules.filter((r: any) => r.type === "MANUAL"));
        }
    }, [rules]);

    const addRuleMutation = useMutation({
        mutationFn: async (name: string) => {
            const response = await fetch("/api/progress/rules", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user?.id,
                    name,
                    type: "MANUAL",
                    targetDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
                }),
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["progress-rules"] });
            setNewManualRule("");
        },
    });

    const deleteRuleMutation = useMutation({
        mutationFn: async (ruleId: string) => {
            const response = await fetch(`/api/progress/rules/${ruleId}`, {
                method: "DELETE",
            });
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["progress-rules"] });
        },
    });

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Progress Rules</DialogTitle>
                    <DialogDescription>
                        Customize your daily checklist and automated rules
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="manual">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">Manual Rules</TabsTrigger>
                        <TabsTrigger value="automated">Automated Rules</TabsTrigger>
                    </TabsList>

                    <TabsContent value="manual" className="space-y-4">
                        <div className="space-y-3">
                            {manualRules.map((rule) => (
                                <div
                                    key={rule.id}
                                    className="flex items-center gap-3 p-3 border rounded-lg"
                                >
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                    <span className="flex-1">{rule.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteRuleMutation.mutate(rule.id)}
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add new rule..."
                                    value={newManualRule}
                                    onChange={(e) => setNewManualRule(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === "Enter" && newManualRule.trim()) {
                                            addRuleMutation.mutate(newManualRule);
                                        }
                                    }}
                                />
                                <Button
                                    onClick={() => {
                                        if (newManualRule.trim()) {
                                            addRuleMutation.mutate(newManualRule);
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Active Days</Label>
                            <div className="flex gap-2">
                                {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                                    <div key={day} className="flex items-center space-x-2">
                                        <Checkbox id={day} defaultChecked />
                                        <Label htmlFor={day} className="text-sm">
                                            {day}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="automated">
                        <div className="text-center py-8 text-muted-foreground">
                            <p>Automated rules coming soon...</p>
                            <p className="text-sm mt-2">
                                Examples: Trading hours, Stop loss on all trades, Daily loss limits
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onClose}>Save Changes</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
```

**Step 6: Create API endpoints**

```typescript
// src/app/api/progress/rules/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressRuleTable, UserTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const rules = await db
            .select()
            .from(ProgressRuleTable)
            .where(eq(ProgressRuleTable.userId, userId))
            .orderBy(ProgressRuleTable.order);

        return NextResponse.json(rules);
    } catch (error) {
        console.error("Failed to fetch rules:", error);
        return NextResponse.json({ error: "Failed to fetch rules" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, name, type, targetDays } = body;

        // Get current max order
        const existingRules = await db
            .select()
            .from(ProgressRuleTable)
            .where(eq(ProgressRuleTable.userId, userId));

        const maxOrder = existingRules.length > 0
            ? Math.max(...existingRules.map((r) => r.order || 0))
            : -1;

        const rule = await db
            .insert(ProgressRuleTable)
            .values({
                userId,
                name,
                type,
                targetDays,
                order: maxOrder + 1,
            })
            .returning();

        return NextResponse.json(rule[0]);
    } catch (error) {
        console.error("Failed to create rule:", error);
        return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
    }
}

// src/app/api/progress/rules/[ruleId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressRuleTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { ruleId: string } }
) {
    try {
        await db
            .delete(ProgressRuleTable)
            .where(eq(ProgressRuleTable.id, params.ruleId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete rule:", error);
        return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
    }
}

// src/app/api/progress/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressLogTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");
        const date = searchParams.get("date");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const logs = await db
            .select()
            .from(ProgressLogTable)
            .where(
                date
                    ? and(eq(ProgressLogTable.userId, userId), eq(ProgressLogTable.date, date))
                    : eq(ProgressLogTable.userId, userId)
            );

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}

// src/app/api/progress/toggle/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressLogTable, UserStreakTable } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, ruleId, date, completed } = body;

        // Upsert progress log
        await db
            .insert(ProgressLogTable)
            .values({
                userId,
                ruleId,
                date,
                completed,
            })
            .onConflictDoUpdate({
                target: [ProgressLogTable.userId, ProgressLogTable.ruleId, ProgressLogTable.date],
                set: { completed },
            });

        // Update streak
        // TODO: Implement streak calculation logic

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to toggle rule:", error);
        return NextResponse.json({ error: "Failed to toggle rule" }, { status: 500 });
    }
}

// src/app/api/progress/streak/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { UserStreakTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        let streak = await db
            .select()
            .from(UserStreakTable)
            .where(eq(UserStreakTable.userId, userId))
            .limit(1);

        if (!streak[0]) {
            streak = await db
                .insert(UserStreakTable)
                .values({ userId, currentStreak: 0, longestStreak: 0 })
                .returning();
        }

        return NextResponse.json(streak[0]);
    } catch (error) {
        console.error("Failed to fetch streak:", error);
        return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 });
    }
}

// src/app/api/progress/calendar/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressLogTable, ProgressRuleTable } from "@/drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month"); // YYYY-MM format
        const userId = searchParams.get("userId");

        if (!userId || !month) {
            return NextResponse.json({ error: "User ID and month required" }, { status: 400 });
        }

        // Get progress data for the month
        const logs = await db
            .select({
                date: ProgressLogTable.date,
                completed: ProgressLogTable.completed,
            })
            .from(ProgressLogTable)
            .where(sql`${ProgressLogTable.userId} = ${userId} AND ${ProgressLogTable.date} LIKE ${month + "%"}`);

        // Get total rules count per day
        const rulesCount = await db
            .select({ count: sql<number>`count(*)` })
            .from(ProgressRuleTable)
            .where(eq(ProgressRuleTable.userId, userId));

        const totalRules = rulesCount[0]?.count || 1;

        // Aggregate by date
        const aggregated = logs.reduce((acc: any, log) => {
            if (!acc[log.date]) {
                acc[log.date] = { completed: 0, total: totalRules };
            }
            if (log.completed) {
                acc[log.date].completed++;
            }
            return acc;
        }, {});

        return NextResponse.json(aggregated);
    } catch (error) {
        console.error("Failed to fetch calendar data:", error);
        return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
    }
}
```

**Step 7: Add Progress Tracker to sidebar navigation**

Modify: `src/components/SidebarMenu.tsx`

```typescript
// Add this item to the navigation menu:
{
    href: "/private/progress-tracker",
    icon: Target,
    label: "Progress Tracker",
}
```

**Step 8: Commit**

```bash
git add src/app/private/progress-tracker src/components/progress-tracker src/components/SidebarMenu.tsx
git commit -m "feat: add progress tracker with daily checklist and calendar"
```

---

## Phase 2: Backtesting Module

### Task 2.1: Add Backtesting Tables to Schema

**Files:**
- Modify: `src/drizzle/schema.ts`

**Step 1: Add BacktestingSession and BacktestingTrade tables**

```typescript
// Add to src/drizzle/schema.ts

// BacktestingSessionTable - Backtesting simulation sessions
export const BacktestingSessionTable = pgTable(
    "backtesting_sessions",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: text("user_id")
            .notNull()
            .references(() => UserTable.id),
        name: text("name").notNull(),
        startDate: text("start_date").notNull(), // YYYY-MM-DD
        endDate: text("end_date").notNull(), // YYYY-MM-DD
        symbol: text("symbol").notNull(),
        timeframe: text("timeframe").notNull(), // "1m" | "5m" | "1h" | "1d"
        initialCapital: text("initial_capital").notNull(),
        status: text("status").notNull(), // "in_progress" | "completed" | "cancelled"
        result: jsonb("result"), // Final P&L, win rate, etc.
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdIndex: index("backtesting_sessions_user_id_idx").on(table.userId),
    })
);

// BacktestingTradeTable - Individual trades in backtesting session
export const BacktestingTradeTable = pgTable(
    "backtesting_trades",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        sessionId: uuid("session_id")
            .notNull()
            .references(() => BacktestingSessionTable.id, { onDelete: "cascade" }),
        symbol: text("symbol").notNull(),
        direction: text("direction").notNull(), // "LONG" | "SHORT"
        entryPrice: text("entry_price").notNull(),
        exitPrice: text("exit_price"),
        quantity: text("quantity").notNull(),
        entryDate: text("entry_date").notNull(),
        exitDate: text("exit_date"),
        pnl: text("pnl"),
        notes: text("notes"),
        strategyId: uuid("strategy_id").references(() => StrategyTable.id),
        screenshotUrl: text("screenshot_url"),
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        sessionIdIndex: index("backtesting_trades_session_id_idx").on(table.sessionId),
    })
);
```

**Step 2: Generate and push migration**

```bash
npx drizzle-kit generate:pg --config=drizzle.config.ts
npx drizzle-kit push:pg --config=drizzle.config.ts
```

**Step 3: Commit**

```bash
git add src/drizzle/schema.ts drizzle/
git commit -m "feat: add backtesting tables to schema"
```

### Task 2.2: Create Backtesting Pages

**Files:**
- Create: `src/app/private/backtesting/page.tsx`
- Create: `src/app/private/backtesting/create/page.tsx`
- Create: `src/components/backtesting/SessionList.tsx`
- Create: `src/components/backtesting/CreateSessionForm.tsx`

**Step 1: Create Backtesting main page**

```typescript
// src/app/private/backtesting/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionList } from "@/components/backtesting/SessionList";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function BacktestingPage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Backtesting</h1>
                    <p className="text-muted-foreground">
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
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Travel Back in Time</h3>
                        <p className="text-sm text-muted-foreground">
                            Navigate through historical market conditions at your own pace
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Simulate Trades</h3>
                        <p className="text-sm text-muted-foreground">
                            Witness your strategy come to life in real-time simulation
                        </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">Detailed Analytics</h3>
                        <p className="text-sm text-muted-foreground">
                            Get comprehensive analysis of your backtesting performance
                        </p>
                    </div>
                </CardContent>
            </Card>

            <SessionList key={refreshKey} />
        </div>
    );
}
```

**Step 2: Create Session List component**

```typescript
// src/components/backtesting/SessionList.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export function SessionList() {
    const { user } = useUser();

    const { data: sessions, isLoading } = useQuery({
        queryKey: ["backtesting-sessions", user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/backtesting/sessions?userId=${user?.id}`);
            if (!response.ok) throw new Error("Failed to fetch sessions");
            return response.json();
        },
        enabled: !!user?.id,
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!sessions || sessions.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">No backtesting sessions yet</p>
                    <Link href="/private/backtesting/create">
                        <Button>Create Your First Session</Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((session: any) => (
                <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <CardTitle className="text-base">{session.name}</CardTitle>
                            <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                                {session.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Symbol:</span>
                                <span className="font-medium">{session.symbol}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Period:</span>
                                <span className="font-medium">
                                    {session.startDate} → {session.endDate}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Timeframe:</span>
                                <span className="font-medium">{session.timeframe}</span>
                            </div>
                            {session.result && (
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-muted-foreground">P&L:</span>
                                    <span
                                        className={`font-bold ${
                                            parseFloat(session.result.pnl) >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        ${session.result.pnl}
                                    </span>
                                </div>
                            )}
                        </div>
                        <Link href={`/private/backtesting/session/${session.id}`}>
                            <Button className="w-full mt-4" variant="outline">
                                View Session
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
```

**Step 3: Create Session API**

```typescript
// src/app/api/backtesting/sessions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { BacktestingSessionTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        const sessions = await db
            .select()
            .from(BacktestingSessionTable)
            .where(eq(BacktestingSessionTable.userId, userId))
            .orderBy(BacktestingSessionTable.createdAt);

        return NextResponse.json(sessions);
    } catch (error) {
        console.error("Failed to fetch sessions:", error);
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, name, startDate, endDate, symbol, timeframe, initialCapital } = body;

        const session = await db
            .insert(BacktestingSessionTable)
            .values({
                userId,
                name,
                startDate,
                endDate,
                symbol,
                timeframe,
                initialCapital,
                status: "in_progress",
            })
            .returning();

        return NextResponse.json(session[0]);
    } catch (error) {
        console.error("Failed to create session:", error);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
    }
}
```

**Step 4: Add Backtesting to sidebar navigation**

Modify: `src/components/SidebarMenu.tsx`

```typescript
{
    href: "/private/backtesting",
    icon: BarChart3,
    label: "Backtesting",
}
```

**Step 5: Commit**

```bash
git add src/app/private/backtesting src/components/backtesting src/components/SidebarMenu.tsx
git commit -m "feat: add backtesting module with session management"
```

---

## Phase 3: Resources (Economic Calendar)

### Task 3.1: Create Resources Page with Economic Calendar

**Files:**
- Create: `src/app/private/resources/page.tsx`
- Create: `src/components/resources/EconomicCalendar.tsx`

**Step 1: Create Resources page**

```typescript
// src/app/private/resources/page.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EconomicCalendar } from "@/components/resources/EconomicCalendar";

export default function ResourcesPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-3xl font-bold">Resources</h1>
                <p className="text-muted-foreground">
                    Market data and economic events to inform your trading
                </p>
            </div>

            <Tabs defaultValue="calendar">
                <TabsList>
                    <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
                    <TabsTrigger value="news">Market News</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar">
                    <EconomicCalendar />
                </TabsContent>

                <TabsContent value="news">
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Market news coming soon...</p>
                    </div>
                </TabsContent>

                <TabsContent value="education">
                    <div className="text-center py-12 text-muted-foreground">
                        <p>Educational resources coming soon...</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
```

**Step 2: Create Economic Calendar component**

```typescript
// src/components/resources/EconomicCalendar.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, startOfWeek, addDays, isSameDay } from "date-fns";

interface EconomicEvent {
    id: string;
    date: string;
    time: string;
    name: string;
    impact: "low" | "medium" | "high";
    country: string;
    actual?: string;
    forecast?: string;
    previous?: string;
}

export function EconomicCalendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState<EconomicEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEconomicEvents();
    }, [selectedDate]);

    const fetchEconomicEvents = async () => {
        setLoading(true);
        try {
            const monthStr = format(selectedDate, "yyyy-MM");
            // Use a free economic calendar API or mock data
            const response = await fetch(
                `https://api.example.com/economic-calendar?month=${monthStr}`
            );
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            // Fallback to mock data
            setEvents(getMockEvents(format(selectedDate, "yyyy-MM")));
        } finally {
            setLoading(false);
        }
    };

    const getMockEvents = (month: string): EconomicEvent[] => {
        return [
            {
                id: "1",
                date: `${month}-01`,
                time: "08:30",
                name: "Non-Farm Payrolls",
                impact: "high",
                country: "US",
                forecast: "200K",
                previous: "175K",
            },
            {
                id: "2",
                date: `${month}-01`,
                time: "10:00",
                name: "ISM Manufacturing PMI",
                impact: "medium",
                country: "US",
                forecast: "50.5",
                previous: "49.8",
            },
            // Add more mock events...
        ];
    };

    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case "high":
                return "bg-red-500";
            case "medium":
                return "bg-amber-500";
            case "low":
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };

    const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
    const dayEvents = events.filter((e) => e.date === selectedDateStr);

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {/* Calendar Grid */}
            <Card className="md:col-span-2">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            onClick={() =>
                                setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))
                            }
                            className="px-3 py-1 hover:bg-accent rounded"
                        >
                            ← Previous
                        </button>
                        <h3 className="text-lg font-semibold">
                            {format(selectedDate, "MMMM yyyy")}
                        </h3>
                        <button
                            onClick={() =>
                                setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))
                            }
                            className="px-3 py-1 hover:bg-accent rounded"
                        >
                            Next →
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-xs font-medium text-muted-foreground py-2"
                            >
                                {day}
                            </div>
                        ))}

                        {weekDays.map((day) => {
                            const dayStr = format(day, "yyyy-MM-dd");
                            const hasEvents = events.some((e) => e.date === dayStr);
                            const isSelected = isSameDay(day, selectedDate);

                            return (
                                <button
                                    key={day.toISOString()}
                                    onClick={() => setSelectedDate(day)}
                                    className={`aspect-square p-1 text-sm rounded transition-all hover:ring-2 hover:ring-primary ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "hover:bg-accent"
                                    } ${hasEvents ? "font-bold" : ""}`}
                                >
                                    {format(day, "d")}
                                    {hasEvents && (
                                        <div className="flex justify-center gap-0.5 mt-0.5">
                                            <div className="w-1 h-1 rounded-full bg-red-500" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Events List */}
            <Card>
                <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">
                        {format(selectedDate, "MMM dd, yyyy")}
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : dayEvents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No economic events scheduled
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {dayEvents.map((event) => (
                                <div key={event.id} className="p-3 border rounded-lg space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">{event.name}</span>
                                        <Badge
                                            className={`text-white ${getImpactColor(event.impact)}`}
                                        >
                                            {event.impact}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {event.time} · {event.country}
                                    </div>
                                    {(event.actual || event.forecast || event.previous) && (
                                        <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                                            {event.actual && (
                                                <div>
                                                    <span className="text-muted-foreground">Actual:</span>{" "}
                                                    <span className="font-medium">{event.actual}</span>
                                                </div>
                                            )}
                                            {event.forecast && (
                                                <div>
                                                    <span className="text-muted-foreground">Forecast:</span>{" "}
                                                    <span className="font-medium">{event.forecast}</span>
                                                </div>
                                            )}
                                            {event.previous && (
                                                <div>
                                                    <span className="text-muted-foreground">Previous:</span>{" "}
                                                    <span className="font-medium">{event.previous}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
```

**Step 3: Add Resources to sidebar navigation**

Modify: `src/components/SidebarMenu.tsx`

```typescript
{
    href: "/private/resources",
    icon: Newspaper,
    label: "Resources",
}
```

**Step 4: Commit**

```bash
git add src/app/private/resources src/components/resources src/components/SidebarMenu.tsx
git commit -m "feat: add resources page with economic calendar"
```

---

## Phase 4: Mentor/Mentee Mode

### Task 4.1: Add Mentor Tables to Schema

**Files:**
- Modify: `src/drizzle/schema.ts`

**Step 1: Add Mentor connection tables**

```typescript
// Add to src/drizzle/schema.ts

// MentorConnectionTable - Mentor-mentee relationships
export const MentorConnectionTable = pgTable(
    "mentor_connections",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        mentorId: text("mentor_id")
            .notNull()
            .references(() => UserTable.id),
        menteeId: text("mentee_id")
            .notNull()
            .references(() => UserTable.id),
        status: text("status").notNull(), // "pending" | "accepted" | "declined" | "cancelled"
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        mentorIdIndex: index("mentor_connections_mentor_id_idx").on(table.mentorId),
        menteeIdIndex: index("mentor_connections_mentee_id_idx").on(table.menteeId),
    })
);
```

**Step 2: Generate and push migration**

```bash
npx drizzle-kit generate:pg --config=drizzle.config.ts
npx drizzle-kit push:pg --config=drizzle.config.ts
```

**Step 3: Commit**

```bash
git add src/drizzle/schema.ts drizzle/
git commit -m "feat: add mentor connection tables to schema"
```

### Task 4.2: Create Mentor Mode Pages

**Files:**
- Create: `src/app/private/mentor/page.tsx`
- Create: `src/components/mentor/MentorMode.tsx`
- Create: `src/components/mentor/MenteeMode.tsx`
- Create: `src/components/mentor/InviteDialog.tsx`

**Step 1: Create Mentor page**

```typescript
// src/app/private/mentor/page.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MentorMode } from "@/components/mentor/MentorMode";
import { MenteeMode } from "@/components/mentor/MenteeMode";
import { InviteDialog } from "@/components/mentor/InviteDialog";
import { UserPlus } from "lucide-react";

export default function MentorPage() {
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Mentor Mode</h1>
                    <p className="text-muted-foreground">
                        Connect with mentors or mentor other traders
                    </p>
                </div>
                <Button onClick={() => setInviteDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite
                </Button>
            </div>

            <Tabs defaultValue="mentor">
                <TabsList>
                    <TabsTrigger value="mentor">Mentor Mode</TabsTrigger>
                    <TabsTrigger value="mentee">Student Mode</TabsTrigger>
                </TabsList>

                <TabsContent value="mentor">
                    <MentorMode />
                </TabsContent>

                <TabsContent value="mentee">
                    <MenteeMode />
                </TabsContent>
            </Tabs>

            <InviteDialog open={inviteDialogOpen} onClose={() => setInviteDialogOpen(false)} />
        </div>
    );
}
```

**Step 2: Create Mentor Mode component**

```typescript
// src/components/mentor/MentorMode.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Users, UserCheck } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function MentorMode() {
    const { user } = useUser();

    const { data: mentees } = useQuery({
        queryKey: ["mentor-mentees", user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/mentor/mentees?mentorId=${user?.id}`);
            return response.json();
        },
        enabled: !!user?.id,
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Your Students
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mentees && mentees.length > 0 ? (
                        <div className="space-y-3">
                            {mentees.map((connection: any) => (
                                <div
                                    key={connection.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {connection.menteeName?.[0] || "U"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{connection.menteeName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {connection.menteeEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={connection.status === "accepted" ? "default" : "secondary"}>
                                        {connection.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <UserCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No students yet</p>
                            <p className="text-sm mt-1">Invite students to track their progress</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mentor Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>✓ Track your students' trading progress</p>
                    <p>✓ View their completed trades and strategies</p>
                    <p>✓ Monitor their progress tracker habits</p>
                    <p>✓ Provide guidance through feedback</p>
                </CardContent>
            </Card>
        </div>
    );
}
```

**Step 3: Create Mentee Mode component**

```typescript
// src/components/mentor/MenteeMode.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { GraduationCap } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export function MenteeMode() {
    const { user } = useUser();

    const { data: mentors } = useQuery({
        queryKey: ["mentor-mentors", user?.id],
        queryFn: async () => {
            const response = await fetch(`/api/mentor/mentors?menteeId=${user?.id}`);
            return response.json();
        },
        enabled: !!user?.id,
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Your Mentors
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {mentors && mentors.length > 0 ? (
                        <div className="space-y-3">
                            {mentors.map((connection: any) => (
                                <div
                                    key={connection.id}
                                    className="flex items-center justify-between p-3 border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarFallback>
                                                {connection.mentorName?.[0] || "M"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{connection.mentorName}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {connection.mentorEmail}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={connection.status === "accepted" ? "default" : "secondary"}>
                                        {connection.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No mentor connected</p>
                            <p className="text-sm mt-1">
                                Invite a mentor to review your trading progress
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Student Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>✓ Get guidance from experienced traders</p>
                    <p>✓ Share your trades and strategies for feedback</p>
                    <p>✓ Track your progress with accountability</p>
                    <p>✓ Learn from mentor's experience and insights</p>
                </CardContent>
            </Card>
        </div>
    );
}
```

**Step 4: Create API endpoints**

```typescript
// src/app/api/mentor/invite/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { MentorConnectionTable } from "@/drizzle/schema";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { mentorId, menteeId, menteeEmail } = body;

        const connection = await db
            .insert(MentorConnectionTable)
            .values({
                mentorId,
                menteeId,
                status: "pending",
            })
            .returning();

        // TODO: Send email invitation to mentee

        return NextResponse.json(connection[0]);
    } catch (error) {
        console.error("Failed to create mentor connection:", error);
        return NextResponse.json(
            { error: "Failed to create connection" },
            { status: 500 }
        );
    }
}

// src/app/api/mentor/mentees/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { MentorConnectionTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const mentorId = searchParams.get("mentorId");

        if (!mentorId) {
            return NextResponse.json({ error: "Mentor ID required" }, { status: 400 });
        }

        const connections = await db
            .select({
                id: MentorConnectionTable.id,
                status: MentorConnectionTable.status,
                menteeId: MentorConnectionTable.menteeId,
                menteeName: UserTable.name,
                menteeEmail: UserTable.email,
            })
            .from(MentorConnectionTable)
            .innerJoin(UserTable, eq(MentorConnectionTable.menteeId, UserTable.id))
            .where(eq(MentorConnectionTable.mentorId, mentorId));

        return NextResponse.json(connections);
    } catch (error) {
        console.error("Failed to fetch mentees:", error);
        return NextResponse.json({ error: "Failed to fetch mentees" }, { status: 500 });
    }
}
```

**Step 5: Add Mentor to sidebar navigation**

Modify: `src/components/SidebarMenu.tsx`

```typescript
{
    href: "/private/mentor",
    icon: GraduationCap,
    label: "Mentor Mode",
}
```

**Step 6: Commit**

```bash
git add src/app/private/mentor src/components/mentor src/components/SidebarMenu.tsx
git commit -m "feat: add mentor/mentee mode with connection management"
```

---

## Implementation Summary

This plan adds the 4 missing TradeZella features to your existing AI Trading Journal:

1. **Progress Tracker** - Daily checklist, habit tracking, streaks, calendar heatmap
2. **Backtesting Module** - Session management, simulation tracking, results analysis
3. **Resources** - Economic calendar with market events
4. **Mentor Mode** - Connect mentors/mentees, track student progress

Each feature includes:
- Database schema additions (Drizzle ORM)
- Next.js App Router pages
- React components with shadcn/ui
- API routes for data management
- Integration with existing sidebar navigation

---

**For execution:** Continue with subagent-driven development, implementing each task sequentially with code review between tasks.
