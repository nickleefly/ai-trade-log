export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

type ClerkWebhookEvent = {
    type: string;
    data: {
        id: string;
        email_addresses?: Array<{
            email_address: string;
            id: string;
        }>;
        first_name?: string;
        last_name?: string;
        username?: string;
        image_url?: string;
    };
};

export async function POST(req: Request) {
    console.log("🔥🔥🔥 [clerk-webhook] REQUEST RECEIVED 🔥🔥🔥");
    console.log("[clerk-webhook] URL:", req.url);
    console.log("[clerk-webhook] Method:", req.method);

    const body = await req.text();

    let evt: ClerkWebhookEvent;

    try {
        // Parse webhook payload directly without signature verification
        console.warn("[clerk-webhook] ⚠️  Webhook verification disabled - use only in trusted environments");
        evt = JSON.parse(body);
    } catch (e) {
        console.error("[clerk-webhook] Failed to parse webhook payload:", e);
        return new Response("Invalid JSON payload", { status: 400 });
    }

    console.log("[clerk-webhook] Event received:", {
        type: evt.type,
        userId: evt.data.id,
    });

    // Handle user.created event
    if (evt.type === "user.created") {
        const { data } = evt;
        const clerkId = data.id;
        const email = data.email_addresses?.[0]?.email_address;

        // Validate required fields
        if (!email) {
            console.error("[clerk-webhook] No email found for user:", clerkId);
            return new Response("Email required", { status: 400 });
        }

        // Generate name from available data
        const name =
            data.first_name?.trim() ||
            data.username?.trim() ||
            email.split("@")[0] ||
            "User";

        try {
            // Check if user already exists
            const existing = await db.query.UserTable.findFirst({
                where: eq(UserTable.id, clerkId),
            });

            if (existing) {
                console.log("[clerk-webhook] User already exists:", clerkId);
                return new Response("User already exists", { status: 200 });
            }

            // Insert new user
            console.log("[clerk-webhook] Creating user:", { clerkId, email, name });

            await db.insert(UserTable).values({
                id: clerkId,
                email,
                name,
            });

            console.log("[clerk-webhook] ✅ User created successfully");
            return new Response("User created", { status: 201 });
        } catch (e: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            console.error("[clerk-webhook] Database error:", e);

            // Handle duplicate email error gracefully
            if (e.code === "23505" || e.message?.includes("unique constraint")) {
                console.log("[clerk-webhook] User already exists (unique constraint)");
                return new Response("User already exists", { status: 200 });
            }

            return new Response("Database error", { status: 500 });
        }
    }


    return new Response("Event processed", { status: 200 });
}