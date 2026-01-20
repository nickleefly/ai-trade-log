"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DailyChecklist } from "@/components/progress-tracker/DailyChecklist";
import { ProgressCalendar } from "@/components/progress-tracker/ProgressCalendar";
import { StreakCounter } from "@/components/progress-tracker/StreakCounter";
import { EditRulesDialog } from "@/components/progress-tracker/EditRulesDialog";
import { Settings, Target } from "lucide-react";
import { useUser } from "@clerk/nextjs";

export default function ProgressTrackerPage() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editRulesOpen, setEditRulesOpen] = useState(false);
    const { user } = useUser();

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Progress Tracker</h1>
                    <p className="text-sm text-gray-500">
                        Build better trading habits through consistent daily practice
                    </p>
                </div>
                <Button variant="outline" onClick={() => setEditRulesOpen(true)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Rules
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StreakCounter userId={user?.id || ""} />
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Daily Checklist
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DailyChecklist date={selectedDate} userId={user?.id || ""} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Activity Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProgressCalendar onDateSelect={setSelectedDate} userId={user?.id || ""} />
                </CardContent>
            </Card>

            {editRulesOpen && (
                <EditRulesDialog
                    open={editRulesOpen}
                    onClose={() => setEditRulesOpen(false)}
                    userId={user?.id || ""}
                />
            )}
        </div>
    );
}
