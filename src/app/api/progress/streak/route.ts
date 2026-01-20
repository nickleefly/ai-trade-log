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
            // Create default streak record
            await db.insert(UserStreakTable).values({
                userId,
                currentStreak: 0,
                longestStreak: 0,
            });

            streak = await db
                .select()
                .from(UserStreakTable)
                .where(eq(UserStreakTable.userId, userId))
                .limit(1);
        }

        return NextResponse.json(streak[0]);
    } catch (error) {
        console.error("Failed to fetch streak:", error);
        return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 });
    }
}
