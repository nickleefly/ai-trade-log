import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { MentorConnectionTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const mentorId = searchParams.get("mentorId");

        if (!mentorId) {
            return NextResponse.json(
                { error: "mentorId is required" },
                { status: 400 }
            );
        }

        // Get all connections where this user is the mentor
        const connections = await db
            .select({
                id: MentorConnectionTable.id,
                mentorId: MentorConnectionTable.mentorId,
                menteeId: MentorConnectionTable.menteeId,
                status: MentorConnectionTable.status,
                createdAt: MentorConnectionTable.createdAt,
                menteeName: UserTable.name,
                menteeEmail: UserTable.email,
            })
            .from(MentorConnectionTable)
            .innerJoin(UserTable, eq(MentorConnectionTable.menteeId, UserTable.id))
            .where(eq(MentorConnectionTable.mentorId, mentorId))
            .orderBy(MentorConnectionTable.createdAt);

        return NextResponse.json(connections);
    } catch (error) {
        console.error("Failed to fetch mentees:", error);
        return NextResponse.json(
            { error: "Failed to fetch mentees" },
            { status: 500 }
        );
    }
}
