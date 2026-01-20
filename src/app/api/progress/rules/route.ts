import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressRuleTable, UserTable } from "@/drizzle/schema";
import { eq, asc } from "drizzle-orm";

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
            .orderBy(asc(ProgressRuleTable.order));

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

        if (!userId || !name || !type) {
            return NextResponse.json(
                { error: "Missing required fields: userId, name, type" },
                { status: 400 }
            );
        }

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
                targetDays: targetDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
                order: maxOrder + 1,
            })
            .returning();

        return NextResponse.json(rule[0]);
    } catch (error) {
        console.error("Failed to create rule:", error);
        return NextResponse.json({ error: "Failed to create rule" }, { status: 500 });
    }
}
