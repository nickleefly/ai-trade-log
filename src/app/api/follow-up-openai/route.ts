import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

function getOpenAI() {
    return new OpenAI({
        baseURL: process.env.OPENAI_API_BASEURL || 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY,
    });
}

export async function POST(request: Request) {
    const data = await request.json();
    const { trades, followUpQuestion, prevResponse } = data;
    const { userId } = await auth();

    if (!userId) {
        return new Response(
            JSON.stringify({
                error: "Not authenticated",
            }),
            {
                status: 401,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    const user = await db.query.UserTable.findFirst({
        where: eq(UserTable.id, userId),
    });

    if (user?.tokens === 1 || user?.tokens === 0) {
        return new Response(
            JSON.stringify({
                error: "You don't have enough tokens for this operation.",
            }),
            {
                status: 402,
                headers: { "Content-Type": "application/json" },
            }
        );
    }

    if (user && user.tokens !== null && user.tokens !== undefined) {
        const updatedTokens = user.tokens - 2;

        await db
            .update(UserTable)
            .set({ tokens: updatedTokens })
            .where(eq(UserTable.id, user.id))
            .execute();
    }

    try {
        const completion = await getOpenAI().chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Using the provided trade data and previous analysis, answer the follow-up question. Structure your response in a single object.\n\n{\n answer: [\n    // Array of responses addressing the follow-up question based on the trade data and previous analysis\n  ]\n}\n\nIMPORTANT: You must return ONLY valid JSON with no markdown formatting, no backticks, no code block markers, and no additional text before or after the JSON object. The response should begin with { and end with } and contain nothing else.",
                },
                {
                    role: "user",
                    content: "Trades: " +
                        JSON.stringify(trades) +
                        " Previous response: " +
                        prevResponse +
                        " Follow up question: " +
                        followUpQuestion,
                },
            ],
            model: process.env.OPENAI_MODEL || "deepseek-chat",
            max_tokens: 4000,
            temperature: 1,
        });

        return new Response(JSON.stringify(completion), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error: unknown) {
        console.error("Error processing request:", error);

        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return new Response(
            JSON.stringify({
                error: errorMessage,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}