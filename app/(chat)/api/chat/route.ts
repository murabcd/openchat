import { convertToCoreMessages, streamText } from "ai";
import { openai } from "@ai-sdk/openai";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

import { generateUUID, getMostRecentUserMessage } from "@/lib/utils";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { messages, id: chatId } = await req.json();

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = await convex.query(api.chats.getChatById, { chatId });

  if (!chat) {
    await convex.mutation(api.chats.createChat, {
      title:
        typeof userMessage.content === "string"
          ? userMessage.content.slice(0, 100)
          : "New chat",
      chatId,
    });
  }

  const userMessageId = generateUUID();

  await convex.mutation(api.chats.addMessage, {
    chatId,
    content:
      typeof userMessage.content === "string"
        ? userMessage.content
        : JSON.stringify(userMessage.content),
    role: "user",
    id: userMessageId,
  });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages,
    onFinish: async ({ text }) => {
      try {
        const messageId = generateUUID();
        await convex.mutation(api.chats.addMessage, {
          chatId,
          content: text,
          role: "assistant",
          id: messageId,
        });
      } catch (error) {
        console.error("Error saving chat messages:", error);
      }
    },
  });

  return result.toDataStreamResponse();
}
