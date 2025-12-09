import HomePage from "@/components/home-page/HomePage";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function Home() {
    const { userId } = await auth();
    if (userId) {
        let user = await db.query.UserTable.findFirst({
            where: eq(UserTable.id, userId),
        });

        // Auto-create user if they don't exist in database
        if (!user) {
            const clerkUser = await currentUser();
            const email = clerkUser?.emailAddresses?.[0]?.emailAddress || "";
            const name = clerkUser?.firstName || clerkUser?.username || email.split("@")[0] || "User";

            await db.insert(UserTable).values({
                id: userId,
                email,
                name,
            });

            // Fetch the newly created user
            user = await db.query.UserTable.findFirst({
                where: eq(UserTable.id, userId),
            });
        }
        // No redirect - logged in users can stay on home page and navigate manually
    }
    return (
        <Suspense
            fallback={
                <div className="flex-center h-screen">
                    <div className="running-algorithm">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                    </div>
                </div>
            }>
            <HomePage />
        </Suspense>
    );
}
