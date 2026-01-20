import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { MentorConnectionTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { connectionId, status } = body;

        if (!connectionId || !status) {
            return NextResponse.json(
                { error: "Missing required fields: connectionId, status" },
                { status: 400 }
            );
        }

        // Validate status values
        const validStatuses = ["pending", "accepted", "declined", "cancelled"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
                { status: 400 }
            );
        }

        // Update the connection status
        const updatedConnections = await db
            .update(MentorConnectionTable)
            .set({
                status,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(MentorConnectionTable.id, connectionId))
            .returning();

        if (updatedConnections.length === 0) {
            return NextResponse.json(
                { error: "Connection not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedConnections[0]);
    } catch (error) {
        console.error("Failed to update status:", error);
        return NextResponse.json(
            { error: "Failed to update status" },
            { status: 500 }
        );
    }
}
