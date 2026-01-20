import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressLogTable, ProgressRuleTable } from "@/drizzle/schema";
import { sql, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const month = searchParams.get("month"); // yyyy-MM format
        const userId = searchParams.get("userId");

        if (!userId || !month) {
            return NextResponse.json({ error: "User ID and month required" }, { status: 400 });
        }

        // Get logs for the month
        const logs = await db
            .select({
                date: ProgressLogTable.date,
                completed: ProgressLogTable.completed,
            })
            .from(ProgressLogTable)
            .where(sql`${ProgressLogTable.userId} = ${userId} AND ${ProgressLogTable.date} LIKE ${month + "%"}`);

        // Get total rules count
        const rulesResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(ProgressRuleTable)
            .where(eq(ProgressRuleTable.userId, userId));

        const totalRules = rulesResult[0]?.count || 1;

        // Aggregate by date
        const aggregated: Record<string, { completed: number; total: number }> = {};

        logs.forEach((log) => {
            if (!aggregated[log.date]) {
                aggregated[log.date] = { completed: 0, total: totalRules };
            }
            if (log.completed) {
                aggregated[log.date].completed++;
            }
        });

        return NextResponse.json(aggregated);
    } catch (error) {
        console.error("Failed to fetch calendar data:", error);
        return NextResponse.json({ error: "Failed to fetch calendar data" }, { status: 500 });
    }
}
