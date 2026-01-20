import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { ProgressRuleTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
    req: NextRequest,
    { params }: { params: { ruleId: string } }
) {
    try {
        await db.delete(ProgressRuleTable).where(eq(ProgressRuleTable.id, params.ruleId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete rule:", error);
        return NextResponse.json({ error: "Failed to delete rule" }, { status: 500 });
    }
}
