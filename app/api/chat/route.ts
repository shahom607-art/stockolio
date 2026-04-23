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
        const model = typeof body?.model === "string" ? body.model : "llama-3.3-70b-versatile";

        if (!message) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        const reply = await processChatMessage(message, model);

        return NextResponse.json({ reply });
    } catch (error: any) {
        console.error("Chat API error:", error);
        if (error?.message === "RATE_LIMIT") {
             return NextResponse.json({ error: "Your daily limit is over, try it again tomorrow.", code: "RATE_LIMIT" }, { status: 429 });
        }
        return NextResponse.json(
            { error: "The AI service is down for some time. Please try again later.", code: "API_ERROR" },
            { status: 500 }
        );
    }
}
