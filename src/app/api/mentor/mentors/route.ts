import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { MentorConnectionTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const menteeId = searchParams.get("menteeId");

        if (!menteeId) {
            return NextResponse.json(
                { error: "menteeId is required" },
                { status: 400 }
            );
        }

        // Get all connections where this user is the mentee
        const connections = await db
            .select({
                id: MentorConnectionTable.id,
                menteeId: MentorConnectionTable.menteeId,
                mentorId: MentorConnectionTable.mentorId,
                status: MentorConnectionTable.status,
                createdAt: MentorConnectionTable.createdAt,
                mentorName: UserTable.name,
                mentorEmail: UserTable.email,
            })
            .from(MentorConnectionTable)
            .innerJoin(UserTable, eq(MentorConnectionTable.mentorId, UserTable.id))
            .where(eq(MentorConnectionTable.menteeId, menteeId))
            .orderBy(MentorConnectionTable.createdAt);

        return NextResponse.json(connections);
    } catch (error) {
        console.error("Failed to fetch mentors:", error);
        return NextResponse.json(
            { error: "Failed to fetch mentors" },
            { status: 500 }
        );
    }
}
