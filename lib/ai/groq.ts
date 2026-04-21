import Groq from "groq-sdk";
import { getStocksDetails, getNews } from "@/lib/actions/finnhub.actions";

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export type GroqChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
};

export const FINANCE_SYSTEM_PROMPT: GroqChatMessage = {
  role: "system",
  content:
    "You are a helpful financial assistant for Stockolio, a stock market tracking platform. " +
    "You ONLY answer questions related to finance, stock markets, investing, economics, and trading. " +
    "To answer questions about current stock prices, market trends, or recent news, you MUST use the provided tools to fetch real-time data. " +
    "When a user asks about a specific company (e.g. 'Apple', 'Intel'), figure out its stock symbol (e.g. 'AAPL', 'INTC') and call the appropriate tool. " +
    "Do NOT provide personal financial advice or specific buy/sell recommendations. " +
    "If you are unsure about something, say \"I don't know\". " +
    "Keep your responses concise, clear, and informative. " +
    "If a user asks about a topic unrelated to finance or investing, politely decline and remind them that you can only help with financial topics.",
};

const TOOLS: any[] = [
  {
    type: "function",
    function: {
      name: "get_stock_quote",
      description: "Get real-time stock quote, price, and market cap for a given stock symbol.",
      parameters: {
        type: "object",
        properties: {
          symbol: {
            type: "string",
            description: "The stock symbol (e.g. AAPL, MSFT, INTC)",
          },
        },
        required: ["symbol"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_market_news",
      description: "Get the latest market news or company-specific news.",
      parameters: {
        type: "object",
        properties: {
          symbols: {
            type: "array",
            items: {
              type: "string",
            },
            description: "An array of stock symbols to get news for (e.g. ['AAPL', 'MSFT']). Optional.",
          },
        },
      },
    },
  },
];

export async function generateReply(
  messages: GroqChatMessage[],
  model: string = "llama-3.3-70b-versatile"
): Promise<string> {
  let currentMessages = [...messages];

  // Try up to 3 tool call iterations
  for (let i = 0; i < 3; i++) {
    const completion = await groqClient.chat.completions.create({
      model: model,
      messages: currentMessages as any,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.5,
      max_tokens: 300,
    });

    const responseMessage = completion.choices[0]?.message;

    if (!responseMessage) {
      throw new Error("No response received from Groq API");
    }

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      // Add assistant message with tool_calls to history
      currentMessages.push(responseMessage as GroqChatMessage);

      // Execute tools
      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const args = JSON.parse(toolCall.function.arguments || "{}");
          
          let toolResult = "";

          try {
            if (functionName === "get_stock_quote") {
              const data = await getStocksDetails(args.symbol);
              toolResult = JSON.stringify(data);
            } else if (functionName === "get_market_news") {
              const data = await getNews(args.symbols);
              // limit to 3 news articles to save context
              toolResult = JSON.stringify(data.slice(0, 3));
            } else {
              toolResult = JSON.stringify({ error: "Unknown function" });
            }
          } catch (e: any) {
            toolResult = JSON.stringify({ error: e.message });
          }

          currentMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            name: functionName,
            content: toolResult,
          });
        }
      }
    } else {
      // Completed, return standard content
      return responseMessage.content?.trim() || "I couldn't generate a response.";
    }
  }

  return "I'm having trouble getting the information right now. Please try again.";
}
