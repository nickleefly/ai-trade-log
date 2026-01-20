"use server";

import { db } from "@/drizzle/db";
import { AccountTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Account } from "@/types/dbSchema.types";

export async function getAllAccounts(): Promise<Account[]> {
    const { userId } = await auth();

    if (!userId) {
        return [];
    }

    try {
        const accounts = await db.query.AccountTable.findMany({
            where: eq(AccountTable.userId, userId),
        });

        return (accounts as any[]).map(acc => ({
            ...acc,
            createdAt: acc.createdAt.toISOString(),
        })) as Account[];
    } catch (err) {
        console.error("Error fetching accounts:", err);
        return [];
    }
}
