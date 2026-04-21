import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { processChatMessage } from "@/lib/actions/chat.actions";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const message = typeof body?.message === "string" ? body.message.trim() : "";

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const reply = await processChatMessage(message);

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
