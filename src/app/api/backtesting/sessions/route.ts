import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { BacktestingSessionTable } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";

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
            .orderBy(desc(BacktestingSessionTable.createdAt));

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

        if (!userId || !name || !startDate || !endDate || !symbol || !timeframe || !initialCapital) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

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
