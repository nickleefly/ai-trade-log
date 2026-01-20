import { NextRequest, NextResponse } from "next/server";
import { db } from "@/drizzle/db";
import { MentorConnectionTable, UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, role, inviterId } = body;

        if (!email || !role || !inviterId) {
            return NextResponse.json(
                { error: "Missing required fields: email, role, inviterId" },
                { status: 400 }
            );
        }

        // Find the user by email
        const users = await db
            .select()
            .from(UserTable)
            .where(eq(UserTable.email, email))
            .limit(1);

        if (users.length === 0) {
            return NextResponse.json(
                { error: "User with this email not found" },
                { status: 404 }
            );
        }

        const inviteeId = users[0].id;

        // Don't allow self-invites
        if (inviterId === inviteeId) {
            return NextResponse.json(
                { error: "Cannot invite yourself" },
                { status: 400 }
            );
        }

        // Check if a connection already exists
        const existingConnections = await db
            .select()
            .from(MentorConnectionTable)
            .where(eq(MentorConnectionTable.menteeId, inviteeId));

        const hasExistingConnection = existingConnections.some(
            (conn) =>
                (conn.mentorId === inviterId && conn.menteeId === inviteeId) ||
                (conn.mentorId === inviteeId && conn.menteeId === inviterId)
        );

        if (hasExistingConnection) {
            return NextResponse.json(
                { error: "Connection already exists" },
                { status: 400 }
            );
        }

        // Create the mentor-mentee connection based on role
        // If inviter wants a mentee, inviter is mentor and invitee is mentee
        // If inviter wants a mentor, inviter is mentee and invitee is mentor
        const mentorId = role === "mentee" ? inviterId : inviteeId;
        const menteeId = role === "mentee" ? inviteeId : inviterId;

        const [newConnection] = await db
            .insert(MentorConnectionTable)
            .values({
                mentorId,
                menteeId,
                status: "pending",
            })
            .returning();

        return NextResponse.json(newConnection);
    } catch (error) {
        console.error("Failed to create invite:", error);
        return NextResponse.json(
            { error: "Failed to create invite" },
            { status: 500 }
        );
    }
}
