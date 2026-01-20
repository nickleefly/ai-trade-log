import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressLogTable, UserStreakTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { userId, ruleId, date, completed } = body;

        if (!userId || !ruleId || !date) {
            return NextResponse.json(
                { error: "Missing required fields: userId, ruleId, date" },
                { status: 400 }
            );
        }

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

        // Update streak (simplified - could be enhanced)
        await updateStreak(userId, date, completed);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to toggle rule:", error);
        return NextResponse.json({ error: "Failed to toggle rule" }, { status: 500 });
    }
}

async function updateStreak(userId: string, date: string, completed: boolean) {
    // Check if user has a streak record
    const existingStreak = await db
        .select()
        .from(UserStreakTable)
        .where(eq(UserStreakTable.userId, userId))
        .limit(1);

    if (existingStreak.length === 0) {
        // Create new streak record
        await db.insert(UserStreakTable).values({
            userId,
            currentStreak: completed ? 1 : 0,
            longestStreak: completed ? 1 : 0,
            lastCompletedDate: completed ? date : null,
        });
    } else {
        const streak = existingStreak[0];

        if (completed) {
            // Check if this is a consecutive day
            const lastDate = streak.lastCompletedDate
                ? new Date(streak.lastCompletedDate)
                : null;
            const currentDate = new Date(date);
            const diffTime = lastDate ? currentDate.getTime() - lastDate.getTime() : 0;
            const diffDays = lastDate ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;

            let newCurrentStreak = streak.currentStreak;
            let newLongestStreak = streak.longestStreak;

            if (diffDays <= 1) {
                // Consecutive day or same day
                if (diffDays === 1) {
                    newCurrentStreak = streak.currentStreak + 1;
                }
                newLongestStreak = Math.max(newLongestStreak, newCurrentStreak);
            } else {
                // Streak broken
                newCurrentStreak = 1;
            }

            await db
                .update(UserStreakTable)
                .set({
                    currentStreak: newCurrentStreak,
                    longestStreak: newLongestStreak,
                    lastCompletedDate: date,
                })
                .where(eq(UserStreakTable.userId, userId));
        }
    }
}
