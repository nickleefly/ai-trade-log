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
