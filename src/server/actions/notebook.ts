"use server";

import { db } from "@/drizzle/db";
import { NotebookTable, NotebookFolderTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, desc, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- Folders ---

export async function getFolders() {
    const { userId } = await auth();
    if (!userId) return [];

    return await db.query.NotebookFolderTable.findMany({
        where: eq(NotebookFolderTable.userId, userId),
        orderBy: [desc(NotebookFolderTable.createdAt)],
    });
}

export async function createFolder(name: string, color?: string, parentId?: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await db.insert(NotebookFolderTable).values({
            userId,
            name,
            color: color || "#3B82F6",
            parentId: parentId || null,
        });
        revalidatePath("/private/notebook");
        return { success: true };
    } catch (error) {
        console.error("Error creating folder:", error);
        return { success: false, error: "Failed to create folder" };
    }
}

export async function deleteFolder(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        // Delete all notes in the folder
        await db.delete(NotebookTable)
            .where(and(
                eq(NotebookTable.folderId, id),
                eq(NotebookTable.userId, userId)
            ));

        // Delete the folder
        await db.delete(NotebookFolderTable)
            .where(and(
                eq(NotebookFolderTable.id, id),
                eq(NotebookFolderTable.userId, userId)
            ));

        revalidatePath("/private/notebook");
        return { success: true };
    } catch (error) {
        console.error("Error deleting folder:", error);
        return { success: false, error: "Failed to delete folder" };
    }
}

// --- Notebooks/Notes ---

export async function getNotebooks(folderId?: string) {
    const { userId } = await auth();
    if (!userId) return [];

    return await db.query.NotebookTable.findMany({
        where: and(
            eq(NotebookTable.userId, userId),
            folderId ? eq(NotebookTable.folderId, folderId) : isNull(NotebookTable.folderId)
        ),
        orderBy: [desc(NotebookTable.updatedAt)],
    });
}

export async function getNote(id: string) {
    const { userId } = await auth();
    if (!userId) return null;

    return await db.query.NotebookTable.findFirst({
        where: and(
            eq(NotebookTable.userId, userId),
            eq(NotebookTable.id, id)
        ),
        with: {
            folder: true,
        },
    });
}

export async function saveNote(id: string | null, data: {
    title: string;
    type: "trading_plan" | "loss_recap" | "template" | "weekly_review";
    content: any;
    folderId?: string | null;
    linkedTradeIds?: string[];
}) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        if (id) {
            // Update
            await db.update(NotebookTable)
                .set({
                    ...data,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(NotebookTable.id, id),
                    eq(NotebookTable.userId, userId)
                ));
        } else {
            // Create
            const [newNote] = await db.insert(NotebookTable).values({
                userId,
                ...data,
            }).returning();
            id = newNote.id;
        }

        revalidatePath("/private/notebook");
        return { success: true, id };
    } catch (error) {
        console.error("Error saving note:", error);
        return { success: false, error: "Failed to save note" };
    }
}

export async function deleteNote(id: string) {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Unauthorized" };

    try {
        await db.delete(NotebookTable)
            .where(and(
                eq(NotebookTable.id, id),
                eq(NotebookTable.userId, userId)
            ));
        revalidatePath("/private/notebook");
        return { success: true };
    } catch (error) {
        console.error("Error deleting note:", error);
        return { success: false, error: "Failed to delete note" };
    }
}
