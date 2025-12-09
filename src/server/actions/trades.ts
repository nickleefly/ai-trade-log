"use server";

import { db } from "@/drizzle/db";
import { TradeTable } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { newTradeFormSchema } from "@/zodSchema/schema";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { Trades } from "@/types";

export async function createNewTradeRecord(
    unsafeData: z.infer<typeof newTradeFormSchema>,
    id: string
): Promise<{ error: boolean } | undefined> {
    const { userId } = await auth();
    const { success, data } = newTradeFormSchema.safeParse(unsafeData);
    if (!success || userId == null) {
        return { error: true };
    }

    await db.insert(TradeTable).values({ ...data, userId, id });
}

export async function getAllTradeRecords(): Promise<Trades[]> {
    const { userId } = await auth();
    if (userId == null) {
        throw new Error("User not authenticated");
    }

    const data = await db.query.TradeTable.findMany({
        where: eq(TradeTable.userId, userId),
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const processedData = data.map(({ userId, ...tradeWithoutUserId }) => ({
        ...tradeWithoutUserId,
        notes: tradeWithoutUserId.notes ?? undefined,
        result: tradeWithoutUserId.result ?? undefined,
        closeDate: tradeWithoutUserId.closeDate ?? undefined,
        closeTime: tradeWithoutUserId.closeTime ?? undefined,
        entryPrice: tradeWithoutUserId.entryPrice ?? undefined,
        totalCost: tradeWithoutUserId.totalCost ?? undefined,
        quantity: tradeWithoutUserId.quantity ?? undefined,
        sellPrice: tradeWithoutUserId.sellPrice ?? undefined,
        quantitySold: tradeWithoutUserId.quantitySold ?? undefined,
        strategyId: tradeWithoutUserId.strategyId ?? undefined,
        appliedOpenRules: tradeWithoutUserId.appliedOpenRules ?? undefined,
        appliedCloseRules: tradeWithoutUserId.appliedCloseRules ?? undefined,
    }));

    return [...processedData].reverse();
}

export async function updateTradeRecord(
    unsafeData: z.infer<typeof newTradeFormSchema>,
    tradeId: string
): Promise<{ error: boolean } | undefined> {
    const { userId } = await auth();
    const { success, data } = newTradeFormSchema.safeParse(unsafeData);
    if (!success || userId == null) {
        return { error: true };
    }

    try {
        await db
            .update(TradeTable)
            .set({ ...data })
            .where(eq(TradeTable.id, tradeId));
    } catch (err) {
        console.log(err);
        return { error: true };
    }
    return;
}

export async function deleteTradeRecord(
    recordId: string
): Promise<{ error: boolean } | undefined> {
    try {
        await db.delete(TradeTable).where(eq(TradeTable.id, recordId));
    } catch (err) {
        console.log(err);
        return { error: true };
    }
    return;
}

export interface ImportTradeData {
    id: string;
    positionType: string;
    openDate: string;
    openTime: string;
    closeDate: string;
    closeTime: string;
    isActiveTrade: boolean;
    instrumentName: string;
    symbolName: string;
    entryPrice: string;
    sellPrice: string;
    quantity: string;
    result: string;
    deposit: string;
    notes: string;
}

export interface ImportResult {
    success: boolean;
    imported: number;
    skipped: number;
    errors: string[];
}

export async function importTradesFromCSV(
    trades: ImportTradeData[]
): Promise<ImportResult> {
    const { userId } = await auth();

    if (!userId) {
        return {
            success: false,
            imported: 0,
            skipped: 0,
            errors: ["Not authenticated"],
        };
    }

    const errors: string[] = [];
    let imported = 0;
    let skipped = 0;

    // Get existing trades to check for duplicates
    const existingTrades = await db.query.TradeTable.findMany({
        where: eq(TradeTable.userId, userId),
    });

    // Create a set of existing trade keys for duplicate detection
    const existingKeys = new Set(
        existingTrades.map(t =>
            `${t.symbolName}|${t.openDate}|${t.openTime}|${t.positionType}`
        )
    );

    for (const trade of trades) {
        try {
            // Check for duplicate
            const tradeKey = `${trade.symbolName}|${trade.openDate}|${trade.openTime}|${trade.positionType}`;
            if (existingKeys.has(tradeKey)) {
                skipped++;
                continue;
            }

            // Insert the trade
            await db.insert(TradeTable).values({
                id: trade.id,
                userId,
                positionType: trade.positionType,
                openDate: trade.openDate,
                openTime: trade.openTime,
                closeDate: trade.closeDate,
                closeTime: trade.closeTime,
                isActiveTrade: trade.isActiveTrade,
                instrumentName: trade.instrumentName,
                symbolName: trade.symbolName,
                entryPrice: trade.entryPrice || null,
                sellPrice: trade.sellPrice || null,
                quantity: trade.quantity || null,
                result: trade.result || null,
                deposit: trade.deposit || "0",
                notes: trade.notes || null,
            });

            // Add to existing keys to prevent duplicates within same import
            existingKeys.add(tradeKey);
            imported++;
        } catch (err) {
            console.error("Import error for trade:", trade.symbolName, trade.openDate, err);
            const errorMsg = err instanceof Error ? err.message : JSON.stringify(err);
            errors.push(`Failed to import trade ${trade.symbolName} at ${trade.openDate}: ${errorMsg}`);
        }
    }

    return {
        success: errors.length === 0,
        imported,
        skipped,
        errors,
    };
}
