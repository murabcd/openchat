import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  generateText,
  streamText,
} from "ai";
import { openai } from "@ai-sdk/openai";

import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

import { generateUUID, getMostRecentUserMessage } from "@/lib/utils";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: Request) {
  const { messages, id: chatId }: { messages: Array<Message>; id: string } =
    await req.json();

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const chat = await convex.query(api.chats.getChatById, { chatId });
  const userMessageId = generateUUID();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      // Write user message ID to stream
      dataStream.writeData({
        type: "user-message-id",
        content: userMessageId,
      });

      // Create chat if it doesn't exist
      if (!chat) {
        const { text: generatedTitle } = await generateText({
          model: openai("gpt-4o-mini"),
          system: `
            - Generate a short title based on the first message a user begins a conversation with
            - Ensure it is not more than 20 characters long
            - The title should be a summary of the user's message
            - Do not use quotes or colons
          `,
          messages: [{ role: "user", content: userMessage.content }],
        });

        await convex.mutation(api.chats.createChat, {
          title: generatedTitle,
          chatId,
        });
      }

      // Save user message
      await convex.mutation(api.chats.addMessage, {
        chatId,
        content:
          typeof userMessage.content === "string"
            ? userMessage.content
            : JSON.stringify(userMessage.content),
        role: "user",
        id: userMessageId,
      });

      // Stream AI response
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
            dataStream.writeMessageAnnotation({
              messageIdFromServer: messageId,
            });
          } catch (error) {
            console.error("Error saving chat messages:", error);
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
  });
}
