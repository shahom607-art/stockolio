import {serve} from "inngest/next";
import {inngest} from "@/lib/inngest/client";
import {sendDailyNewsSummary, sendSignUpEmail} from "@/lib/inngest/functions";

const handler = serve({
    client: inngest,
    functions: [sendSignUpEmail, sendDailyNewsSummary],
})

export const GET = handler.GET;
export const POST = handler.POST;
export const PUT = handler.PUT;

