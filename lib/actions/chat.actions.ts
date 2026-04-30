'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Chat } from '@/database/models/chat.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { generateReply, FINANCE_SYSTEM_PROMPT } from '@/lib/ai/groq';

const MAX_CONTEXT_MESSAGES = 8;
const MAX_MESSAGE_LENGTH = 500;

export async function processChatMessage(message: string, model: string = "llama-3.3-70b-versatile"): Promise<string> {
    const trimmed = message?.trim();

    if (!trimmed || trimmed.length === 0) {
        return "Please enter a message.";
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
        return `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`;
    }

    try {
        await connectToDatabase();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return "Unauthorized";
        }

        const userId = session.user.id;

        await new Chat({
            userId,
            role: "user",
            content: trimmed,
        }).save();

        const recentMessages = await Chat.find({ userId })
            .sort({ createdAt: -1 })
            .limit(MAX_CONTEXT_MESSAGES)
            .lean();

        const contextMessages: any[] = [
            FINANCE_SYSTEM_PROMPT,
            ...recentMessages.reverse().map((msg) => ({
                role: msg.role as "user" | "assistant",
                content: msg.content,
            })),
        ];

        const reply = await generateReply(contextMessages, model);

        await new Chat({
            userId,
            role: "assistant",
            content: reply,
        }).save();

        return reply;
    } catch (error: any) {
        console.error("Chat processing error:", error);
        if (error.message === "RATE_LIMIT") {
            throw new Error("RATE_LIMIT");
        }
        throw new Error("API_ERROR");
    }
}

export async function getChatHistory(): Promise<ChatMessageData[]> {
    try {
        await connectToDatabase();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return [];
        }

        const messages = await Chat.find({ userId: session.user.id })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        return messages.reverse().map((msg) => ({
            role: msg.role as "user" | "assistant",
            content: msg.content,
        }));
    } catch (error) {
        console.error("Error fetching chat history:", error);
        return [];
    }
}
